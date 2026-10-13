import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top glass-card" style={{ padding: '15px 0', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" style={{ color: 'var(--primary)', fontSize: '1.5rem' }} to="/">
          <span className="me-2">🔧</span>HomeServ
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/services">Services</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/mybookings">My Bookings</Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="text-decoration-none">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px', background: 'var(--primary-gradient)', fontWeight: 'bold' }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </Link>
                <button className="btn btn-outline-danger rounded-pill px-4" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn btn-link text-decoration-none text-dark fw-medium" to="/login">Login</Link>
                <Link className="btn btn-gradient" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
