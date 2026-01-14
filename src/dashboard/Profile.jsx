import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './Profile.css';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ rank: '-', recentTrips: [], impactData: [] });

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                // Fetch real trips
                const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/trips/user/${user.id}`);
                const trips = await res.json();

                // Calculate basic stats for demo based on points
                // Compound calculations for impact (non‑linear growth)
                const trees = Math.floor(Math.pow(user.ecoPoints, 0.6)); // e.g., sqrt‑ish growth
                const plastic = Math.floor(Math.pow(user.ecoPoints, 0.5)); // slower growth


                // Mock sorting by recent
                const recent = trips.reverse().slice(0, 3).map(t => ({
                    id: t.id,
                    name: t.name,
                    date: t.date ? new Date(t.date).toLocaleDateString() : 'Active',
                    points: 0 // Ideally sum points from expenses
                }));

                setStats({
                    rank: '#42',
                    recentTrips: recent,
                    impactData: [
                        { name: 'Trees', value: trees > 0 ? trees : 1, fill: '#10B981' },
                        { name: 'Plastic', value: plastic > 0 ? plastic : 1, fill: '#3B82F6' },
                        { name: 'CO2', value: Math.max(5, user.ecoPoints), fill: '#F59E0B' }
                    ]
                });
            } catch (e) { console.error(e); }
        };
        fetchProfile();
    }, [user]);

    return (
        <div className="profile-dashboard fade-in">
            <div className="profile-header-card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem', marginBottom: '2rem' }}>
                <div className="profile-avatar-lg" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-500), #60A5FA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white', border: '3px solid rgba(255,255,255,0.2)' }}>
                    {user?.photoUrl ? <img src={user.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : user?.name?.charAt(0)}
                </div>
                <div className="profile-info" style={{ flex: 1 }}>
                    <h1 style={{ marginBottom: '0.25rem', fontSize: '2.5rem' }}>{user?.name}</h1>
                    <p className="email-badge" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>
                <div className="profile-stats-row" style={{ display: 'flex', gap: '2rem' }}>
                    <div className="stat-box" style={{ textAlign: 'center' }}>
                        <span className="stat-val" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-500)' }}>{user?.ecoPoints || 0}</span>
                        <span className="stat-label" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Eco Points</span>
                    </div>
                    <div className="stat-box" style={{ textAlign: 'center' }}>
                        <span className="stat-val" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-500)' }}>{user?.donatedPoints || 0}</span>
                        <span className="stat-label" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Donated</span>
                    </div>
                </div>
            </div>

            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Visual: Recent Trips */}
                <div className="dashboard-card glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Recent Adventures 🎒</h3>
                    <div className="mini-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {stats.recentTrips.length > 0 ? stats.recentTrips.map(t => (
                            <Link to={`/dashboard/trips/${t.id}`} key={t.id} className="mini-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                <div>
                                    <div className="mini-date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.date}</div>
                                    <div className="mini-name" style={{ fontWeight: '500' }}>{t.name}</div>
                                </div>
                                <div className="mini-arrow" style={{ color: 'var(--primary-500)' }}>➔</div>
                            </Link>
                        )) : <p className="placeholder-text" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No trips yet. Time to explore!</p>}
                    </div>
                    <Link to="/dashboard/history" className="btn-text" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: 'var(--primary-500)', fontSize: '0.9rem' }}>View All History →</Link>
                </div>

                {/* Visual: Impact Visualization */}
                <div className="dashboard-card glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>My Earth Impact 🌍</h3>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.impactData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    stroke="none"
                                >
                                    {stats.impactData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffffff', borderRadius: '0.5rem', border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="impact-summary" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>You're making a difference!</p>
                    <Link to="/dashboard/impact" className="btn-text" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: 'var(--primary-500)', fontSize: '0.9rem' }}>View Impact Details →</Link>
                </div>

                <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Next Goal 🎯</h3>
                    <div className="goal-progress">
                        <div className="goal-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: '600' }}>Gold Supporter Badge</span>
                            <span>{user?.ecoPoints || 0} / 500 pts</span>
                        </div>
                        <div className="progress-bar" style={{ height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div className="fill" style={{ width: `${Math.min((user?.ecoPoints || 0) / 500 * 100, 100)}%`, background: 'var(--primary-500)', height: '100%' }}></div>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {user?.ecoPoints >= 500 ? "Goal achieved! Badge earned." : `${Math.max(0, 500 - (user?.ecoPoints || 0))} more points to unlock!`}
                        </p>
                    </div>

                    <div className="reward-banner" style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #FFF9EB 0%, #FFF1D6 100%)',
                        border: '1px solid #FFE0A3',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🏆</span>
                            <span style={{ fontWeight: 'bold', color: '#92400E', fontSize: '0.9rem' }}>WIN A FREE TRIP</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: '1.4', margin: 0 }}>
                            Gold Supporters get a chance to win a **free volunteered trip or hike**!
                            In collaboration with
                            <a href="https://volunteeryatra.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#D97706', fontWeight: 'bold', textDecoration: 'underline', marginLeft: '4px' }}>
                                VolunteerYatra
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

