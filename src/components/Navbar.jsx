import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css'; // We'll reuse/overwrite this CSS file content later, or inline styles for now.

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-item ${isActive ? 'active' : ''}`;

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '0.5rem',
      margin: '0 0.5rem',
      zIndex: 100,
      padding: '0.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
        <span style={{ fontSize: '1.5rem' }}>🌿</span>
        <span className="text-gradient">EcoShare</span>
      </Link>

      <div className="nav-menu" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <NavLink to="/dashboard" end className={navLinkClass}>Profile</NavLink>
            <NavLink to="/dashboard/history" className={navLinkClass}>My Trips</NavLink>
            <NavLink to="/dashboard/impact" className={navLinkClass}>Impact</NavLink>
            <NavLink to="/dashboard/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="nav-item">Home</Link>
            <Link to="/about" className="nav-item">About</Link>
            <Link to="/contact" className="nav-item">Contact</Link>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              Get Started
            </Link>
          </>
        )}
      </div>

      <style>{`
        .nav-item {
          color: var(--text-muted);
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .nav-item:hover {
          color: var(--text-main);
          background: rgba(255,255,255,0.05);
        }
        .nav-item.active {
          color: var(--primary-500);
          background: rgba(16, 185, 129, 0.1);
        }
        @media (max-width: 768px) {
          .nav-menu {
            width: 100%;
            justify-content: center;
            overflow-x: auto;
            padding: 0.5rem 0;
            scrollbar-width: none;
          }
          .nav-menu::-webkit-scrollbar {
            display: none;
          }
          .nav-item {
            font-size: 0.85rem;
            padding: 0.4rem 0.6rem;
            white-space: nowrap;
          }
          .logo {
            width: 100%;
            justify-content: center;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </nav>
  );
}
