const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Defaults
db.defaults({ users: [], trips: [], expenses: [] }).write();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// --- Auth Routes ---
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = db.get('users').find({ email }).value();
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const user = {
        id: uuidv4(),
        name,
        email,
        password,
        ecoPoints: 10, // Initial points
        donatedPoints: 0
    };
    db.get('users').push(user).write();
    res.json(user);
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.get('users').find({ email, password }).value();
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json(user);
});

app.post('/api/auth/google', (req, res) => {
    const { name, email, photoUrl } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    let user = db.get('users').find({ email }).value();

    if (!user) {
        user = {
            id: uuidv4(),
            name,
            email,
            password: null,
            photoUrl,
            ecoPoints: 10, // Initial points (was 100)
            donatedPoints: 0
        };
        db.get('users').push(user).write();
    } else {
        db.get('users').find({ email }).assign({ name, photoUrl }).write();
    }

    res.json(user);
});

// --- Trip Routes ---
app.post('/api/trips', (req, res) => {
    const { name, userId, destination } = req.body;
    const trip = {
        id: uuidv4(),
        name,
        destination,
        creatorId: userId,
        members: [userId], // Creator is first member
        shareCode: uuidv4().slice(0, 8), // Simple share code
        expenses: [],
        date: new Date().toISOString()
    };
    db.get('trips').push(trip).write();
    res.json(trip);
});

// ... (other trip routes)

// --- Leaderboard & Impact ---
app.get('/api/leaderboard', (req, res) => {
    // Return ALL users sorted by ecoPoints (no take() limit)
    const leaders = db.get('users')
        .orderBy(['ecoPoints'], ['desc'])
        .value()
        .map(u => ({
            id: u.id,
            name: u.name,
            photoUrl: u.photoUrl,
            ecoPoints: u.ecoPoints || 0,
            donatedPoints: u.donatedPoints || 0
        }));
    res.json(leaders);
});

app.post('/api/donate', (req, res) => {
    const { userId, amount, cause } = req.body;
    const user = db.get('users').find({ id: userId }).value();

    if (!user || (user.ecoPoints || 0) < amount) {
        return res.status(400).json({ error: "Insufficient points" });
    }

    // Deduct points
    const newBalance = (user.ecoPoints || 0) - amount;
    const newDonated = (user.donatedPoints || 0) + amount;

    db.get('users').find({ id: userId })
        .assign({ ecoPoints: newBalance, donatedPoints: newDonated })
        .write();

    // Record donation (optional, for history)
    // db.get('donations').push({ userId, amount, cause, date: new Date() }).write();

    res.json({ success: true, newBalance, newDonated });
});

// --- Expense Routes ---
app.post('/api/expenses', (req, res) => {
    const { tripId, description, amount, payerId, splitDetails, isEcoFriendly } = req.body;
    // splitDetails: { [userId]: splitAmount } or just generic equal split logic handled by frontend sending exact amounts?
    // Let's assume standard split: simple equal split for now or frontend calculates. 
    // User asked for "split expense or not and with who all".
    // Let's store: splitWith: [userIds].

    const expense = {
        id: uuidv4(),
        tripId,
        description,
        amount: parseFloat(amount),
        payerId,
        splitWith: req.body.splitWith, // Array of user IDs involved
        date: new Date().toISOString(),
        isEcoFriendly: isEcoFriendly || false
    };

    db.get('expenses').push(expense).write();

    // Eco Points Logic
    if (isEcoFriendly) {
        const user = db.get('users').find({ id: payerId }).value();
        const currentPoints = user.ecoPoints || 0;
        db.get('users').find({ id: payerId }).assign({ ecoPoints: currentPoints + 50 }).write();
    }

    res.json(expense);
});

app.get('/api/expenses/:tripId', (req, res) => {
    const expenses = db.get('expenses').filter({ tripId: req.params.tripId }).value();
    res.json(expenses);
});

// --- Settlement/Split Logic ---
app.get('/api/trips/:id/summary', (req, res) => {
    const tripId = req.params.id;
    const expenses = db.get('expenses').filter({ tripId }).value();
    const trip = db.get('trips').find({ id: tripId }).value();

    // Calculate specific debts
    // Map of UserID -> Net Balance (Positive = Owed, Negative = Owes)
    const balances = {};

    // Initialize 0
    trip.members.forEach(m => balances[m] = 0);

    expenses.forEach(exp => {
        const paidBy = exp.payerId;
        const amount = exp.amount;
        const splitters = exp.splitWith || trip.members; // Default to all if not specified

        if (splitters.length > 0) {
            const splitAmount = amount / splitters.length;

            // Payer gets + (Total - their share if they are in split)
            // Actually simpler: Payer pays full amount.
            // Everyone in split owes (Amount/N).
            // So Payer Net Change = +Amount.
            // Everyone in split Net Change = -SplitAmount.

            if (!balances[paidBy]) balances[paidBy] = 0;
            balances[paidBy] += amount;

            splitters.forEach(uid => {
                if (!balances[uid]) balances[uid] = 0;
                balances[uid] -= splitAmount;
            });
        }
    });

    // Simplify Debts (Who pays whom)
    // This is a naive implementation
    const debts = [];
    const debtors = [];
    const creditors = [];

    Object.keys(balances).forEach(uid => {
        const val = balances[uid];
        if (val < -0.01) debtors.push({ id: uid, amount: -val });
        if (val > 0.01) creditors.push({ id: uid, amount: val });
    });

    // Match them
    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
        const debtor = debtors[d];
        const creditor = creditors[c];

        const amount = Math.min(debtor.amount, creditor.amount);

        debts.push({
            from: debtor.id,
            to: creditor.id,
            amount: parseFloat(amount.toFixed(2))
        });

        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount < 0.01) d++;
        if (creditor.amount < 0.01) c++;
    }

    res.json({ balances, debts });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
