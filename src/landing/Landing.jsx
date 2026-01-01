import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
    return (
        <div className="landing">
            <section className="hero">
                <div className="container hero-content">
                    <h1 className="hero-title">
                        Travel the World, <br />
                        <span className="text-gradient">Leave No Trace.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Plan collaborative trips, split expenses fairly, and track your carbon footprint.
                        Join the community of conscious travelers today.
                    </p>
                    <Link to="/login" className="btn btn-primary btn-lg">
                        Start Your Journey
                    </Link>
                </div>
                <div className="hero-visual">
                    {/* Placeholder for a cool SVG or Image */}
                    <div className="eco-circle"></div>
                </div>
            </section>

            <section className="features container">
                <div className="feature-card">
                    <div className="icon">🗺️</div>
                    <h3>Easy Planning</h3>
                    <p>Collaborate on itineraries in real-time with friends.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">💸</div>
                    <h3>Fair Splitting</h3>
                    <p>Track expenses and settle debts without the awkwardness.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">🌱</div>
                    <h3>Eco Insights</h3>
                    <p>See the carbon impact of your travel choices and get rewards.</p>
                </div>
            </section>
        </div>
    );
}
