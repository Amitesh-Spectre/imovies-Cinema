import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Calendar, Plus, Trash2, ArrowLeft, Clock, Film, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ManageShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    movie: '',
    theatre: '',
    screenNumber: 1,
    screenName: 'IMAX Audi 1',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:45 PM',
    format: 'IMAX 3D',
    language: 'English',
    silverPrice: 150,
    goldPrice: 220,
    platinumPrice: 320,
    vipPrice: 450,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies?limit=50'),
        api.get('/theatres'),
      ]);

      if (showsRes.data.success) setShows(showsRes.data.shows || []);
      if (moviesRes.data.success) {
        const mList = moviesRes.data.movies || [];
        setMovies(mList);
        if (mList.length > 0) setFormData((prev) => ({ ...prev, movie: mList[0]._id }));
      }
      if (theatresRes.data.success) {
        const tList = theatresRes.data.theatres || [];
        setTheatres(tList);
        if (tList.length > 0) setFormData((prev) => ({ ...prev, theatre: tList[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled show?')) return;
    try {
      const res = await api.delete(`/shows/${id}`);
      if (res.data.success) {
        toast.success('Show cancelled and removed');
        setShows((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete show');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.movie || !formData.theatre) {
      toast.warning('Please select both a movie and a theatre');
      return;
    }

    const payload = {
      movie: formData.movie,
      theatre: formData.theatre,
      screenNumber: formData.screenNumber,
      screenName: formData.screenName,
      showDate: formData.showDate,
      showTime: formData.showTime,
      format: formData.format,
      language: formData.language,
      pricing: {
        silver: Number(formData.silverPrice),
        gold: Number(formData.goldPrice),
        platinum: Number(formData.platinumPrice),
        vip: Number(formData.vipPrice),
      },
    };

    try {
      const res = await api.post('/shows', payload);
      if (res.data.success) {
        toast.success('Show scheduled successfully with 80 tiered seats!');
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error scheduling show');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-muted small d-flex align-items-center gap-1 mb-1 text-decoration-none hover-white">
            <ArrowLeft size={14} /> Back to Admin Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Showtime Scheduling</h2>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-cinema">
          <Plus size={16} /> Schedule Show
        </button>
      </div>

      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5 text-danger">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-5 text-muted small">
            No shows scheduled currently. Click "Schedule Show" to create one.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-muted small">
                  <th>MOVIE</th>
                  <th>THEATRE</th>
                  <th>DATE & TIME</th>
                  <th>FORMAT</th>
                  <th>SEATS AVAILABLE</th>
                  <th>PRICING (SILVER / GOLD / PLAT / VIP)</th>
                  <th className="text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <span className="text-white fw-bold small">{s.movie?.title}</span>
                    </td>
                    <td>
                      <div className="text-white small">{s.theatre?.name}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {s.screenName} • {s.theatre?.city}
                      </div>
                    </td>
                    <td>
                      <div className="text-white small fw-medium">{s.showDate}</div>
                      <div className="text-warning small fw-bold">{s.showTime}</div>
                    </td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                        {s.format}
                      </span>
                    </td>
                    <td>
                      <span className="text-success small fw-bold">
                        {s.availableSeatsCount} / {s.totalSeats || 80}
                      </span>
                    </td>
                    <td className="text-white-50 small">
                      ${s.pricing?.silver} / ${s.pricing?.gold} / ${s.pricing?.platinum} / ${s.pricing?.vip}
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="btn btn-sm btn-outline-danger p-1 px-2"
                        title="Cancel Show"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1100 }}>
          <div className="glass-panel p-4 w-100 shadow-lg" style={{ maxWidth: '600px', backgroundColor: '#131926' }}>
            <h4 className="text-white fw-bold mb-3">Schedule Movie Showtime</h4>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-muted small mb-1">Select Movie</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.movie}
                    onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
                    required
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Select Theatre</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.theatre}
                    onChange={(e) => setFormData({ ...formData, theatre: e.target.value })}
                    required
                  >
                    {theatres.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Show Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.showDate}
                    onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Show Time Slot</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.showTime}
                    onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
                  >
                    <option value="10:30 AM">10:30 AM (Morning)</option>
                    <option value="02:15 PM">02:15 PM (Matinee)</option>
                    <option value="06:45 PM">06:45 PM (Prime Evening)</option>
                    <option value="09:30 PM">09:30 PM (Night Show)</option>
                    <option value="11:45 PM">11:45 PM (Midnight Special)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Screen Format</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="2D">Standard 2D</option>
                    <option value="3D">RealD 3D</option>
                    <option value="4DX">4DX Motion</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Screen / Auditorium Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.screenName}
                    onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                    required
                  />
                </div>

                {/* Tier Pricing Configuration */}
                <div className="col-12 mt-3 pt-3 border-top border-secondary border-opacity-25">
                  <label className="text-white small fw-bold mb-2 d-block">
                    Seat Tier Pricing ($)
                  </label>
                  <div className="row g-2">
                    <div className="col-3">
                      <span className="text-muted small d-block mb-1">Silver</span>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white shadow-none"
                        value={formData.silverPrice}
                        onChange={(e) => setFormData({ ...formData, silverPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-3">
                      <span className="text-warning small d-block mb-1">Gold</span>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white shadow-none"
                        value={formData.goldPrice}
                        onChange={(e) => setFormData({ ...formData, goldPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-3">
                      <span className="text-info small d-block mb-1">Platinum</span>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white shadow-none"
                        value={formData.platinumPrice}
                        onChange={(e) => setFormData({ ...formData, platinumPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-3">
                      <span className="text-danger small d-block mb-1">VIP Recliner</span>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white shadow-none"
                        value={formData.vipPrice}
                        onChange={(e) => setFormData({ ...formData, vipPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary border-opacity-25">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm btn-cinema-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-cinema">
                  Schedule Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShows;
