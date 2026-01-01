import React from 'react';
import './Rewards.css';

export default function Rewards({ user }) {
    const ngos = [
        {
            id: 1,
            name: "Wildlife SOS",
            desc: "Rescue leopards and elephants.",
            image: "🐘",
            cost: 500,
            reward: "Gold Supporter Badge"
        },
        {
            id: 2,
            name: "Green Yatra",
            desc: "Plant 5 trees in urban areas.",
            image: "🌳",
            cost: 1000,
            reward: "Tree Certificate"
        },
        {
            id: 3,
            name: "Clean Ocean Force",
            desc: "Remove 10kg of ocean plastic.",
            image: "🌊",
            cost: 750,
            reward: "Ocean Warrior Status"
        }
    ];

    const passes = [
        {
            id: 101,
            name: "National Park Pass",
            desc: "1-Day entry to local sanctuaries.",
            image: "🎫",
            cost: 2000
        },
        {
            id: 102,
            name: "Eco-Store Coupon",
            desc: "20% off at sustainable brands.",
            image: "🛍️",
            cost: 1500
        }
    ];

    return (
        <div className="rewards-container container">
            <header className="rewards-header">
                <h1>Explore & Redeem</h1>
                <div className="points-display">
                    <span className="leaf-icon">🌿</span>
                    <span className="points-value">{user ? user.ecoPoints : 0}</span>
                    <span className="points-label">Eco Points</span>
                </div>
            </header>

            <section className="rewards-section">
                <h2>Support NGOs 🤝</h2>
                <p>Use your travel points to make a real-world difference.</p>
                <div className="rewards-grid">
                    {ngos.map(ngo => (
                        <div key={ngo.id} className="reward-card">
                            <div className="reward-icon">{ngo.image}</div>
                            <div className="reward-info">
                                <h3>{ngo.name}</h3>
                                <p>{ngo.desc}</p>
                                <div className="cost-row">
                                    <span className="cost">{ngo.cost} pts</span>
                                    <button className="btn btn-primary btn-sm" disabled={!user || user.ecoPoints < ngo.cost}>
                                        Donate
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rewards-section">
                <h2>Get Rewards 🎁</h2>
                <p>Exclusive perks for sustainable travelers.</p>
                <div className="rewards-grid">
                    {passes.map(pass => (
                        <div key={pass.id} className="reward-card pass-card">
                            <div className="reward-icon">{pass.image}</div>
                            <div className="reward-info">
                                <h3>{pass.name}</h3>
                                <p>{pass.desc}</p>
                                <div className="cost-row">
                                    <span className="cost">{pass.cost} pts</span>
                                    <button className="btn btn-secondary btn-sm" disabled={!user || user.ecoPoints < pass.cost}>
                                        Redeem
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
