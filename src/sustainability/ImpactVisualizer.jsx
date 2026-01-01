import React from 'react';
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

    // Derived from real user points (mocking the conversion for visual effect)
    const points = user?.ecoPoints || 0;
    const co2Saved = (points * 1.5).toFixed(1); // Mock conversion
    const trees = Math.floor(points / 50);

    const stats = [
        { label: "Eco Points", value: points, icon: "⭐", color: "#F59E0B" },
        { label: "CO2 Saved", value: `${co2Saved}kg`, icon: "☁️", color: "#10B981" },
        { label: "Trees Planted", value: trees, icon: "🌳", color: "#3B82F6" },
    ];

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
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Eco-Actions</h3>
                <ul className="activity-list" style={{ listStyle: 'none' }}>
                    <li className="activity-item" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>Yesterday</span>
                            <span>Split a generic expense</span>
                        </div>
                        <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>+10 pts</span>
                    </li>
                    <li className="activity-item" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>Last Week</span>
                            <span>Created a new trip</span>
                        </div>
                        <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>+5 pts</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

