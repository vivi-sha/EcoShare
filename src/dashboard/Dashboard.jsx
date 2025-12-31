import React, { useState } from 'react';
import Planner from '../trips/Planner';
import TripDetail from '../trips/TripDetail';
import ExpenseTracker from '../expenses/ExpenseTracker'; // We might deprecate this standalone one or keep for global view
import ImpactVisualizer from '../sustainability/ImpactVisualizer';
import Rewards from '../landing/Rewards';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';
import Leaderboard from './Leaderboard';
import './Dashboard.css';

export default function Dashboard({ activeTab = 'profile' }) {
    const [selectedTripId, setSelectedTripId] = useState(null);
    const { user, logout } = useAuth(); // Assume logout is available

    return (
        <div className="dashboard container">
            {/* Note: Navigation is now in the Main Header */}

            <main className="dash-content-full">
                {/* View: Profile */}
                {activeTab === 'profile' && (
                    <Profile
                        onNavigate={(view) => setActiveTab(view)}
                        onSelectTrip={(id) => { setSelectedTripId(id); setActiveTab('history'); }}
                    />
                )}

                {/* View: History (Trips List) */}
                {activeTab === 'history' && !selectedTripId && (
                    <div className="history-view">
                        <h2>Your Trip History</h2>
                        <Planner onSelectTrip={(id) => setSelectedTripId(id)} />
                    </div>
                )}

                {/* View: Trip Detail (Nested in History) */}
                {selectedTripId && (
                    <TripDetail tripId={selectedTripId} onBack={() => setSelectedTripId(null)} />
                )}

                {/* View: Leaderboard */}
                {activeTab === 'leaderboard' && (
                    <Leaderboard />
                )}
            </main>
        </div>
    );
}
