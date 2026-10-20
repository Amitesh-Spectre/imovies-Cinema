import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
  Film,
  Building,
  Calendar,
  Ticket,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentBookings(res.data.recentBookings || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      toast.error('Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container py-5">
      {/* Admin Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger">ADMINISTRATOR PORTAL</span>
          </div>
          <h2 className="text-white fw-bold mb-0">Cinema Operations & Analytics</h2>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/movies" className="btn btn-sm btn-cinema">
            <Plus size={15} /> Add Movie
          </Link>
          <Link to="/admin/shows" className="btn btn-sm btn-cinema-outline">
            <Calendar size={15} /> Schedule Show
          </Link>
          <button onClick={fetchStats} className="btn btn-sm btn-cinema-outline">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="text-center py-5 text-danger">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-5">
            {/* Total Revenue */}
            <div className="col-xl-3 col-sm-6">
              <div className="glass-panel p-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">TOTAL REVENUE</span>
                  <div className="p-2 rounded bg-success bg-opacity-20 text-success">
                    <DollarSign size={20} />
                  </div>
                </div>
                <h3 className="text-white fw-bold mb-1">${stats?.totalRevenue?.toLocaleString() || 0}</h3>
                <span className="text-success small d-flex align-items-center gap-1">
                  <TrendingUp size={13} /> {stats?.totalTicketsSold || 0} tickets sold
                </span>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="col-xl-3 col-sm-6">
              <div className="glass-panel p-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">TOTAL BOOKINGS</span>
                  <div className="p-2 rounded bg-danger bg-opacity-20 text-danger">
                    <Ticket size={20} />
                  </div>
                </div>
                <h3 className="text-white fw-bold mb-1">{stats?.totalBookings || 0}</h3>
                <Link to="/admin/bookings" className="text-danger small hover-white">
                  Manage all bookings &rarr;
                </Link>
              </div>
            </div>

            {/* Active Movies */}
            <div className="col-xl-3 col-sm-6">
              <div className="glass-panel p-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">CATALOG MOVIES</span>
                  <div className="p-2 rounded bg-primary bg-opacity-20 text-primary">
                    <Film size={20} />
                  </div>
                </div>
                <h3 className="text-white fw-bold mb-1">{stats?.totalMovies || 0}</h3>
                <Link to="/admin/movies" className="text-primary small hover-white">
                  Manage catalog &rarr;
                </Link>
              </div>
            </div>

            {/* Theatres */}
            <div className="col-xl-3 col-sm-6">
              <div className="glass-panel p-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">ACTIVE THEATRES</span>
                  <div className="p-2 rounded bg-warning bg-opacity-20 text-warning">
                    <Building size={20} />
                  </div>
                </div>
                <h3 className="text-white fw-bold mb-1">{stats?.totalTheatres || 0}</h3>
                <Link to="/admin/theatres" className="text-warning small hover-white">
                  Manage cinemas &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="row g-3 mb-5">
            <div className="col-md-3">
              <Link to="/admin/movies" className="glass-panel p-3 text-center d-block glass-card-hover text-decoration-none">
                <Film size={28} className="text-danger mb-2" />
                <h6 className="text-white fw-bold mb-1">Movie Catalog</h6>
                <span className="text-muted small">Add, update, or remove movies</span>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/admin/theatres" className="glass-panel p-3 text-center d-block glass-card-hover text-decoration-none">
                <Building size={28} className="text-warning mb-2" />
                <h6 className="text-white fw-bold mb-1">Cinema Theatres</h6>
                <span className="text-muted small">Screen & city configurations</span>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/admin/shows" className="glass-panel p-3 text-center d-block glass-card-hover text-decoration-none">
                <Calendar size={28} className="text-info mb-2" />
                <h6 className="text-white fw-bold mb-1">Show Scheduling</h6>
                <span className="text-muted small">Time slots & tier ticket pricing</span>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/admin/bookings" className="glass-panel p-3 text-center d-block glass-card-hover text-decoration-none">
                <Ticket size={28} className="text-success mb-2" />
                <h6 className="text-white fw-bold mb-1">Customer Bookings</h6>
                <span className="text-muted small">Verify passes and manage refunds</span>
              </Link>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="glass-panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Recent Customer Bookings</h5>
              <Link to="/admin/bookings" className="btn btn-sm btn-cinema-outline">
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-4 text-muted small">No recent bookings</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted small">
                      <th>BOOKING ID</th>
                      <th>CUSTOMER</th>
                      <th>MOVIE</th>
                      <th>THEATRE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <span className="fw-bold text-white small">{b.bookingId}</span>
                        </td>
                        <td>
                          <div className="text-white small fw-medium">{b.user?.name || 'Customer'}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{b.user?.email}</div>
                        </td>
                        <td className="text-white small">{b.movie?.title}</td>
                        <td className="text-white-50 small">{b.theatre?.name}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
