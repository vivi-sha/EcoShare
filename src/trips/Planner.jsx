import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const API_URL = 'http://localhost:3000/api';

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
        e.stopPropagation(); // Stop the click from bubbling to the parent Link
        if (!confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;

        try {
            const res = await fetch(`${API_URL}/trips/${tripId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setTrips(trips.filter(t => t.id !== tripId));
            } else {
                alert('Failed to delete trip');
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
                            <Link to={`/dashboard/trips/${trip.id}`} key={trip.id} className="trip-card glass-panel" style={{ display: 'block', padding: '0', overflow: 'hidden', transition: 'transform 0.2s', position: 'relative' }}>
                                <div className="trip-image-placeholder" style={{ height: '140px', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    <span>{trip.destination || trip.name}</span>
                                </div>
                                <div className="trip-details" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{trip.name}</h3>
                                        <button
                                            onClick={(e) => handleDeleteTrip(e, trip.id)}
                                            style={{ color: '#ef4444', padding: '4px', opacity: 0.8, background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                            title="Delete Trip"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="trip-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span className="badge" style={{ background: 'var(--primary)', color: 'var(--text-inverse)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Active</span>
                                        <span className="participants">👥 {trip.members.length}</span>
                                    </div>
                                </div>
                            </Link>
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
