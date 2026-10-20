import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, User, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name, email, password, phone, 'user');
      if (res.success) {
        toast.success('Registration successful! Welcome to IMovies.');
        navigate('/');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel p-4 p-md-5 shadow-lg w-100" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-2" style={{ background: 'linear-gradient(135deg, #e50914, #990000)' }}>
            <Film size={28} color="#ffffff" />
          </div>
          <h3 className="text-white fw-bold">Create an Account</h3>
          <p className="text-muted small">Join IMovies to book seats in real-time and earn cinema rewards</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-muted small mb-1">Full Name</label>
            <div className="position-relative">
              <User size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-muted small mb-1">Email Address</label>
            <div className="position-relative">
              <Mail size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="email"
                className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-muted small mb-1">Phone Number (Optional)</label>
            <div className="position-relative">
              <Phone size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-muted small mb-1">Password</label>
            <div className="position-relative">
              <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="password"
                className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-muted small mb-1">Confirm Password</label>
            <div className="position-relative">
              <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="password"
                className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-cinema w-100 py-3 fw-bold fs-6 mb-3"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-muted small mt-2">
          Already registered?{' '}
          <Link to="/login" className="text-danger fw-semibold hover-white">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
