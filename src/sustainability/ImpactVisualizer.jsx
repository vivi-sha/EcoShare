import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import './ImpactVisualizer.css';

const data = [
    { name: 'Jan', uv: 200 },
    { name: 'Feb', uv: 300 },
    { name: 'Mar', uv: 250 },
    { name: 'Apr', uv: 400 },
    { name: 'May', uv: 350 },
    { name: 'Jun', uv: 500 },
];

export default function ImpactVisualizer() {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchActivity = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/user/${user.id}/activity`);
            const data = await res.json();
            setActivities(data);
        } catch (e) {
            console.error("Failed to fetch activity:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
    }, [user, user?.ecoPoints]); // Refresh when user points change

    // Derived from real user points (mocking the conversion for visual effect)
    const points = user?.ecoPoints || 0;
    const co2Saved = (Math.pow(points, 0.8) * 0.5).toFixed(1); // Compound conversion
    const trees = Math.floor(Math.pow(points, 0.6)); // Compound growth

    const stats = [
        { label: "CO2 Saved", value: `${co2Saved}kg`, icon: "☁️", color: "#10B981" },
        { label: "Trees Planted", value: trees, icon: "🌳", color: "#3B82F6" },
        { label: "Plastic Prevented", value: Math.floor(Math.pow(points, 0.5)), icon: "♻️", color: "#3B82F6" }
    ];

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="impact-container fade-in">
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Your Sustainability Impact</h2>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `5px solid ${stat.color}` }}>
                        <div className="stat-icon" style={{ fontSize: '2rem' }}>{stat.icon}</div>
                        <div className="stat-info">
                            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stat.value}</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="impact-chart-section glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Monthly Impact Trend</h3>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
                                itemStyle={{ color: '#10B981' }}
                            />
                            <Area type="monotone" dataKey="uv" stroke="#10B981" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="recent-activity glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Recent Eco-Actions</h3>
                    <button
                        onClick={fetchActivity}
                        disabled={loading}
                        style={{
                            background: 'var(--primary-500)',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-600)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'var(--primary-500)')}
                    >
                        {loading ? '⟳ Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>
                {loading && activities.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading activities...</p>
                ) : activities.length > 0 ? (
                    <ul className="activity-list" style={{ listStyle: 'none' }}>
                        {activities.map((act, idx) => (
                            <li key={idx} className="activity-item" style={{ padding: '1rem', borderBottom: idx !== activities.length - 1 ? '1px solid var(--glass-border)' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>{formatDate(act.date)}</span>
                                    <span>{act.title}</span>
                                </div>
                                <span style={{ color: act.points >= 0 ? 'var(--primary-500)' : '#EF4444', fontWeight: 'bold' }}>
                                    {act.points >= 0 ? `+${act.points}` : act.points} pts
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No eco-actions recorded yet. Start exploring!</p>
                )}
            </div>
        </div>
    );
}

