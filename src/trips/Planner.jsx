import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Planner.css';

export default function Planner({ onSelectTrip }) {
    const [trips, setTrips] = useState([]);
    const [showNewTripForm, setShowNewTripForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    const [newTripName, setNewTripName] = useState('');
    const [tripDest, setTripDest] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const { user } = useAuth();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        if (user) fetchTrips();
    }, [user]);

    const fetchTrips = async () => {
        try {
            const res = await fetch(`${API_URL}/trips/user/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setTrips(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/trips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTripName, destination: tripDest, userId: user.id })
            });
            if (res.ok) {
                setShowNewTripForm(false);
                setNewTripName('');
                setTripDest('');
                fetchTrips();
            }
        } catch (e) { console.error(e); }
    };

    const handleJoinTrip = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/trips/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, shareCode: joinCode })
            });
            if (res.ok) {
                setShowJoinForm(false);
                setJoinCode('');
                fetchTrips();
            } else {
                alert('Trip not found');
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteTrip = async (e, tripId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Delete this trip for yourself? History will be preserved for other members.')) return;

        try {
            console.log('Sending delete request for:', tripId);
            const res = await fetch(`${API_URL}/trips/${tripId}?userId=${user.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                console.log('Delete successful on server');
                // Use functional update to ensure we have the latest state
                setTrips(prevTrips => prevTrips.filter(t => t.id !== tripId));
            } else {
                const error = await res.json();
                console.error('Delete failed:', error);
                alert('Failed to delete trip: ' + (error.error || 'Server error'));
            }
        } catch (e) {
            console.error('Network error during delete:', e);
            alert('Could not connect to the server to delete the trip.');
        }
    };

    const handleLeaveTrip = async (e, tripId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to leave this trip? You will no longer be a member.')) return;

        try {
            const res = await fetch(`${API_URL}/trips/${tripId}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                setTrips(prevTrips => prevTrips.filter(t => t.id !== tripId));
            } else {
                const error = await res.json();
                alert('Failed to leave trip: ' + (error.error || 'Server error'));
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="planner">
            {!showNewTripForm && !showJoinForm ? (
                <>
                    <div className="planner-actions" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => setShowNewTripForm(true)}>+ New Trip</button>
                        <button className="btn btn-secondary" onClick={() => setShowJoinForm(true)}>Join with Code</button>
                    </div>

                    <div className="planner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {trips.map(trip => (
                            <div
                                key={trip.id}
                                className="trip-card glass-panel"
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Action Buttons - Balanced Minimalism */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.6rem',
                                    right: '0.6rem',
                                    zIndex: 30,
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    {/* Leave/Exit Action */}
                                    <button
                                        onClick={(e) => handleLeaveTrip(e, trip.id)}
                                        title="Leave Trip"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            backdropFilter: 'blur(4px)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s',
                                            opacity: 0.8
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)';
                                            e.currentTarget.style.opacity = 1;
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                            e.currentTarget.style.opacity = 0.8;
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        🚪
                                    </button>

                                    {/* Delete Action */}
                                    <button
                                        onClick={(e) => handleDeleteTrip(e, trip.id)}
                                        title="Delete (Hide) Trip"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            backdropFilter: 'blur(4px)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s',
                                            opacity: 0.8
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                            e.currentTarget.style.opacity = 1;
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                            e.currentTarget.style.opacity = 0.8;
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Main Card Link (Using clickable div for better event control) */}
                                <div
                                    onClick={() => navigate(`/dashboard/trips/${trip.id}`)}
                                    style={{ cursor: 'pointer', flex: 1 }}
                                >
                                    <div className="trip-image-placeholder" style={{
                                        height: '140px',
                                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold',
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <span>{trip.destination || trip.name}</span>
                                    </div>
                                    <div className="trip-details" style={{ padding: '1.25rem' }}>
                                        <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontSize: '1.15rem' }}>{trip.name}</h3>
                                        <div className="trip-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span className="badge" style={{
                                                background: '#ecfdf5',
                                                color: '#059669',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '999px',
                                                fontWeight: '600',
                                                border: '1px solid #d1fae5'
                                            }}>Active</span>
                                            <span className="participants" style={{ fontWeight: '500' }}>👥 {trip.members.length} members</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {trips.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                                <p style={{ fontSize: '1.2rem' }}>No trips yet. Create one or join a friend's trip!</p>
                            </div>
                        )}
                    </div>
                </>

            ) : showNewTripForm ? (
                <div className="new-trip-form-container">
                    <h3>Plan a New Adventure</h3>
                    <form className="new-trip-form" onSubmit={handleCreateTrip}>
                        <div className="form-group">
                            <label>Trip Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Goa 2025"
                                className="input"
                                value={newTripName}
                                onChange={e => setNewTripName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Destination</label>
                            <input
                                type="text"
                                placeholder="Goa"
                                className="input"
                                value={tripDest}
                                onChange={e => setTripDest(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowNewTripForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Create Trip</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="new-trip-form-container">
                    <h3>Join a Trip</h3>
                    <form className="new-trip-form" onSubmit={handleJoinTrip}>
                        <div className="form-group">
                            <label>Share Code</label>
                            <input
                                type="text"
                                placeholder="Enter code..."
                                className="input"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowJoinForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Join</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
