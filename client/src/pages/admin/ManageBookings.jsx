import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Ticket, Search, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/admin/all', {
        params: {
          status: statusFilter,
          search: searchTerm,
        },
      });
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Admin Action: Cancel this booking and issue a full refund?')) return;
    try {
      const res = await api.put(`/bookings/${id}/cancel`, {
        reason: 'Cancelled by Cinema Administrator',
      });
      if (res.data.success) {
        toast.success('Booking cancelled and refund recorded');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling booking');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-muted small d-flex align-items-center gap-1 mb-1 text-decoration-none hover-white">
            <ArrowLeft size={14} /> Back to Admin Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Customer Cinema Bookings</h2>
        </div>

        <button onClick={fetchBookings} className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <form onSubmit={handleSearch} className="position-relative">
              <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control form-control-sm bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="Search by Booking ID (e.g. IMV-XXXXXX)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          <div className="col-md-6 d-flex justify-content-md-end gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'all' ? 'btn-danger' : 'btn-dark text-white-50 border-0'}`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'confirmed' ? 'btn-danger' : 'btn-dark text-white-50 border-0'}`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'cancelled' ? 'btn-danger' : 'btn-dark text-white-50 border-0'}`}
            >
              Cancelled & Refunded
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5 text-danger">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 text-muted small">
            No bookings found matching query.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-muted small">
                  <th>BOOKING ID</th>
                  <th>CUSTOMER</th>
                  <th>MOVIE</th>
                  <th>THEATRE & SHOW</th>
                  <th>SEATS</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="text-white fw-bold small">{b.bookingId}</span>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="text-white small fw-medium">{b.user?.name || 'Guest User'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{b.user?.email}</div>
                    </td>
                    <td className="text-white small">{b.movie?.title}</td>
                    <td>
                      <div className="text-white-50 small">{b.theatre?.name}</div>
                      <div className="text-warning small" style={{ fontSize: '0.75rem' }}>
                        {b.show?.showDate} • {b.show?.showTime}
                      </div>
                    </td>
                    <td>
                      <span className="text-info small fw-bold">
                        {b.seats?.map((s) => s.seatNumber).join(', ')}
                      </span>
                    </td>
                    <td className="text-white small fw-bold">${b.totalAmount}</td>
                    <td>
                      {b.bookingStatus === 'confirmed' ? (
                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
                          Confirmed
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      {b.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="btn btn-sm btn-outline-danger p-1 px-2"
                          title="Cancel & Refund"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
