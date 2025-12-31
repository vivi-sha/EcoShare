import React, { useState } from 'react';
import Header from './components/Header';
import Landing from './landing/Landing';
import Dashboard from './dashboard/Dashboard';
import Login from './auth/Login';
import { useAuth } from './context/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [dashboardTab, setDashboardTab] = useState('profile');
  const { user } = useAuth();

  const handlePageChange = (page) => {
    if (page === 'dashboard' && !user) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <Landing setCurrentPage={handlePageChange} />;
      case 'dashboard': return user ? <Dashboard activeTab={dashboardTab} /> : <Login onLoginSuccess={() => handlePageChange('dashboard')} />;
      case 'login': return <Login onLoginSuccess={() => handlePageChange('dashboard')} />;
      case 'experiments': return <Landing setCurrentPage={handlePageChange} />;
      default: return <Landing setCurrentPage={handlePageChange} />;
    }
  };

  return (
    <div className="app">
      {currentPage !== 'login' && (
        <Header
          setCurrentPage={handlePageChange}
          activeTab={dashboardTab}
          setDashboardTab={setDashboardTab}
        />
      )}
      <main>
        {renderPage()}
      </main>

      {currentPage !== 'login' && (
        <footer style={{
          marginTop: '4rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#888',
          borderTop: '1px solid #eee'
        }}>
          <p>&copy; 2025 EcoShare. Travel sustainably.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
