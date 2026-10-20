import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Building, Plus, Edit2, Trash2, ArrowLeft, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ManageTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Mumbai',
    address: '',
    state: '',
    contactPhone: '+1-800-IMOVIES',
    amenities: 'Dolby Atmos, Recliner Luxury Seats, Gourmet Food Hall',
    screenName: 'IMAX Audi 1',
    screenType: 'IMAX 3D',
  });

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await api.get('/theatres');
      if (res.data.success) {
        setTheatres(res.data.theatres || []);
      }
    } catch (err) {
      toast.error('Failed to load theatres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      city: 'Mumbai',
      address: '',
      state: '',
      contactPhone: '+1-800-IMOVIES',
      amenities: 'Dolby Atmos, Recliner Luxury Seats, Gourmet Food Hall',
      screenName: 'IMAX Audi 1',
      screenType: 'IMAX 3D',
    });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingId(t._id);
    setFormData({
      name: t.name,
      city: t.city,
      address: t.address,
      state: t.state || '',
      contactPhone: t.contactPhone || '',
      amenities: t.amenities?.join(', ') || '',
      screenName: t.screens?.[0]?.name || 'Audi 1',
      screenType: t.screens?.[0]?.screenType || 'Standard 2D',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theatre and all its associated show schedules?')) return;
    try {
      const res = await api.delete(`/theatres/${id}`);
      if (res.data.success) {
        toast.success('Theatre deleted successfully');
        fetchTheatres();
      }
    } catch (err) {
      toast.error('Failed to delete theatre');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      city: formData.city,
      address: formData.address,
      state: formData.state,
      contactPhone: formData.contactPhone,
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      screens: [
        {
          screenNumber: 1,
          name: formData.screenName,
          capacity: 80,
          screenType: formData.screenType,
          soundSystem: 'Dolby Atmos 7.1',
        },
      ],
    };

    try {
      if (editingId) {
        await api.put(`/theatres/${editingId}`, payload);
        toast.success('Theatre updated successfully');
      } else {
        await api.post('/theatres', payload);
        toast.success('Theatre created successfully');
      }
      setShowModal(false);
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving theatre');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-muted small d-flex align-items-center gap-1 mb-1 text-decoration-none hover-white">
            <ArrowLeft size={14} /> Back to Admin Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Manage Cinema Theatres</h2>
        </div>

        <button onClick={openAddModal} className="btn btn-cinema">
          <Plus size={16} /> Add New Cinema
        </button>
      </div>

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
                  <th>THEATRE NAME</th>
                  <th>CITY</th>
                  <th>ADDRESS</th>
                  <th>SCREENS</th>
                  <th>AMENITIES</th>
                  <th>CONTACT</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {theatres.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className="text-white fw-bold small">{t.name}</span>
                    </td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                        {t.city}
                      </span>
                    </td>
                    <td className="text-white-50 small" style={{ maxWidth: '240px' }}>
                      {t.address}
                    </td>
                    <td className="text-white small">
                      {t.screens?.length || 1} Screens
                    </td>
                    <td className="text-white-50 small">
                      {t.amenities?.slice(0, 2).join(', ')}
                    </td>
                    <td className="text-white-50 small">{t.contactPhone}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="btn btn-sm btn-outline-light p-1 px-2"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
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

      {/* Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1100 }}>
          <div className="glass-panel p-4 w-100 shadow-lg" style={{ maxWidth: '580px', backgroundColor: '#131926' }}>
            <h4 className="text-white fw-bold mb-3">
              {editingId ? 'Edit Cinema Theatre' : 'Add New Cinema Theatre'}
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="text-muted small mb-1">Theatre Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    placeholder="PVR IMAX Phoenix"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-muted small mb-1">City</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="New York">New York</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="text-muted small mb-1">Full Address</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Auditorium Screen Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.screenName}
                    onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-muted small mb-1">Projection Format</label>
                  <select
                    className="form-select bg-dark border-secondary text-white shadow-none"
                    value={formData.screenType}
                    onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="RealD 3D">RealD 3D</option>
                    <option value="4DX">4DX</option>
                    <option value="Standard 2D">Standard 2D</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="text-muted small mb-1">Amenities (comma separated)</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="text-muted small mb-1">Contact Phone</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white shadow-none"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
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
                  {editingId ? 'Save Changes' : 'Create Theatre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTheatres;
