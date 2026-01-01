import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="dashboard container">
            <main className="dash-content-full glass-panel" style={{ padding: '2rem', minHeight: '600px' }}>
                <Outlet />
            </main>
        </div>
    );
}

