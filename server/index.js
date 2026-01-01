const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Defaults
db.defaults({ users: [], trips: [], expenses: [] }).write();

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Serve uploaded proofs from the correct absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

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

// Upload Proof
app.post('/api/upload', upload.single('proof'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `http://localhost:3000/uploads/${req.file.filename}` });
});

// --- Trip Routes ---
// --- Trip Routes ---
app.post('/api/trips', (req, res) => {
    const { name, userId, destination } = req.body;
    const trip = {
        id: uuidv4(),
        name,
        destination,
        creatorId: userId,
        members: [userId], // Store IDs only for consistency
        shareCode: uuidv4().slice(0, 8),
        expenses: [],
        date: new Date().toISOString()
    };
    db.get('trips').push(trip).write();
});

// Get trips for a specific user
app.get('/api/trips/user/:userId', (req, res) => {
    const { userId } = req.params;
    // Find trips where members array contains an object with id == userId
    // Note: LowDB filter might need adjustment depending on how members are stored.
    // If members were just IDs: .filter(t => t.members.includes(userId))
    // But in POST /api/trips we are now storing objects.
    // Let's stick to storing IDs to be consistent with existing data, or handle both.

    // Correction: Existing data (db.json) shows "members": ["id1", "id2"].
    // So the POST above (which I just pasted) was trying to be too smart. Let's revert to storing just IDs
    // but when fetching, we might want to populate names if needed, OR the frontend handles it.

    const trips = db.get('trips')
        .filter(trip => trip.members.some(m => (typeof m === 'string' ? m === userId : m.id === userId)))
        .value();
    res.json(trips);
});

app.get('/api/trips/:id', (req, res) => {
    const trip = db.get('trips').find({ id: req.params.id }).value();
    if (trip) {
        // Hydrate members
        const hydratedMembers = trip.members.map(mId => {
            // Handle if member is already object
            const uid = typeof mId === 'string' ? mId : mId.id;
            const user = db.get('users').find({ id: uid }).value();
            return user ? { id: user.id, name: user.name, photoUrl: user.photoUrl } : { id: uid, name: 'Unknown' };
        });
        res.json({ ...trip, members: hydratedMembers });
    } else {
        res.status(404).json({ error: "Trip not found" });
    }
});

// Delete a trip
app.delete('/api/trips/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete trip with ID: ${id}`);

    // Use lowdb v1 syntax: .remove() returns the removed elements
    const removed = db.get('trips').remove({ id }).write();

    if (removed && removed.length > 0) {
        console.log(`Trip ${id} deleted successfully.`);
        res.json({ success: true });
    } else {
        console.error(`Trip ${id} not found.`);
        res.status(404).json({ error: 'Trip not found' });
    }
});

app.post('/api/trips/join', (req, res) => {
    const { userId, shareCode } = req.body;
    const trip = db.get('trips').find({ shareCode }).value();

    if (!trip) return res.status(404).json({ error: "Invalid code" });

    // Check if already member
    const isMember = trip.members.some(m => (typeof m === 'string' ? m === userId : m.id === userId));
    if (!isMember) {
        trip.members.push(userId); // Store ID to be consistent
        db.get('trips').find({ id: trip.id }).assign({ members: trip.members }).write();
    }

    res.json(trip);
});

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
    const { tripId, description, amount, payerId, splitDetails, isEcoFriendly, proofImageUrl, verification } = req.body;
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
        isEcoFriendly: isEcoFriendly || false,
        proofImageUrl: proofImageUrl || null,
        verification: verification || null // { timestamp, location }
    };

    db.get('expenses').push(expense).write();

    // Eco Points Logic
    if (isEcoFriendly) {
        // Points are 50, but verification is now mandatory (enforced by frontend)
        const points = 50;
        const user = db.get('users').find({ id: payerId }).value();
        const currentPoints = user.ecoPoints || 0;
        db.get('users').find({ id: payerId }).assign({ ecoPoints: currentPoints + points }).write();
    }

    res.json(expense);
});

app.get('/api/expenses/:tripId', (req, res) => {
    const expenses = db.get('expenses').filter({ tripId: req.params.tripId }).value();
    res.json(expenses);
});

// --- Settlement/Split Logic ---
app.get('/api/trips/:id/summary', async (req, res) => {
    const tripId = req.params.id;
    await db.read(); // Ensure fresh data
    const trip = db.get('trips').find({ id: tripId }).value();
    const expenses = db.get('expenses').filter(e => e.tripId === tripId).value();

    console.log(`Summary for Trip ${tripId}:`); // Keep debug for now
    console.log(`Found Trip: ${trip ? trip.name : 'NULL'}`);
    console.log(`Found Expenses: ${expenses.length}`);
    expenses.forEach(e => console.log(` - Exp: ${e.description}, Amount: ${e.amount}, Payer: ${e.payerId}`));

    // Calculate specific debts
    // Map of UserID -> Net Balance (Positive = Owed, Negative = Owes)
    const balances = {};

    // Initialize 0
    // Initialize 0
    // Fix: Handle members being potentially objects or strings
    trip.members.forEach(m => {
        const uid = typeof m === 'string' ? m : m.id;
        balances[uid] = 0;
    });

    expenses.forEach(exp => {
        const paidBy = exp.payerId;
        const amount = exp.amount;

        // Dynamic Split: Always split with ALL current trip members.
        // This fixes issues where expenses added before a member joined wouldn't include them.
        // It aligns with the UI "Paid for everyone".
        let splitIds = trip.members.map(m => (typeof m === 'string' ? m : m.id));

        if (splitIds.length > 0) {
            const splitAmount = amount / splitIds.length;

            // Payer gets + (Total - their share if they are in split)
            // Actually simpler: Payer pays full amount.
            // Everyone in split owes (Amount/N).
            // So Payer Net Change = +Amount.
            // Everyone in split Net Change = -SplitAmount.

            if (!balances[paidBy]) balances[paidBy] = 0;
            balances[paidBy] += amount;
            console.log(`   > Payer (${paidBy}) +${amount} -> New Bal: ${balances[paidBy]}`);

            splitIds.forEach(uid => {
                if (balances[uid] === undefined) balances[uid] = 0; // Ensure initialized
                balances[uid] -= splitAmount;
                console.log(`   > Splitter (${uid}) -${splitAmount} -> New Bal: ${balances[uid]}`);
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
