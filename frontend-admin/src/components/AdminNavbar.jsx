import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="btn btn-dark d-md-none position-fixed top-0 start-0 m-3" 
        style={{ zIndex: 1050 }}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark d-md-none" 
          style={{ opacity: 0.5, zIndex: 1040 }}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar d-flex flex-column ${isOpen ? 'open' : ''}`}>
        <div className="p-4 border-bottom border-secondary">
          <h3 className="text-white mb-0 d-flex align-items-center gap-2">
            ⚙️ HomeServ
          </h3>
          <small className="text-secondary d-block mt-1">Admin Panel</small>
        </div>

        <div className="flex-grow-1 py-4 d-flex flex-column gap-2 px-3">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `text-decoration-none px-4 py-3 rounded text-white d-flex align-items-center gap-3 transition-all ${isActive ? 'bg-primary border-start border-4 border-info' : 'hover-bg-secondary'}`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="fs-5">📊</span> Dashboard
          </NavLink>
          <NavLink 
            to="/services" 
            className={({ isActive }) => 
              `text-decoration-none px-4 py-3 rounded text-white d-flex align-items-center gap-3 transition-all ${isActive ? 'bg-primary border-start border-4 border-info' : 'hover-bg-secondary'}`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="fs-5">🔧</span> Services
          </NavLink>
          <NavLink 
            to="/technicians" 
            className={({ isActive }) => 
              `text-decoration-none px-4 py-3 rounded text-white d-flex align-items-center gap-3 transition-all ${isActive ? 'bg-primary border-start border-4 border-info' : 'hover-bg-secondary'}`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="fs-5">👨‍🔧</span> Technicians
          </NavLink>
          <NavLink 
            to="/bookings" 
            className={({ isActive }) => 
              `text-decoration-none px-4 py-3 rounded text-white d-flex align-items-center gap-3 transition-all ${isActive ? 'bg-primary border-start border-4 border-info' : 'hover-bg-secondary'}`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="fs-5">📋</span> Bookings
          </NavLink>
        </div>

        <div className="p-3 mt-auto">
          <button 
            onClick={logout} 
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminNavbar;
