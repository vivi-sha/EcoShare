import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ setCurrentPage, setDashboardTab, activeTab }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
  };

  const handleNav = (tab) => {
    setDashboardTab(tab);
    setCurrentPage('dashboard');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo" onClick={() => setCurrentPage('landing')}>
          <span className="logo-icon">🌿</span>
          <span className="logo-text">EcoShare</span>
        </div>

        <nav className="nav-menu">
          {user ? (
            <>
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active-nav' : ''}`}
                onClick={() => handleNav('profile')}
              >
                Profile
              </button>
              <button
                className={`nav-link ${activeTab === 'history' ? 'active-nav' : ''}`}
                onClick={() => handleNav('history')}
              >
                History
              </button>
              <button
                className={`nav-link ${activeTab === 'leaderboard' ? 'active-nav' : ''}`}
                onClick={() => handleNav('leaderboard')}
              >
                Leaderboard
              </button>
              <button className="nav-link logout-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentPage('landing')} className="nav-link">Home</button>
              <button onClick={() => setCurrentPage('experiments')} className="nav-link">Explore</button>
              <div className="auth-buttons">
                <button className="btn btn-primary" onClick={() => setCurrentPage('login')}>Get Started</button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
