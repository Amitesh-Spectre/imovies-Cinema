import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { CheckCircle2, Printer, Ticket, Calendar, Clock, MapPin, QrCode, ArrowRight } from 'lucide-react';

const BookingSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking && id) {
      api
        .get(`/bookings/${id}`)
        .then((res) => {
          if (res.data.success) {
            setBooking(res.data.booking);
          }
        })
        .catch((err) => {
          console.error('Failed to load booking:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-danger">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center text-white">
        <h4>Booking details unavailable</h4>
        <Link to="/dashboard" className="btn btn-cinema mt-3">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Confirmation Message */}
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-success bg-opacity-20 text-success mb-3">
          <CheckCircle2 size={44} />
        </div>
        <h2 className="text-white fw-bold">Booking Confirmed!</h2>
        <p className="text-muted small">
          We have sent your confirmation to your registered email address. Present this e-ticket at the cinema entrance.
        </p>
      </div>

      {/* Modern Cinema E-Ticket Pass */}
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="eticket-container">
            <div className="eticket-cutout-left"></div>
            <div className="eticket-cutout-right"></div>
            <div className="eticket-perforation"></div>

            {/* Ticket Header */}
            <div className="p-4 bg-black bg-opacity-50 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Ticket size={22} className="text-danger" />
                <span className="text-white fw-bold tracking-wider fs-6">IMOVIES CINEMA PASS</span>
              </div>
              <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1">
                PAID & CONFIRMED
              </span>
            </div>

            {/* Ticket Body */}
            <div className="p-4">
              <div className="d-flex gap-4 mb-4">
                <img
                  src={booking.movie?.poster}
                  alt={booking.movie?.title}
                  width="90"
                  height="125"
                  className="rounded object-fit-cover shadow"
                />
                <div>
                  <h4 className="text-white fw-bold mb-1">{booking.movie?.title}</h4>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-danger">{booking.show?.format || 'IMAX 3D'}</span>
                    <span className="badge bg-dark border border-secondary text-white-50">
                      {booking.movie?.language?.join(', ') || 'English'}
                    </span>
                  </div>
                  <div className="text-white-50 small d-flex align-items-center gap-1 mb-1">
                    <MapPin size={13} className="text-danger" />
                    {booking.theatre?.name}
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                    {booking.theatre?.address}
                  </div>
                </div>
              </div>

              {/* Grid Details */}
              <div className="row g-3 py-3 border-top border-secondary border-opacity-25">
                <div className="col-4">
                  <span className="text-muted small d-block mb-1">DATE</span>
                  <span className="text-white fw-semibold small">
                    {booking.show?.showDate}
                  </span>
                </div>
                <div className="col-4">
                  <span className="text-muted small d-block mb-1">TIME</span>
                  <span className="text-warning fw-semibold small">
                    {booking.show?.showTime}
                  </span>
                </div>
                <div className="col-4">
                  <span className="text-muted small d-block mb-1">AUDITORIUM</span>
                  <span className="text-white fw-semibold small">
                    {booking.show?.screenName || 'Screen 1'}
                  </span>
                </div>
              </div>

              {/* Seats Display */}
              <div className="p-3 rounded bg-black bg-opacity-40 my-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">SEATS ALLOCATED:</span>
                  <span className="text-info fw-bold fs-5">
                    {booking.seats?.map((s) => s.seatNumber).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Lower Stub (Below Perforation) */}
            <div className="p-4 pt-5 bg-black bg-opacity-30 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small d-block" style={{ fontSize: '0.7rem' }}>
                  BOOKING REFERENCE ID
                </span>
                <span className="text-white fw-bold fs-5 tracking-wide">
                  {booking.bookingId}
                </span>
                <span className="text-muted small d-block mt-1" style={{ fontSize: '0.7rem' }}>
                  Total Paid: ${booking.totalAmount}
                </span>
              </div>

              <div className="text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${booking.qrCode || booking.bookingId}`}
                  alt="Ticket QR"
                  width="80"
                  height="80"
                  className="rounded p-1 bg-white"
                />
                <span className="text-muted d-block mt-1" style={{ fontSize: '0.65rem' }}>
                  Scan at Gate
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3 mt-4 print-hide">
            <button onClick={handlePrint} className="btn btn-cinema-outline flex-grow-1 py-2">
              <Printer size={16} /> Print E-Ticket
            </button>
            <Link to="/dashboard" className="btn btn-cinema flex-grow-1 py-2">
              View All Bookings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
