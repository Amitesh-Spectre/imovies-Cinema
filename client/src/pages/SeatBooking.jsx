import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchShowDetails,
  setInitialSeatState,
  socketSeatLocked,
  socketSeatUnlocked,
  socketSeatsBatchUnlocked,
  socketSeatsBooked,
  socketSeatsReleased,
  clearSelectedSeats,
} from '../redux/slices/bookingSlice';
import SeatGrid from '../components/SeatGrid';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const SeatBooking = () => {
  const { showId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket, joinShowRoom } = useSocket();
  const { user, isAuthenticated } = useAuth();

  const { currentShow, selectedSeats, pricing, loading } = useSelector(
    (state) => state.booking
  );

  // Load show details and join Socket.io room
  useEffect(() => {
    if (showId) {
      dispatch(fetchShowDetails(showId));
      joinShowRoom(showId, user?.id || user?._id);
    }
  }, [showId, user, dispatch]);

  // Set up real-time socket listeners for seat lock/unlock/booked events
  useEffect(() => {
    if (!socket) return;

    const handleInitialSeatState = (data) => {
      dispatch(setInitialSeatState(data));
    };

    const handleSeatLocked = (data) => {
      dispatch(socketSeatLocked({ ...data, currentUserId: user?.id || user?._id }));
    };

    const handleSeatUnlocked = (data) => {
      dispatch(socketSeatUnlocked(data));
    };

    const handleSeatsBatchUnlocked = (data) => {
      dispatch(socketSeatsBatchUnlocked(data));
    };

    const handleSeatsBooked = (data) => {
      dispatch(socketSeatsBooked(data));
    };

    const handleSeatsReleased = (data) => {
      dispatch(socketSeatsReleased(data));
    };

    socket.on('initial_seat_state', handleInitialSeatState);
    socket.on('seat_locked', handleSeatLocked);
    socket.on('seat_unlocked', handleSeatUnlocked);
    socket.on('seats_batch_unlocked', handleSeatsBatchUnlocked);
    socket.on('seats_booked', handleSeatsBooked);
    socket.on('seats_released', handleSeatsReleased);

    return () => {
      socket.off('initial_seat_state', handleInitialSeatState);
      socket.off('seat_locked', handleSeatLocked);
      socket.off('seat_unlocked', handleSeatUnlocked);
      socket.off('seats_batch_unlocked', handleSeatsBatchUnlocked);
      socket.off('seats_booked', handleSeatsBooked);
      socket.off('seats_released', handleSeatsReleased);
    };
  }, [socket, user, dispatch]);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to finalize your booking.');
      navigate('/login', { state: { from: `/shows/${showId}/book` } });
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat to proceed.');
      return;
    }

    navigate('/checkout');
  };

  if (loading && !currentShow) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-danger">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!currentShow) {
    return (
      <div className="container py-5 text-center text-white">
        <h4>Showtime not found</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Show Header Info */}
      <div className="glass-panel p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger">{currentShow.format || 'IMAX 3D'}</span>
              <span className="badge bg-dark border border-secondary text-white-50">
                {currentShow.language}
              </span>
            </div>
            <h3 className="text-white fw-bold mb-1">{currentShow.movie?.title}</h3>
            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
              <span className="d-flex align-items-center gap-1 text-white-50">
                <MapPin size={14} className="text-danger" />
                {currentShow.theatre?.name} • {currentShow.screenName}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1 text-white-50">
                <Calendar size={14} />
                {currentShow.showDate}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1 text-warning fw-semibold">
                <Clock size={14} />
                {currentShow.showTime}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => dispatch(clearSelectedSeats())}
              disabled={selectedSeats.length === 0}
              className="btn btn-sm btn-cinema-outline"
            >
              <RotateCcw size={14} /> Clear Selection
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Interactive Seat Grid (Left) */}
        <div className="col-lg-8">
          <div className="glass-panel p-4">
            <SeatGrid showId={showId} />
          </div>
        </div>

        {/* Booking Summary Sidebar (Right) */}
        <div className="col-lg-4">
          <div className="glass-panel p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <Ticket size={18} className="text-danger" />
              Booking Summary
            </h5>

            {/* Selected Seats Tags */}
            <div className="mb-3">
              <label className="text-muted small mb-2 d-block">
                Selected Seats ({selectedSeats.length}/8):
              </label>
              {selectedSeats.length === 0 ? (
                <div className="p-3 text-center rounded bg-black bg-opacity-25 text-muted small">
                  Click on the seats map to select your seats
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.seatNumber}
                      className="badge p-2 px-3 rounded-pill d-flex align-items-center gap-2"
                      style={{
                        background: '#00f2fe',
                        color: '#0b0f19',
                        fontWeight: 700,
                      }}
                    >
                      {s.seatNumber} ({s.tier}) • ${s.price}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="py-3 border-top border-bottom border-secondary border-opacity-25 d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between text-muted">
                <span>Tickets Subtotal</span>
                <span className="text-white">${pricing.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Convenience Fee</span>
                <span className="text-white">${pricing.convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Taxes (5%)</span>
                <span className="text-white">${pricing.tax}</span>
              </div>
            </div>

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center my-3">
              <span className="text-white fw-bold">Total Amount</span>
              <span className="fs-4 fw-black text-danger">
                ${pricing.totalAmount}
              </span>
            </div>

            {/* Guarantee Badge */}
            <div className="d-flex align-items-center gap-2 text-muted small mb-3">
              <ShieldCheck size={16} className="text-success" />
              <span>Real-time reserved lock active for 8 minutes</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0}
              className="btn btn-cinema w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
            >
              Proceed to Payment
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
