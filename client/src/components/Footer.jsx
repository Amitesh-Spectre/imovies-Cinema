import React from 'react';
import { Film, Shield, Zap, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto py-5" style={{ backgroundColor: '#070a12', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="d-flex align-items-center justify-content-center rounded-3 p-2" style={{ background: 'linear-gradient(135deg, #e50914, #990000)' }}>
                <Film size={20} color="#ffffff" />
              </div>
              <span className="fs-5 fw-bold text-white tracking-wide">
                <span style={{ color: '#e50914' }}>I</span>MOVIES
              </span>
            </div>
            <p className="text-muted small pe-lg-4">
              Next-generation full-stack MERN cinema booking platform. Featuring real-time seat lock synchronization, immersive IMAX sound, instant digital ticket passes, and seamless cinema management.
            </p>
            <div className="d-flex align-items-center gap-2 mt-2">
              <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-25 px-2 py-1">
                React 18
              </span>
              <span className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-25 px-2 py-1">
                Node / Express
              </span>
              <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-25 px-2 py-1">
                MongoDB
              </span>
              <span className="badge bg-info bg-opacity-20 text-info border border-info border-opacity-25 px-2 py-1">
                Socket.io
              </span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
              <li><Link to="/movies" className="hover-white">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="hover-white">Coming Soon</Link></li>
              <li><Link to="/movies" className="hover-white">IMAX 3D Experience</Link></li>
              <li><Link to="/movies" className="hover-white">Cinemas & Theatres</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Cinema Experience</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
              <li className="d-flex align-items-center gap-2">
                <Zap size={14} className="text-warning" /> Real-Time Live Seat Locking
              </li>
              <li className="d-flex align-items-center gap-2">
                <Sparkles size={14} className="text-info" /> Dolby Atmos 12-Channel Audio
              </li>
              <li className="d-flex align-items-center gap-2">
                <Shield size={14} className="text-success" /> Instant Refund Cancellation
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Quick Demo Accounts</h6>
            <div className="glass-panel p-3 small text-muted">
              <div className="mb-1 text-white">
                <strong className="text-danger">Admin:</strong> admin@imovies.com
              </div>
              <div className="mb-2 text-white">
                <strong className="text-info">User:</strong> user@imovies.com
              </div>
              <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                Password for both: <code className="text-white">Admin@123</code> / <code className="text-white">User@123</code>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted">
          <span>&copy; {new Date().getFullYear()} IMovies Cinema Management System. All rights reserved.</span>
          <span className="d-flex align-items-center gap-1">
            Built with modern MERN Architecture
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
