import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Film, Plus, Edit2, Trash2, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    language: 'English',
    duration: 150,
    releaseDate: new Date().toISOString().split('T')[0],
    poster: '',
    banner: '',
    trailerUrl: '',
    rating: 8.0,
    status: 'now_showing',
    certification: 'UA',
    director: '',
    cast: 'Actor 1, Actor 2',
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies?limit=100');
      if (res.data.success) {
        setMovies(res.data.movies || []);
      }
    } catch (err) {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      genre: 'Action, Adventure',
      language: 'English',
      duration: 140,
      releaseDate: new Date().toISOString().split('T')[0],
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: 'https://www.youtube.com',
      rating: 8.2,
      status: 'now_showing',
      certification: 'UA',
      director: 'Director Name',
      cast: 'Lead Actor, Supporting Actor',
    });
    setShowModal(true);
  };

  const openEditModal = (movie) => {
    setEditingId(movie._id);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre.join(', '),
      language: movie.language.join(', '),
      duration: movie.duration,
      releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
      poster: movie.poster,
      banner: movie.banner,
      trailerUrl: movie.trailerUrl,
      rating: movie.rating,
      status: movie.status,
      certification: movie.certification,
      director: movie.director,
      cast: movie.cast?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie and all its scheduled shows?')) return;
    try {
      const res = await api.delete(`/movies/${id}`);
      if (res.data.success) {
        toast.success('Movie deleted successfully');
        fetchMovies();
      }
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      genre: formData.genre.split(',').map((s) => s.trim()).filter(Boolean),
      language: formData.language.split(',').map((s) => s.trim()).filter(Boolean),
      cast: formData.cast.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/movies/${editingId}`, payload);
        toast.success('Movie updated successfully');
      } else {
        await api.post('/movies', payload);
        toast.success('Movie created successfully');
      }
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving movie');
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-muted small d-flex align-items-center gap-1 mb-1 text-decoration-none hover-white">
            <ArrowLeft size={14} /> Back to Admin Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Manage Movie Catalog</h2>
        </div>

        <button onClick={openAddModal} className="btn btn-cinema">
          <Plus size={16} /> Add New Movie
        </button>
      </div>

      {/* Movies Table */}
      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5 text-danger">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-muted small">
                  <th>POSTER</th>
                  <th>TITLE</th>
                  <th>GENRE</th>
                  <th>LANGUAGE</th>
                  <th>DURATION</th>
                  <th>RATING</th>
                  <th>STATUS</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td style={{ width: '60px' }}>
                      <img
                        src={m.poster}
                        alt={m.title}
                        width="46"
                        height="64"
                        className="rounded object-fit-cover shadow-sm"
                      />
                    </td>
                    <td>
                      <div className="text-white fw-bold small">{m.title}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {m.director}
                      </div>
                    </td>
                    <td className="text-white-50 small">{m.genre?.slice(0, 2).join(', ')}</td>
                    <td className="text-white-50 small">{m.language?.join(', ')}</td>
                    <td className="text-white-50 small">{m.duration} mins</td>
                    <td>
                      <span className="text-warning small fw-bold d-flex align-items-center gap-1">
                        <Star size={13} fill="#ffd700" color="#ffd700" />
                        {m.rating?.toFixed(1) || '8.0'}
                      </span>
                    </td>
                    <td>
                      {m.status === 'now_showing' ? (
                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
                          Now Showing
                        </span>
                      ) : (
                        <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50">
                          Coming Soon
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="btn btn-sm btn-outline-light p-1 px-2"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="btn btn-sm btn-outline-danger p-1 px-2"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1100 }}>
          <div className="glass-panel p-4 w-100 shadow-lg" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#131926' }}>
            <h4 className="text-white fw-bold mb-3">
              {editingId ? 'Edit Movie Details' : 'Add New Movie to Catalog'}
            </h4>

            <form onSubmit={handleFormSubmit}>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="text-muted small mb-1">Movie Title</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-muted small mb-1">Status</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="text-muted small mb-1">Synopsis / Description</label>
                  <textarea
                    rows="3"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    placeholder="Action, Sci-Fi, Drama"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    placeholder="English, Hindi"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-muted small mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-muted small mb-1">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-muted small mb-1">Certification</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="A">A (Adults Only)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Director</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Cast (comma separated)</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="text-muted small mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="text-muted small mb-1">YouTube Trailer Embed / URL</label>
                  <input
                    type="url"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                  />
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
                  {editingId ? 'Save Changes' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMovies;
