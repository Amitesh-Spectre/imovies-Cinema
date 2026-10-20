import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import {
  Ticket,
  User,
  Clock,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Printer,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'profile'
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Cancellation State
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setUpcomingBookings(res.data.upcoming || []);
        setPastBookings(res.data.past || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A 100% refund will be processed to your payment method.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`, {
        reason: 'Customer initiated cancellation',
      });
      if (res.data.success) {
        toast.success('Booking cancelled successfully. Refund initiated.');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="container py-5">
      {/* User Header */}
      <div className="glass-panel p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="rounded-circle border border-danger p-1"
              width="64"
              height="64"
              style={{ objectFit: 'cover' }}
            />
            <div>
              <h3 className="text-white fw-bold mb-1">{user?.name}</h3>
              <div className="d-flex align-items-center gap-2 text-muted small">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={fetchBookings}
              className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${
            activeTab === 'upcoming'
              ? 'btn-danger shadow'
              : 'btn-dark text-white-50 border-0 bg-transparent'
          }`}
        >
          Upcoming Bookings ({upcomingBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${
            activeTab === 'past'
              ? 'btn-danger shadow'
              : 'btn-dark text-white-50 border-0 bg-transparent'
          }`}
        >
          Past & Cancelled ({pastBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${
            activeTab === 'profile'
              ? 'btn-danger shadow'
              : 'btn-dark text-white-50 border-0 bg-transparent'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-5 text-danger">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : activeTab === 'upcoming' ? (
        /* Upcoming Bookings Tab */
        upcomingBookings.length === 0 ? (
          <div className="glass-panel text-center py-5">
            <Ticket size={40} className="text-muted mb-3" />
            <h5 className="text-white mb-2">No Upcoming Bookings</h5>
            <p className="text-muted small mb-3">
              You haven't booked any movies yet. Catch the latest blockbusters now!
            </p>
            <a href="/movies" className="btn btn-sm btn-cinema">
              Browse Movies
            </a>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {upcomingBookings.map((b) => (
              <div key={b._id} className="glass-panel p-4">
                <div className="row g-3 align-items-center">
                  <div className="col-lg-2 col-md-3 col-4">
                    <img
                      src={b.movie?.poster}
                      alt={b.movie?.title}
                      className="rounded img-fluid object-fit-cover shadow"
                      style={{ maxHeight: '140px', width: '100%' }}
                    />
                  </div>

                  <div className="col-lg-6 col-md-5 col-8">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-danger">{b.show?.format || 'IMAX 3D'}</span>
                      <span className="text-muted small">ID: {b.bookingId}</span>
                    </div>
                    <h5 className="text-white fw-bold mb-1">{b.movie?.title}</h5>
                    <div className="text-white-50 small mb-2 d-flex align-items-center gap-1">
                      <MapPin size={14} className="text-danger flex-shrink-0" />
                      {b.theatre?.name} • {b.show?.screenName || 'Screen 1'}
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                      <span className="d-flex align-items-center gap-1 text-white">
                        <Calendar size={14} /> {b.show?.showDate}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1 text-warning fw-semibold">
                        <Clock size={14} /> {b.show?.showTime}
                      </span>
                    </div>

                    <div className="mt-2 text-info small fw-bold">
                      Seats: {b.seats?.map((s) => s.seatNumber).join(', ')}
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-4 text-md-end">
                    <div className="mb-3">
                      <span className="text-muted small d-block">Paid Total:</span>
                      <span className="fs-4 fw-black text-white">${b.totalAmount}</span>
                    </div>

                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                      <a
                        href={`/booking-success/${b._id}`}
                        className="btn btn-sm btn-cinema-outline py-2"
                      >
                        <Printer size={15} /> View Pass
                      </a>
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={cancellingId === b._id}
                        className="btn btn-sm btn-outline-danger py-2"
                      >
                        {cancellingId === b._id ? 'Cancelling...' : 'Cancel Ticket'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'past' ? (
        /* Past & Cancelled Tab */
        pastBookings.length === 0 ? (
          <div className="glass-panel text-center py-5 text-muted small">
            No past or cancelled bookings on record.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {pastBookings.map((b) => (
              <div key={b._id} className="glass-panel p-4 opacity-75">
                <div className="row g-3 align-items-center">
                  <div className="col-lg-2 col-md-3 col-4">
                    <img
                      src={b.movie?.poster}
                      alt={b.movie?.title}
                      className="rounded img-fluid object-fit-cover"
                      style={{ maxHeight: '120px', width: '100%' }}
                    />
                  </div>

                  <div className="col-lg-7 col-md-6 col-8">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {b.bookingStatus === 'cancelled' ? (
                        <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                          CANCELLED & REFUNDED
                        </span>
                      ) : (
                        <span className="badge bg-secondary">COMPLETED</span>
                      )}
                      <span className="text-muted small">ID: {b.bookingId}</span>
                    </div>
                    <h5 className="text-white fw-bold mb-1">{b.movie?.title}</h5>
                    <div className="text-muted small mb-1">
                      {b.theatre?.name} • {b.show?.showDate} {b.show?.showTime}
                    </div>
                    <div className="text-muted small">
                      Seats: {b.seats?.map((s) => s.seatNumber).join(', ')} • ${b.totalAmount}
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-3 text-md-end">
                    <a
                      href={`/booking-success/${b._id}`}
                      className="btn btn-sm btn-cinema-outline"
                    >
                      View Receipt
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Profile Tab */
        <div className="glass-panel p-4 max-w-xl mx-auto" style={{ maxWidth: '600px' }}>
          <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
            <User size={20} className="text-danger" />
            Profile Information
          </h4>

          <form onSubmit={handleProfileUpdate}>
            <div className="mb-3">
              <label className="text-muted small mb-1">Full Name</label>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white py-2 shadow-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-muted small mb-1">Email Address</label>
              <input
                type="email"
                className="form-control bg-dark border-secondary text-white-50 py-2 shadow-none"
                value={user?.email || ''}
                disabled
              />
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Email address cannot be modified.
              </span>
            </div>

            <div className="mb-4">
              <label className="text-muted small mb-1">Phone Number</label>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white py-2 shadow-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0100"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-cinema px-4 py-2"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
