import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TripDetail.css';

export default function TripDetail({ tripId }) {
    const [trip, setTrip] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [settlement, setSettlement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('expenses'); // expenses | settlement
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const { user } = useAuth();

    // Expense Form State
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [isManualEco, setIsManualEco] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [verificationData, setVerificationData] = useState(null);

    // Proof Viewer State
    const [viewingProof, setViewingProof] = useState(null);

    const API_URL = 'http://localhost:3000/api';

    useEffect(() => {
        fetchTripData();
    }, [tripId]);

    const fetchTripData = async () => {
        setLoading(true);
        try {
            const tripRes = await fetch(`${API_URL}/trips/${tripId}`);
            if (tripRes.ok) setTrip(await tripRes.json());

            const expRes = await fetch(`${API_URL}/expenses/${tripId}`);
            if (expRes.ok) setExpenses(await expRes.json());

            const setRes = await fetch(`${API_URL}/trips/${tripId}/summary`);
            if (setRes.ok) setSettlement(await setRes.json());

        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const code = trip ? trip.shareCode : '';

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
                    payerId: user.id,
                    splitWith: allMemberIds,
                    isEcoFriendly: isEco,
                    proofImageUrl: proofUrl,
                    verification: proofUrl ? verificationData : null
                })
            });

            if (res.ok) {
                setShowExpenseForm(false);
                setDesc(''); setAmount(''); setIsManualEco(false); setProofFile(null);
                fetchTripData(); // Refresh all
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
                            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✅ Verified Proof
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                For: <strong>{viewingProof.description}</strong>
                            </p>

                            <div className="meta-grid" style={{ display: 'grid', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                {viewingProof.verification?.timestamp && (
                                    <div className="meta-item">
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🕒 Time Captured</div>
                                        <div style={{ fontWeight: 'bold' }}>{new Date(viewingProof.verification.timestamp).toLocaleString()}</div>
                                    </div>
                                )}

                                {viewingProof.verification?.location && (
                                    <div className="meta-item">
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 Location</div>
                                        <a
                                            href={`https://www.google.com/maps?q=${viewingProof.verification.location.lat},${viewingProof.verification.location.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-link"
                                            style={{ color: 'var(--primary-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}
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

            <div className="trip-header-card glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{trip.name}</h1>
                    <p className="trip-invite" style={{ color: 'var(--text-muted)' }}>
                        Share Code: <span className="code-badge" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace', marginLeft: '0.5rem' }}>{code}</span>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(code)} style={{ marginLeft: '1rem', opacity: 0.7 }}>📋</button>
                    </p>
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
                                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <input type="text" placeholder="Description (e.g. Dinner)" className="input" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={desc} onChange={e => setDesc(e.target.value)} />
                                        <input type="number" placeholder="Amount" className="input" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={amount} onChange={e => setAmount(e.target.value)} />
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
                                        <div className="exp-amount" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{exp.amount.toFixed(2)}</div>
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
                                    <li key={i} className="debt-item glass-panel" style={{ padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span><strong>{fromName}</strong> pays <strong>{toName}</strong></span>
                                        <span className="money" style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>₹{d.amount}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

