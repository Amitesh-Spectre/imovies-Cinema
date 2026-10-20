import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSelectSeat } from '../redux/slices/bookingSlice';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SeatGrid = ({ showId }) => {
  const dispatch = useDispatch();
  const { lockSeat, unlockSeat } = useSocket();
  const { user } = useAuth();

  const {
    seatsGrid = [],
    selectedSeats = [],
    lockedSeatsByOthers = [],
    bookedSeats = [],
  } = useSelector((state) => state.booking);

  const isSeatSelected = (seatNum) => selectedSeats.some((s) => s.seatNumber === seatNum);
  const isSeatLockedByOther = (seatNum) => lockedSeatsByOthers.includes(seatNum);
  const isSeatBooked = (seatNum) => bookedSeats.includes(seatNum);

  const handleSeatClick = (seat) => {
    if (isSeatBooked(seat.seatNumber)) {
      toast.error(`Seat ${seat.seatNumber} is already booked!`);
      return;
    }

    if (isSeatLockedByOther(seat.seatNumber)) {
      toast.warning(`Seat ${seat.seatNumber} is temporarily held by another guest.`);
      return;
    }

    const alreadySelected = isSeatSelected(seat.seatNumber);

    if (alreadySelected) {
      // Unselect & unlock
      dispatch(toggleSelectSeat(seat));
      unlockSeat(showId, seat.seatNumber, user?.id || user?._id);
    } else {
      // Max 8 seats limit check
      if (selectedSeats.length >= 8) {
        toast.info('Maximum 8 seats allowed per booking.');
        return;
      }
      // Select & lock
      dispatch(toggleSelectSeat(seat));
      lockSeat(showId, seat.seatNumber, user?.id || user?._id);
    }
  };

  // Group seats by tier and row
  const tiersOrder = ['VIP', 'Platinum', 'Gold', 'Silver'];
  const seatsByTier = {
    VIP: {},
    Platinum: {},
    Gold: {},
    Silver: {},
  };

  seatsGrid.forEach((seat) => {
    const tier = seat.tier || 'Gold';
    if (!seatsByTier[tier]) seatsByTier[tier] = {};
    if (!seatsByTier[tier][seat.row]) seatsByTier[tier][seat.row] = [];
    seatsByTier[tier][seat.row].push(seat);
  });

  return (
    <div className="w-100 overflow-x-auto pb-4">
      {/* Theater Screen Projection Bar */}
      <div className="theater-screen-wrapper">
        <div className="theater-screen-bar"></div>
        <div className="theater-screen-text">
          <span>CINEMA SCREEN THIS WAY</span>
        </div>
      </div>

      {/* Seat Rows by Tier */}
      <div className="d-flex flex-column align-items-center gap-4 min-width-600">
        {tiersOrder.map((tierName) => {
          const rowsInTier = seatsByTier[tierName] || {};
          const rowKeys = Object.keys(rowsInTier).sort().reverse();
          if (rowKeys.length === 0) return null;

          const samplePrice = rowsInTier[rowKeys[0]]?.[0]?.price || 0;

          return (
            <div key={tierName} className="w-100 d-flex flex-column align-items-center">
              {/* Tier Header with Price */}
              <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-secondary border-opacity-25 w-75 justify-content-between">
                <span className="text-uppercase small fw-bold tracking-wider" style={{ color: tierName === 'VIP' ? '#f97316' : tierName === 'Platinum' ? '#c084fc' : tierName === 'Gold' ? '#fbbf24' : '#94a3b8' }}>
                  {tierName} TIER {tierName === 'VIP' && '— Recliner'}
                </span>
                <span className="small text-muted fw-semibold">
                  ${samplePrice}
                </span>
              </div>

              {/* Rows */}
              <div className="d-flex flex-column gap-2">
                {rowKeys.map((rowLetter) => {
                  const seatsInRow = rowsInTier[rowLetter].sort((a, b) => a.col - b.col);

                  return (
                    <div key={rowLetter} className="d-flex align-items-center gap-2">
                      {/* Row Label Left */}
                      <span className="text-muted small fw-bold text-center" style={{ width: '20px' }}>
                        {rowLetter}
                      </span>

                      {/* Seats in Row */}
                      <div className="d-flex align-items-center gap-2">
                        {seatsInRow.map((seat, idx) => {
                          const selected = isSeatSelected(seat.seatNumber);
                          const locked = isSeatLockedByOther(seat.seatNumber);
                          const booked = isSeatBooked(seat.seatNumber);

                          let seatClass = `seat-btn seat-${seat.tier.toLowerCase()}`;
                          if (booked) seatClass = 'seat-btn seat-booked';
                          else if (locked) seatClass = 'seat-btn seat-locked';
                          else if (selected) seatClass = 'seat-btn seat-selected';

                          return (
                            <React.Fragment key={seat.seatNumber}>
                              {/* Walkway gap in the middle (between col 5 and 6) */}
                              {idx === 5 && <div style={{ width: '24px' }}></div>}
                              <button
                                type="button"
                                className={seatClass}
                                disabled={booked || locked}
                                onClick={() => handleSeatClick(seat)}
                                title={`Seat ${seat.seatNumber} • ${seat.tier} • $${seat.price}`}
                              >
                                {seat.col}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Row Label Right */}
                      <span className="text-muted small fw-bold text-center" style={{ width: '20px' }}>
                        {rowLetter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mt-5 pt-3 border-top border-secondary border-opacity-25 small">
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-silver" style={{ width: '20px', height: '18px', cursor: 'default' }}></div>
          <span className="text-muted">Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-selected" style={{ width: '20px', height: '18px', cursor: 'default' }}></div>
          <span className="text-white fw-medium">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-locked" style={{ width: '20px', height: '18px', cursor: 'default' }}></div>
          <span className="text-warning">Held in Real-Time</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-booked" style={{ width: '20px', height: '18px', cursor: 'default' }}></div>
          <span className="text-muted">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
