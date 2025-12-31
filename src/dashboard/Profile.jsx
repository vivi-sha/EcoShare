import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import './Profile.css';

export default function Profile({ onNavigate, onSelectTrip }) {
    const { user } = useAuth();
    const [stats, setStats] = useState({ rank: '-', recentTrips: [], impactData: [] });

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                // Fetch real trips
                const res = await fetch(`http://localhost:3000/api/trips/user/${user.id}`);
                const trips = await res.json();

                // Calculate basic stats for demo based on points
                const trees = Math.floor(user.ecoPoints / 100);
                const plastic = Math.floor(user.ecoPoints / 50);

                // Mock sorting by recent
                const recent = trips.reverse().slice(0, 3).map(t => ({
                    id: t.id,
                    name: t.name,
                    date: t.date ? new Date(t.date).toLocaleDateString() : 'Active',
                    points: 0 // Ideally sum points from expenses
                }));

                setStats({
                    rank: '#-', // Ranking usually requires a separate call or part of user obj
                    recentTrips: recent,
                    impactData: [
                        { name: 'Trees', value: trees > 0 ? trees : 1, fill: '#4CAF50' },
                        { name: 'Plastic', value: plastic > 0 ? plastic : 1, fill: '#2196F3' },
                        { name: 'CO2', value: Math.max(5, user.ecoPoints), fill: '#FF9800' }
                    ]
                });
            } catch (e) { console.error(e); }
        };
        fetchProfile();
    }, [user]);

    return (
        <div className="profile-dashboard">
            <div className="profile-header-card">
                <div className="profile-avatar-lg">
                    {user?.photoUrl ? <img src={user.photoUrl} alt="Profile" /> : user?.name?.charAt(0)}
                </div>
                <div className="profile-info">
                    <h1>{user?.name}</h1>
                    <p className="email-badge">{user?.email}</p>
                </div>
                <div className="profile-stats-row">
                    <div className="stat-box">
                        <span className="stat-val">{user?.ecoPoints || 0}</span>
                        <span className="stat-label">Eco Points</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-val">{user?.donatedPoints || 0}</span>
                        <span className="stat-label">Donated</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-val">{stats.rank}</span>
                        <span className="stat-label">Global Rank</span>
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                {/* Snippet: Recent Trips */}
                <div className="dashboard-card generic-card">
                    <h3>Recent Adventures 🎒</h3>
                    <div className="mini-list">
                        {stats.recentTrips.length > 0 ? stats.recentTrips.map(t => (
                            <div key={t.id} className="mini-item" onClick={() => onSelectTrip(t.id)}>
                                <div className="mini-date">{t.date}</div>
                                <div className="mini-name">{t.name}</div>
                                <div className="mini-arrow" style={{ color: '#999' }}>➔</div>
                            </div>
                        )) : <p className="placeholder-text" style={{ color: '#888', fontStyle: 'italic' }}>No trips yet. Time to explore!</p>}
                    </div>
                    <button className="btn-text" onClick={() => onNavigate('history')}>View All History →</button>
                </div>

                {/* Snippet: Impact Visualization */}
                <div className="dashboard-card generic-card">
                    <h3>My Earth Impact 🌍</h3>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={stats.impactData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                                    {stats.impactData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="impact-summary">You're making a difference!</p>
                </div>

                <div className="dashboard-card generic-card">
                    <h3>Next Goal 🎯</h3>
                    <div className="goal-progress">
                        <div className="goal-label">
                            <span>Gold Supporter Badge</span>
                            <span>{Math.min(user?.ecoPoints || 0, 450)} / 500 pts</span>
                        </div>
                        <div className="progress-bar"><div className="fill" style={{ width: `${Math.min((user?.ecoPoints || 0) / 500 * 100, 100)}%` }}></div></div>
                        <p>{Math.max(0, 500 - (user?.ecoPoints || 0))} more points to unlock!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
