import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

export default function JoinTrip() {
    const { shareCode } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const join = async () => {
            if (!user) {
                // Store join code to handle after login
                localStorage.setItem('pendingJoinCode', shareCode);
                navigate('/login');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/trips/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, shareCode })
                });

                if (res.ok) {
                    const trip = await res.json();
                    navigate(`/dashboard/trips/${trip.id}`);
                } else {
                    alert('Invalid or expired join link');
                    navigate('/dashboard');
                }
            } catch (e) {
                console.error(e);
                navigate('/dashboard');
            }
        };

        join();
    }, [shareCode, user, navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'white' }}>
            <h2>Joining Trip...</h2>
            <div className="loader"></div>
        </div>
    );
}
