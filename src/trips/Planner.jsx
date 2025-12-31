import React, { useState, useEffect } from 'react';
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

    return (
        <div className="planner">
            {!showNewTripForm && !showJoinForm ? (
                <>
                    <div className="planner-actions" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => setShowNewTripForm(true)}>+ New Trip</button>
                        <button className="btn btn-secondary" onClick={() => setShowJoinForm(true)}>Join with Code</button>
                    </div>

                    <div className="planner-grid">
                        {trips.map(trip => (
                            <div key={trip.id} className="trip-card" onClick={() => onSelectTrip(trip.id)}>
                                <div className="trip-image-placeholder">
                                    <span>{trip.destination || trip.name}</span>
                                </div>
                                <div className="trip-details">
                                    <h3>{trip.name}</h3>
                                    <div className="trip-meta">
                                        <span className="badge">Active</span>
                                        <span className="participants">👥 {trip.members.length}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {trips.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '3rem' }}>
                                <p>No trips yet. Create one or join a friend's trip!</p>
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
