import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import './TripDetail.css';

export default function TripDetail({ tripId }) {
    const [trip, setTrip] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [settlement, setSettlement] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('expenses'); // expenses | settlement
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const { user, refreshUser } = useAuth();

    const handleShare = async (platform) => {
        const joinUrl = `${window.location.origin}/join/${trip.shareCode}`;
        const text = `Join my trip "${trip.name}" on EcoShare! 🌍✈️\n\nClick here to join: ${joinUrl}`;

        if (platform === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: `Join ${trip.name}`,
                    text: text,
                    url: joinUrl,
                });
            } catch (e) { console.error('Share failed', e); }
        } else if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        } else if (platform === 'telegram') {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(joinUrl)}&text=${encodeURIComponent(text)}`, '_blank');
        } else if (platform === 'mail') {
            window.location.href = `mailto:?subject=Join my trip ${trip.name}&body=${encodeURIComponent(text)}`;
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(joinUrl);
            alert('Link copied to clipboard! 📋');
        }
        setShowShareMenu(false);
    };

    // Expense Form State
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [isManualEco, setIsManualEco] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [verificationData, setVerificationData] = useState(null);
    const [payerId, setPayerId] = useState('');
    const [splitWith, setSplitWith] = useState([]);

    // Proof Viewer State
    const [viewingProof, setViewingProof] = useState(null);

    // Name Editing State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');


    useEffect(() => {
        fetchTripData();
    }, [tripId]);

    const fetchTripData = async () => {
        setLoading(true);
        try {
            const tripRes = await fetch(`${API_URL}/trips/${tripId}`);
            if (tripRes.ok) {
                const tripData = await tripRes.json();
                setTrip(tripData);
                setEditedName(tripData.name);
                // Pre-fill payer and splitters when trip loads
                if (payerId === '') setPayerId(user.id);
                if (splitWith.length === 0) setSplitWith(tripData.members.map(m => m.id));
            }

            const expRes = await fetch(`${API_URL}/expenses/${tripId}`);
            if (expRes.ok) setExpenses(await expRes.json());

            const setRes = await fetch(`${API_URL}/trips/${tripId}/summary`);
            if (setRes.ok) setSettlement(await setRes.json());

        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleUpdateName = async () => {
        if (!editedName.trim() || editedName === trip.name) {
            setIsEditingName(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/trips/${tripId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editedName })
            });

            if (res.ok) {
                const updatedTrip = await res.json();
                setTrip(prev => ({ ...prev, name: updatedTrip.name }));
                setIsEditingName(false);
            }
        } catch (e) {
            console.error('Failed to update trip name:', e);
        }
    };

    const handleMarkAsPaid = async (debt) => {
        if (!window.confirm(`Confirm that ${trip.members.find(m => m.id === debt.from)?.name} has paid ₹${debt.amount} to ${trip.members.find(m => m.id === debt.to)?.name}?`)) return;

        try {
            const res = await fetch(`${API_URL}/settlements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId,
                    fromUserId: debt.from,
                    toUserId: debt.to,
                    amount: debt.amount
                })
            });

            if (res.ok) {
                fetchTripData(); // Refresh to show updated balances
            }
        } catch (e) { console.error(e); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofFile(file);
            // Capture Metadata immediately
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(pos => {
                    setVerificationData({
                        timestamp: new Date().toISOString(),
                        location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    });
                }, err => console.log("Loc error", err));
            } else {
                setVerificationData({ timestamp: new Date().toISOString(), location: null });
            }
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!amount || !desc) return;

        const allMemberIds = trip.members.map(m => m.id);
        const lowerDesc = desc.toLowerCase();

        // Expanded Eco Detection
        const isAutoEco = lowerDesc.includes('train') ||
            lowerDesc.includes('bus') ||
            lowerDesc.includes('vegan') ||
            lowerDesc.includes('cycle') ||
            lowerDesc.includes('bike') ||
            lowerDesc.includes('walk') ||
            lowerDesc.includes('electric') ||
            lowerDesc.includes('carpool');

        const isEco = isManualEco || isAutoEco;
        let proofUrl = null;

        if (isEco && proofFile) {
            setUploading(true);
            const formData = new FormData();
            formData.append('proof', proofFile);
            try {
                const upRes = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
                if (upRes.ok) {
                    const data = await upRes.json();
                    proofUrl = data.url;
                }
            } catch (err) { console.error("Upload failed", err); }
            setUploading(false);
        }

        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId,
                    description: desc,
                    amount,
                    payerId: payerId || user.id,
                    splitWith: splitWith.length > 0 ? splitWith : trip.members.map(m => m.id),
                    isEcoFriendly: isEco,
                    proofImageUrl: proofUrl,
                    verification: proofUrl ? verificationData : null
                })
            });

            if (res.ok) {
                setShowExpenseForm(false);
                setDesc(''); setAmount(''); setIsManualEco(false); setProofFile(null);
                fetchTripData(); // Refresh trip data
                // Refresh user data to update eco-points and trigger activity feed update
                if (refreshUser) await refreshUser();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense? Eco points awarded for this will also be reversed.")) return;
        try {
            const res = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTripData();
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-4" style={{ color: 'white' }}>Loading...</div>;
    if (!trip) return <div className="p-4" style={{ color: 'white' }}>Trip not found</div>;

    return (
        <div className="trip-detail fade-in">
            {/* Proof Viewer Modal */}
            {viewingProof && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setViewingProof(null)}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#1e293b', border: '1px solid var(--accent)', padding: '0', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewingProof(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10 }}>✕</button>

                        <img src={viewingProof.proofImageUrl} alt="Proof" style={{ width: '100%', height: 'auto', display: 'block', borderBottom: '1px solid var(--glass-border)' }} />

                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 'bold' }}>
                                ✅ Verified Proof
                            </h3>
                            <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                For: <strong>{viewingProof.description}</strong>
                            </p>

                            <div className="meta-grid" style={{ display: 'grid', gap: '1rem', background: 'rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {viewingProof.verification?.timestamp && (
                                    <div className="meta-item">
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>🕒 Time Captured</div>
                                        <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>{new Date(viewingProof.verification.timestamp).toLocaleString()}</div>
                                    </div>
                                )}

                                {viewingProof.verification?.location && (
                                    <div className="meta-item">
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>📍 Location</div>
                                        <a
                                            href={`https://www.google.com/maps?q=${viewingProof.verification.location.lat},${viewingProof.verification.location.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-link"
                                            style={{ color: 'var(--primary-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold', textDecoration: 'none' }}
                                        >
                                            View on Google Maps ↗
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Link to="/dashboard/history" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                ← Back to Trips
            </Link>

            <div className="trip-header-card glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <div style={{ flex: 1 }}>
                    {isEditingName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--primary)',
                                    color: 'white',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '0.5rem',
                                    width: '100%',
                                    maxWidth: '400px'
                                }}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateName();
                                    if (e.key === 'Escape') setIsEditingName(false);
                                }}
                            />
                            <button className="btn btn-primary" onClick={handleUpdateName} style={{ padding: '0.5rem 1rem' }}>Save</button>
                            <button className="btn btn-secondary" onClick={() => setIsEditingName(false)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                        </div>
                    ) : (
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {trip.name}
                            <button
                                onClick={() => setIsEditingName(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    opacity: 0.5,
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                onMouseOut={(e) => e.currentTarget.style.opacity = 0.5}
                                title="Edit Trip Name"
                            >
                                ✏️
                            </button>
                        </h1>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className="invite-btn-cute"
                            onClick={() => {
                                if (navigator.share) {
                                    handleShare('native');
                                } else {
                                    setShowShareMenu(true);
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: '#ecfdf5',
                                border: 'none',
                                padding: '0.5rem 1.2rem',
                                borderRadius: '2rem',
                                color: '#059669',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.1)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
                                e.currentTarget.style.background = '#d1fae5';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.background = '#ecfdf5';
                            }}
                        >
                            <span style={{ fontSize: '1rem' }}>+</span>
                            <span>Invite</span>
                        </button>

                        <div
                            className="code-display"
                            onClick={() => {
                                navigator.clipboard.writeText(trip.shareCode);
                                alert('Code copied! 📋');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                            title="Click to copy code"
                        >
                            <span style={{ color: 'var(--text-muted)' }}>Code:</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>{trip.shareCode}</span>
                            <span style={{ opacity: 0.5 }}>📋</span>
                        </div>

                        {showShareMenu && (
                            <div className="share-modal-overlay" onClick={() => setShowShareMenu(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                                <div className="share-card glass-panel" onClick={e => e.stopPropagation()} style={{
                                    background: 'var(--bg-card)',
                                    width: '100%',
                                    maxWidth: '400px',
                                    borderRadius: '1.25rem',
                                    padding: '2rem',
                                    animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Invite Friends</h3>
                                        <button onClick={() => setShowShareMenu(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
                                    </div>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                        Anyone with this link can join your trip and contribute to expenses.
                                    </p>

                                    <div className="link-section" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                                        <div style={{ flex: 1, background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {`${window.location.origin}/join/${trip.shareCode}`}
                                        </div>
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className="btn btn-primary"
                                            style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}
                                        >
                                            Copy
                                        </button>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '1rem' }}>Or share via</span>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                            <button onClick={() => handleShare('whatsapp')} className="share-bubble" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', transition: 'transform 0.2s' }}>💬</div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>WhatsApp</span>
                                            </button>
                                            <button onClick={() => handleShare('telegram')} className="share-bubble" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>✈️</div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Telegram</span>
                                            </button>
                                            <button onClick={() => handleShare('mail')} className="share-bubble" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>✉️</div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</span>
                                            </button>
                                            <button onClick={() => handleShare('native')} className="share-bubble" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>⋮</div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>More</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="members-list" style={{ display: 'flex' }}>
                    {trip.members.map((m, i) => (
                        <div key={m.id} className="member-avatar" title={m.name} style={{ width: '40px', height: '40px', borderRadius: '50%', background: `hsl(${i * 60}, 70%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginLeft: '-10px', border: '2px solid var(--bg-dark)' }}>
                            {m.name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            <div className="trip-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <button
                    className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('expenses')}
                >
                    Expenses
                </button>
                <button
                    className={`btn ${activeTab === 'settlement' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('settlement')}
                >
                    Settle Up
                </button>
            </div>

            <div className="trip-content">
                {activeTab === 'expenses' && (
                    <>
                        <div className="expenses-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>All Expenses</h3>
                            <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>+ Add Expense</button>
                        </div>

                        {showExpenseForm && (
                            <div className="expense-form-card glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--primary-500)' }}>
                                <form onSubmit={handleAddExpense}>
                                    <h3 style={{ marginBottom: '1rem' }}>Add New Expense</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</label>
                                            <input type="text" placeholder="e.g. Dinner" className="input" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={desc} onChange={e => setDesc(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount</div>
                                            <input type="number" placeholder="0.00" className="input" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={amount} onChange={e => setAmount(e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                        {/* Paid By Selection */}
                                        <div className="form-section">
                                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Paid By</label>
                                            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', whiteSpace: 'nowrap' }}>
                                                {trip.members.map((m, i) => (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => setPayerId(m.id)}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.35rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease',
                                                            background: payerId === m.id ? '#f0fdf4' : 'rgba(255,255,255,0.03)',
                                                            color: payerId === m.id ? '#15803d' : 'var(--text-main)',
                                                            border: '1px solid',
                                                            borderColor: payerId === m.id ? '#22c55e' : 'rgba(255,255,255,0.08)',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            background: payerId === m.id ? '#22c55e' : `hsl(${i * 60}, 60%, 45%)`,
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {payerId === m.id ? '✓' : m.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: payerId === m.id ? '700' : '500' }}>
                                                            {m.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Split With Selection */}
                                        <div className="form-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Split With</label>
                                                <button
                                                    type="button"
                                                    onClick={() => splitWith.length === trip.members.length ? setSplitWith([]) : setSplitWith(trip.members.map(m => m.id))}
                                                    style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
                                                >
                                                    {splitWith.length === trip.members.length ? 'None' : 'All'}
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                {trip.members.map(m => (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => {
                                                            if (splitWith.includes(m.id)) setSplitWith(splitWith.filter(id => id !== m.id));
                                                            else setSplitWith([...splitWith, m.id]);
                                                        }}
                                                        style={{
                                                            padding: '0.35rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.1s ease',
                                                            background: splitWith.includes(m.id) ? '#f0fdf4' : 'rgba(255,255,255,0.03)',
                                                            color: splitWith.includes(m.id) ? '#15803d' : 'var(--text-secondary)',
                                                            border: '1px solid',
                                                            borderColor: splitWith.includes(m.id) ? '#22c55e' : 'rgba(255,255,255,0.08)',
                                                            fontWeight: splitWith.includes(m.id) ? '700' : '500'
                                                        }}
                                                    >
                                                        {m.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="eco-toggle" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setIsManualEco(!isManualEco)}>
                                            <div style={{
                                                width: '20px', height: '20px',
                                                borderRadius: '4px',
                                                border: '2px solid var(--accent)',
                                                background: isManualEco ? 'var(--accent)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isManualEco && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                                            </div>
                                            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>🌱 This is an eco-friendly expense (+50 pts)</span>
                                        </div>

                                        {(isManualEco || (desc && (desc.toLowerCase().includes('cycle') || desc.toLowerCase().includes('bike') || desc.toLowerCase().includes('walk') || desc.toLowerCase().includes('electric') || desc.toLowerCase().includes('carpool') || desc.toLowerCase().includes('train') || desc.toLowerCase().includes('bus') || desc.toLowerCase().includes('vegan')))) && (
                                            <div className="proof-section" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px dashed var(--accent)' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>
                                                    📸 Verification Photo Required for Points
                                                </label>
                                                <input type="file" onChange={handleFileChange} accept="image/*" style={{ fontSize: '0.9rem' }} required />
                                                {verificationData && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>📍 Location tagged & Time captured</div>}
                                                {!proofFile && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--accent-600)', fontWeight: 'bold' }}>⚠️ Proof is mandatory for green points</div>}
                                            </div>
                                        )}
                                    </div>

                                    <p className="hint-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                        💡 Tip: We also auto-detect keywords like "Cycle", "Bus", "Train", "Vegan".
                                    </p>
                                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button type="button" onClick={() => setShowExpenseForm(false)} className="btn btn-secondary">Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={uploading || ((isManualEco || (desc && (desc.toLowerCase().includes('cycle') || desc.toLowerCase().includes('bike') || desc.toLowerCase().includes('walk') || desc.toLowerCase().includes('electric') || desc.toLowerCase().includes('carpool') || desc.toLowerCase().includes('train') || desc.toLowerCase().includes('bus') || desc.toLowerCase().includes('vegan')))) && !proofFile)}>
                                            {uploading ? 'Uploading Proof...' : 'Save Expense'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <ul className="expense-list-detail" style={{ listStyle: 'none' }}>
                            {expenses.map(exp => {
                                const payerName = trip.members.find(m => m.id === exp.payerId)?.name || 'Unknown';
                                return (
                                    <li key={exp.id} className="expense-row glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '1rem', marginBottom: '0.75rem' }}>
                                        <div className="exp-icon" style={{ fontSize: '1.5rem', marginRight: '1rem', background: exp.isEcoFriendly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', position: 'relative' }}>
                                            {exp.isEcoFriendly ? '🌱' : '💰'}
                                            {exp.proofImageUrl && (
                                                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '1px solid var(--accent)' }}>
                                                    ✅
                                                </div>
                                            )}
                                        </div>
                                        <div className="exp-info" style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {exp.description}
                                                {exp.verification && <span title="Verified with GPS & Time" style={{ fontSize: '0.7rem', background: 'var(--accent)', color: 'white', padding: '1px 6px', borderRadius: '4px' }}>VERIFIED</span>}
                                            </h4>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                Paid by <strong>{payerName}</strong> for everyone
                                                {exp.proofImageUrl && (
                                                    <button
                                                        onClick={() => setViewingProof(exp)}
                                                        className="text-btn"
                                                        style={{ marginLeft: '0.5rem', color: 'var(--primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
                                                    >
                                                        View Proof
                                                    </button>
                                                )}
                                            </p>
                                        </div>
                                        <div className="exp-amount" style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            ₹{exp.amount.toFixed(2)}
                                            <button
                                                onClick={() => handleDeleteExpense(exp.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#ff4d4f', opacity: 0.7, padding: '5px' }}
                                                title="Delete Expense"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                {activeTab === 'settlement' && settlement && (
                    <div className="settlement-view">
                        <h3>Balances</h3>
                        <div className="balance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {Object.keys(settlement.balances).map(uid => {
                                const userObj = trip.members.find(m => m.id === uid);
                                const bal = settlement.balances[uid];
                                if (!userObj) return null;
                                return (
                                    <div key={uid} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${bal >= 0 ? 'var(--primary-500)' : 'var(--accent-600)'}` }}>
                                        <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>{userObj.name}</div>
                                        <div style={{ fontSize: '1.5rem', color: bal >= 0 ? 'var(--primary-500)' : 'var(--accent-600)' }}>
                                            {bal >= 0 ? '+' : ''}{bal.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bal >= 0 ? 'gets back' : 'owes'}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <h3>How to Settle Up</h3>
                        <ul className="debt-list" style={{ listStyle: 'none' }}>
                            {settlement.debts.length === 0 ? <p>All settled up!</p> : settlement.debts.map((d, i) => {
                                const fromName = trip.members.find(m => m.id === d.from)?.name;
                                const toName = trip.members.find(m => m.id === d.to)?.name;
                                return (
                                    <li key={i} className="debt-item glass-panel" style={{ padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span><strong>{fromName}</strong> pays <strong>{toName}</strong></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span className="money" style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>₹{d.amount}</span>
                                            {(user.id === d.from || user.id === d.to) && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(d)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                >
                                                    ✓ Mark as Paid
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        {settlement.settlements && settlement.settlements.length > 0 && (
                            <>
                                <h3 style={{ marginTop: '2rem' }}>Payment History</h3>
                                <ul className="settlement-history" style={{ listStyle: 'none' }}>
                                    {settlement.settlements.map((s, i) => {
                                        const fromName = trip.members.find(m => m.id === s.fromUserId)?.name;
                                        const toName = trip.members.find(m => m.id === s.toUserId)?.name;
                                        return (
                                            <li key={i} className="glass-panel" style={{ padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                                                <div>
                                                    <span style={{ color: 'var(--accent)' }}>✓</span> <strong>{fromName}</strong> paid <strong>{toName}</strong>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                        {new Date(s.date).toLocaleString()}
                                                    </div>
                                                </div>
                                                <span className="money" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{s.amount.toFixed(2)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

