import React, { useState } from 'react';
import './ExpenseTracker.css';

export default function ExpenseTracker() {
    const [expenses, setExpenses] = useState([
        { id: 1, title: "Train Tickets", amount: 120, payer: "Alice", date: "Dec 10" },
        { id: 2, title: "Eco-Lodge Deposit", amount: 450, payer: "You", date: "Dec 12" },
        { id: 3, title: "Vegan Dinner", amount: 85, payer: "Bob", date: "Dec 12" }
    ]);

    const [showAddForm, setShowAddForm] = useState(false);

    // Simple calculation mock
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const myShare = total / 3; // Assuming 3 people
    const paidByMe = expenses.filter(e => e.payer === 'You').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = paidByMe - myShare;

    return (
        <div className="expenses-container">
            <div className="expenses-summary">
                <div className="summary-card total">
                    <h3>Total Trip Cost</h3>
                    <p className="amount">₹{total.toFixed(2)}</p>
                </div>
                <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
                    <h3>Your Balance</h3>
                    <p className="amount">
                        {balance >= 0 ? '+' : '-'}₹{Math.abs(balance).toFixed(2)}
                    </p>
                    <span className="status">{balance >= 0 ? "You are owed" : "You owe"}</span>
                </div>
            </div>

            <div className="expenses-list-section">
                <div className="section-header">
                    <h3>Recent Expenses</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>+ Add Expense</button>
                </div>

                {showAddForm && (
                    <div className="add-expense-form">
                        <input type="text" placeholder="Description" className="input-sm" />
                        <input type="number" placeholder="Amount" className="input-sm" />
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(false)}>Save</button>
                    </div>
                )}

                <ul className="expenses-list">
                    {expenses.map(expense => (
                        <li key={expense.id} className="expense-item">
                            <div className="expense-icon">🧾</div>
                            <div className="expense-details">
                                <h4>{expense.title}</h4>
                                <p className="expense-meta">Paid by {expense.payer} • {expense.date}</p>
                            </div>
                            <div className="expense-amount highlight">
                                ${expense.amount}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
