import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './landing/Landing';
import Dashboard from './dashboard/Dashboard';
import Login from './auth/Login';
import Planner from './trips/Planner';
import TripDetail from './trips/TripDetail';
import Leaderboard from './dashboard/Leaderboard';
import Profile from './dashboard/Profile';
import ImpactVisualizer from './sustainability/ImpactVisualizer';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
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
            <Route path="/login" element={<LoginWrapper />} />

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
          marginTop: '4rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <p>&copy; 2025 EcoShare. Travel sustainably.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

// Wrapper components
function LoginWrapper() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login onLoginSuccess={() => { }} />;
}

function TripDetailWrapper() {
  const { tripId } = useParams();
  const navigate = useNavigate(); // Hook must be used inside a component under Router context
  // TripDetail now handles its own back navigation internally or via Link, but we pass tripId
  return <TripDetail tripId={tripId} />;
}

export default App;


