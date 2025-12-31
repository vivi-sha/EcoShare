import React from 'react';
import './ImpactVisualizer.css';

export default function ImpactVisualizer() {
    const stats = [
        { label: "CO2 Saved", value: "120kg", icon: "☁️", color: "#4CAF50" },
        { label: "Trees Planted", value: "5", icon: "🌳", color: "#8BC34A" },
        { label: "Plastic Avoided", value: "3kg", icon: "🥤", color: "#009688" }
    ];

    const recentActivities = [
        { id: 1, action: "Chose train over flight", impact: "+50kg CO2 saved", date: "Dec 12" },
        { id: 2, action: "Stayed at Eco-Lodge", impact: "+100 pts", date: "Dec 14" },
        { id: 3, action: "Used reusable bottle", impact: "Plastic avoided", date: "Dec 15" }
    ];

    return (
        <div className="impact-container">
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ borderColor: stat.color }}>
                        <div className="stat-icon" style={{ background: `${stat.color}20` }}>{stat.icon}</div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="impact-chart-section">
                <h3>Your Carbon Footprint Trend</h3>
                <div className="chart-placeholder">
                    <div className="bar-chart">
                        <div className="bar" style={{ height: '40%' }} title="Sep"><span>Sep</span></div>
                        <div className="bar" style={{ height: '60%' }} title="Oct"><span>Oct</span></div>
                        <div className="bar" style={{ height: '30%' }} title="Nov"><span>Nov</span></div>
                        <div className="bar active" style={{ height: '20%' }} title="Dec"><span>Dec</span></div>
                    </div>
                    <p className="chart-caption">You're traveling 20% more sustainably this month! 🎉</p>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Eco-Actions</h3>
                <ul className="activity-list">
                    {recentActivities.map(act => (
                        <li key={act.id} className="activity-item">
                            <span className="activity-date">{act.date}</span>
                            <span className="activity-desc">{act.action}</span>
                            <span className="activity-impact">{act.impact}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
