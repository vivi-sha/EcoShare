import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './landing/Landing';
import Dashboard from './dashboard/Dashboard';
import Login from './auth/Login';
import Planner from './trips/Planner';
import TripDetail from './trips/TripDetail';
import Leaderboard from './dashboard/Leaderboard';
import Profile from './dashboard/Profile';
import ImpactVisualizer from './sustainability/ImpactVisualizer';
import JoinTrip from './trips/JoinTrip';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen message="Securing your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main style={{ marginTop: '2rem', minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/login" element={<LoginWrapper />} />
            <Route path="/join/:shareCode" element={<JoinTrip />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Profile />} />
              <Route path="history" element={<Planner />} />
              <Route path="trips/:tripId" element={<TripDetailWrapper />} />
              <Route path="impact" element={<ImpactVisualizer />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer style={{
          marginTop: '6rem',
          padding: '4rem 2rem',
          backgroundColor: '#fff',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: '1', minWidth: '200px', textAlign: 'center' }}>
              <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🌿</span>
                <span className="text-gradient">EcoShare</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Making global travel sustainable and collaborative for everyone.</p>
            </div>

            <div style={{ display: 'flex', gap: '4rem' }}>
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Platform</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Home</Link></li>
                  <li><Link to="/about" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>About Us</Link></li>
                  <li><Link to="/contact" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Legal</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><Link to="/privacy-policy" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Privacy Policy</Link></li>
                  <li><Link to="/terms-of-service" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', width: '100%', maxWidth: '800px', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&copy; 2025 EcoShare. All rights reserved. Travel sustainably.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

// Wrapper components
function LoginWrapper() {
  const { user, isLoaded } = useAuth();
  const navigate = useNavigate();

  if (!isLoaded) return <LoadingScreen message="Checking authentication..." />;

  if (user) {
    const pending = localStorage.getItem('pendingJoinCode');
    if (pending) {
      localStorage.removeItem('pendingJoinCode');
      return <Navigate to={`/join/${pending}`} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <Login onLoginSuccess={() => { }} />;
}

function TripDetailWrapper() {
  const { tripId } = useParams();
  const navigate = useNavigate(); // Hook must be used inside a component under Router context
  // TripDetail now handles its own back navigation internally or via Link, but we pass tripId
  return <TripDetail tripId={tripId} />;
}

export default App;


