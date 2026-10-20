import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, UserCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(redirectPath, { replace: true });
      } else {
        toast.error(res.message || 'Invalid email or password credentials');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('Admin@123');
    } else {
      setEmail('user@imovies.com');
      setPassword('User@123');
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel p-4 p-md-5 shadow-lg w-100" style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-2" style={{ background: 'linear-gradient(135deg, #e50914, #990000)' }}>
            <Film size={28} color="#ffffff" />
          </div>
          <h3 className="text-white fw-bold">Sign In to IMovies</h3>
          <p className="text-muted small">Access your tickets, fast booking, and personalized recommendations</p>
        </div>

        {/* Demo Fast Autofill */}
        <div className="mb-4 p-3 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25 text-center">
          <span className="text-muted small d-block mb-2">⚡ Quick 1-Click Demo Login:</span>
          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="btn btn-sm btn-outline-info flex-grow-1"
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="btn btn-sm btn-outline-danger flex-grow-1"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label className="text-muted small mb-1">Password</label>
            </div>
            <div className="position-relative">
              <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="password"
                className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-cinema w-100 py-3 fw-bold fs-6 mb-3"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-muted small mt-3">
          Don't have an account?{' '}
          <Link to="/register" className="text-danger fw-semibold hover-white">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
