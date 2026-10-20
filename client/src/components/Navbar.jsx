import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Ticket, LayoutDashboard, User, LogOut, MapPin, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('imovies_city') || 'Mumbai');

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    localStorage.setItem('imovies_city', city);
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ backgroundColor: 'rgba(11, 15, 25, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="container py-1">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold fs-4">
          <div className="d-flex align-items-center justify-content-center rounded-3 p-2" style={{ background: 'linear-gradient(135deg, #e50914, #990000)' }}>
            <Film size={22} color="#ffffff" />
          </div>
          <span style={{ letterSpacing: '1px' }}>
            <span style={{ color: '#e50914' }}>I</span>MOVIES
          </span>
        </Link>

        {/* City Selector */}
        <div className="d-none d-md-flex align-items-center gap-2 ms-3 px-3 py-1 rounded-pill" style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <MapPin size={16} className="text-danger" />
          <select
            className="form-select form-select-sm bg-transparent border-0 text-white shadow-none"
            style={{ cursor: 'pointer', fontSize: '0.85rem', width: 'auto', paddingRight: '24px' }}
            value={selectedCity}
            onChange={handleCityChange}
          >
            <option value="Mumbai" className="bg-dark text-white">Mumbai</option>
            <option value="Delhi" className="bg-dark text-white">Delhi</option>
            <option value="Bengaluru" className="bg-dark text-white">Bengaluru</option>
            <option value="New York" className="bg-dark text-white">New York</option>
          </select>
        </div>

        {/* Navigation links */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
          <ul className="navbar-nav align-items-center gap-lg-3">
            <li className="nav-item">
              <Link to="/movies" className="nav-link text-white-50 hover-white fw-medium">
                Movies
              </Link>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link text-white-50 hover-white fw-medium d-flex align-items-center gap-1">
                  <Ticket size={16} />
                  My Bookings
                </Link>
              </li>
            )}

            {isAdmin && (
              <li className="nav-item">
                <Link to="/admin" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-3 rounded-pill fw-semibold">
                  <LayoutDashboard size={15} />
                  Admin Panel
                </Link>
              </li>
            )}

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <li className="nav-item position-relative">
                <NotificationDropdown />
              </li>
            )}

            {/* User Profile / Auth buttons */}
            <li className="nav-item ms-lg-2">
              {isAuthenticated ? (
                <div className="dropdown">
                  <button
                    className="btn d-flex align-items-center gap-2 text-white bg-transparent border-0 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    type="button"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt="avatar"
                      className="rounded-circle border border-danger"
                      width="34"
                      height="34"
                      style={{ objectFit: 'cover' }}
                    />
                    <span className="small fw-semibold d-none d-sm-inline">{user?.name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg" style={{ backgroundColor: '#131926', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <li>
                      <Link to="/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2">
                        <User size={16} className="text-muted" /> Profile & Bookings
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link to="/admin" className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger">
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider border-secondary" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger d-flex align-items-center gap-2 py-2">
                        <LogOut size={16} /> Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-sm btn-cinema-outline">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-cinema">
                    Sign Up
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
