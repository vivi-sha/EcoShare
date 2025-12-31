import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './TripDetail.css';

export default function TripDetail({ tripId, onBack }) {
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

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!amount || !desc) return;

        // Default split: Equal split among all currently fetched members
        // Ideally we select who to split with, but for MVP/proto: all members
        const allMemberIds = trip.members.map(m => m.id);

        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId,
                    description: desc,
                    amount,
                    payerId: user.id,
                    splitWith: allMemberIds
                })
            });

            if (res.ok) {
                setShowExpenseForm(false);
                setDesc(''); setAmount('');
                fetchTripData(); // Refresh all
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (!trip) return <div className="p-4">Trip not found</div>;

    return (
        <div className="trip-detail">
            <div className="trip-header-card">
                <div>
                    <h1>{trip.name}</h1>
                    <p className="trip-invite">
                        Share Code: <span className="code-badge">{code}</span>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(code)}>📋</button>
                    </p>
                </div>
                <div className="members-list">
                    {trip.members.map(m => (
                        <div key={m.id} className="member-avatar" title={m.name}>
                            {m.name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            <div className="trip-tabs">
                <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>Expenses</button>
                <button className={activeTab === 'settlement' ? 'active' : ''} onClick={() => setActiveTab('settlement')}>Settle Up</button>
            </div>

            <div className="trip-content">
                {activeTab === 'expenses' && (
                    <>
                        <div className="expenses-actions">
                            <h3>All Expenses</h3>
                            <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>+ Add Expense</button>
                        </div>

                        {showExpenseForm && (
                            <div className="expense-form-card">
                                <form onSubmit={handleAddExpense}>
                                    <input type="text" placeholder="Description (e.g. Dinner)" className="input" value={desc} onChange={e => setDesc(e.target.value)} />
                                    <input type="number" placeholder="Amount" className="input" value={amount} onChange={e => setAmount(e.target.value)} />
                                    <p className="hint-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                        💡 Tip: Use keywords like "Train", "Bus", "Vegan" to automatically earn Eco Points!
                                    </p>
                                    <div className="form-actions">
                                        <button type="button" onClick={() => setShowExpenseForm(false)} className="btn btn-secondary">Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save Expense</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <ul className="expense-list-detail">
                            {expenses.map(exp => {
                                const payerName = trip.members.find(m => m.id === exp.payerId)?.name || 'Unknown';
                                return (
                                    <li key={exp.id} className="expense-row">
                                        <div className="exp-icon">{exp.isEcoFriendly ? '🌱' : '💰'}</div>
                                        <div className="exp-info">
                                            <h4>{exp.description}</h4>
                                            <p>Paid by <strong>{payerName}</strong> for everyone</p>
                                        </div>
                                        <div className="exp-amount">${exp.amount.toFixed(2)}</div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                {activeTab === 'settlement' && settlement && (
                    <div className="settlement-view">
                        <h3>Balances</h3>
                        <div className="balance-grid">
                            {Object.keys(settlement.balances).map(uid => {
                                const userObj = trip.members.find(m => m.id === uid);
                                const bal = settlement.balances[uid];
                                if (!userObj) return null;
                                return (
                                    <div key={uid} className={`balance-card ${bal >= 0 ? 'pos' : 'neg'}`}>
                                        <span>{userObj.name}</span>
                                        <strong>{bal >= 0 ? '+' : ''}{bal.toFixed(2)}</strong>
                                    </div>
                                );
                            })}
                        </div>

                        <h3>How to Settle Up</h3>
                        <ul className="debt-list">
                            {settlement.debts.length === 0 ? <p>All settled up!</p> : settlement.debts.map((d, i) => {
                                const fromName = trip.members.find(m => m.id === d.from)?.name;
                                const toName = trip.members.find(m => m.id === d.to)?.name;
                                return (
                                    <li key={i} className="debt-item">
                                        <strong>{fromName}</strong> pays <strong>{toName}</strong>: <span className="money">${d.amount}</span>
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
