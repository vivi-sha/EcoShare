import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await fetch(`${API_URL}/leaderboard`);
                if (res.ok) setLeaders(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchLeaders();
    }, []);

    return (
        <div className="leaderboard-container">
            <header className="leaderboard-header">
                <h1>Eco Champions 🏆</h1>
                <p>See who is leading the sustainable movement.</p>
            </header>

            <div className="podium">
                {/* Visual sugar for Top 3 could go here */}
            </div>

            <div className="leader-table-card">
                <table className="leader-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>User</th>
                            <th>Green Points</th>
                            <th>Impact (Donated)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.map((l, index) => (
                            <tr key={l.id} className={index < 3 ? `rank-${index + 1}` : ''}>
                                <td className="rank-col">
                                    {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </td>
                                <td className="user-col">
                                    <div className="user-cell">
                                        <div className="avatar-sm">{l.name.charAt(0)}</div>
                                        <span>{l.name}</span>
                                    </div>
                                </td>
                                <td className="points-col">{l.ecoPoints}</td>
                                <td className="donated-col">
                                    {l.donatedPoints > 0 ? `❤️ ${l.donatedPoints}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
