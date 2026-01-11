const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Add db.read() to routes that need fresh data
const refreshDb = (req, res, next) => {
    db.read();
    next();
};

// Defaults
db.defaults({ users: [], trips: [], expenses: [], settlements: [], donations: [] }).write();

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

// Get single user by ID
app.get('/api/users/:id', (req, res) => {
    db.read();
    const user = db.get('users').find({ id: req.params.id }).value();
    if (user) {
        // Don't send password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
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

    // Award 5 points for starting a trip
    const user = db.get('users').find({ id: userId }).value();
    if (user) {
        db.get('users').find({ id: userId }).assign({ ecoPoints: (user.ecoPoints || 0) + 5 }).write();
    }

    res.json(trip);
});

// Get trips for a specific user
app.get('/api/trips/user/:userId', (req, res) => {
    db.read();
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
        .filter(trip => {
            const isMember = trip.members.some(m => (typeof m === 'string' ? m === userId : m.id === userId));
            const isDeletedForUser = trip.deletedForUsers && trip.deletedForUsers.includes(userId);
            return isMember && !isDeletedForUser;
        })
        .value();
    res.json(trips);
});

app.get('/api/trips/:id', (req, res) => {
    db.read();
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

// Delete/Leave a trip for a specific user
app.delete('/api/trips/:id', (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    console.log(`User ${userId} attempting to delete trip from their view: ${id}`);

    const trip = db.get('trips').find({ id }).value();

    if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
    }

    // Initialize deletedForUsers if it doesn't exist
    const deletedForUsers = trip.deletedForUsers || [];

    if (!deletedForUsers.includes(userId)) {
        deletedForUsers.push(userId);
    }

    // Check if everyone has deleted it
    // Everyone who is a member must also be in deletedForUsers
    const allMembersDeleted = trip.members.every(m => {
        const mid = typeof m === 'string' ? m : m.id;
        return deletedForUsers.includes(mid);
    });

    if (allMembersDeleted) {
        // If everyone deleted it, remove it entirely
        db.get('trips').remove({ id }).write();
        console.log(`Trip ${id} deleted entirely as all members removed it.`);
    } else {
        // Otherwise just mark it as deleted for this specific user
        db.get('trips').find({ id }).assign({ deletedForUsers }).write();
        console.log(`Trip ${id} hidden for user ${userId}.`);
    }

    res.json({ success: true });
});

// Leave a trip (officially remove from members)
app.post('/api/trips/:id/leave', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    console.log(`User ${userId} attempting to leave trip: ${id}`);

    const trip = db.get('trips').find({ id }).value();
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Filter out the user from members
    const updatedMembers = trip.members.filter(m => (typeof m === 'string' ? m !== userId : m.id !== userId));

    if (updatedMembers.length === 0) {
        db.get('trips').remove({ id }).write();
        console.log(`Trip ${id} deleted as last member left.`);
    } else {
        db.get('trips').find({ id }).assign({ members: updatedMembers }).write();
        console.log(`User ${userId} left trip ${id}.`);
    }

    res.json({ success: true });
});

app.post('/api/trips/join', (req, res) => {
    const { userId, shareCode } = req.body;
    const trip = db.get('trips').find({ shareCode }).value();

    if (!trip) return res.status(404).json({ error: "Invalid code" });

    // Check if already member
    const isMember = trip.members.some(m => (typeof m === 'string' ? m === userId : m.id === userId));
    // If user previously deleted this trip from their view, restore it
    if (trip.deletedForUsers && trip.deletedForUsers.includes(userId)) {
        const updatedDeletedFor = trip.deletedForUsers.filter(id => id !== userId);
        db.get('trips').find({ id: trip.id }).assign({ deletedForUsers: updatedDeletedFor }).write();
    }

    if (!isMember) {
        trip.members.push(userId); // Store ID to be consistent
        db.get('trips').find({ id: trip.id }).assign({ members: trip.members }).write();

        // Award 2 points for joining a trip
        const user = db.get('users').find({ id: userId }).value();
        if (user) {
            db.get('users').find({ id: userId }).assign({ ecoPoints: (user.ecoPoints || 0) + 2 }).write();
        }
    }

    res.json(trip);
});

// --- Leaderboard & Impact ---
app.get('/api/leaderboard', (req, res) => {
    db.read();
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

    // Record donation
    db.get('donations').push({
        id: uuidv4(),
        userId,
        amount,
        cause,
        date: new Date().toISOString()
    }).write();

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

app.delete('/api/expenses/:id', (req, res) => {
    db.read(); // Ensure fresh data
    const { id } = req.params;
    const expense = db.get('expenses').find({ id }).value();

    if (!expense) return res.status(404).json({ error: "Expense not found" });

    // Deduct points if it was eco-friendly
    if (expense.isEcoFriendly) {
        const user = db.get('users').find({ id: expense.payerId }).value();
        if (user) {
            const currentPoints = user.ecoPoints || 0;
            db.get('users').find({ id: expense.payerId })
                .assign({ ecoPoints: Math.max(0, currentPoints - 50) })
                .write();
        }
    }

    db.get('expenses').remove({ id }).write();
    res.json({ success: true });
});

// --- Settlement/Split Logic ---
app.get('/api/trips/:id/summary', async (req, res) => {
    const tripId = req.params.id;
    await db.read(); // Ensure fresh data
    const trip = db.get('trips').find({ id: tripId }).value();
    const expenses = db.get('expenses').filter(e => e.tripId === tripId).value();
    const settlements = db.get('settlements').filter(s => s.tripId === tripId).value();

    console.log(`Summary for Trip ${tripId}:`); // Keep debug for now
    console.log(`Found Trip: ${trip ? trip.name : 'NULL'}`);
    console.log(`Found Expenses: ${expenses.length}`);
    console.log(`Found Settlements: ${settlements.length}`);
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

        // Selective Split: Use exp.splitWith if available, otherwise fallback to everyone.
        let splitIds = exp.splitWith && exp.splitWith.length > 0
            ? exp.splitWith
            : trip.members.map(m => (typeof m === 'string' ? m : m.id));

        if (splitIds.length > 0) {
            const splitAmount = amount / splitIds.length;

            if (balances[paidBy] === undefined) balances[paidBy] = 0;
            balances[paidBy] += amount;
            console.log(`   > Payer (${paidBy}) +${amount} -> New Bal: ${balances[paidBy]}`);

            splitIds.forEach(uid => {
                if (balances[uid] === undefined) balances[uid] = 0;
                balances[uid] -= splitAmount;
                console.log(`   > Splitter (${uid}) -${splitAmount} -> New Bal: ${balances[uid]}`);
            });
        }
    });

    // Apply settlements (subtract already paid amounts)
    settlements.forEach(settlement => {
        const { fromUserId, toUserId, amount } = settlement;
        if (balances[fromUserId] !== undefined) {
            balances[fromUserId] += amount; // Debtor paid, so their balance increases
        }
        if (balances[toUserId] !== undefined) {
            balances[toUserId] -= amount; // Creditor received, so their balance decreases
        }
        console.log(`   > Settlement: ${fromUserId} paid ${toUserId} ${amount}`);
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

    res.json({ balances, debts, settlements });
});

// --- Settlement Routes ---
// Record a settlement (when someone pays their debt)
app.post('/api/settlements', (req, res) => {
    const { tripId, fromUserId, toUserId, amount } = req.body;

    if (!tripId || !fromUserId || !toUserId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const settlement = {
        id: uuidv4(),
        tripId,
        fromUserId,
        toUserId,
        amount: parseFloat(amount),
        date: new Date().toISOString()
    };

    db.get('settlements').push(settlement).write();
    res.json(settlement);
});

// Get settlements for a trip
app.get('/api/settlements/:tripId', (req, res) => {
    const settlements = db.get('settlements')
        .filter({ tripId: req.params.tripId })
        .value();
    res.json(settlements);
});

// --- Activity Feed ---
app.get('/api/user/:userId/activity', (req, res) => {
    db.read();
    const { userId } = req.params;

    const userTrips = db.get('trips')
        .filter(t => t.creatorId === userId && (!t.deletedForUsers || !t.deletedForUsers.includes(userId)))
        .value()
        .map(t => ({
            type: 'TRIP_CREATED',
            title: `Started trip to ${t.destination || 'a new destination'}`,
            points: 5,
            date: t.date
        }));

    const joinedTrips = db.get('trips')
        .filter(t => t.creatorId !== userId && t.members.some(m => (typeof m === 'string' ? m === userId : m.id === userId)) && (!t.deletedForUsers || !t.deletedForUsers.includes(userId)))
        .value()
        .map(t => ({
            type: 'TRIP_JOINED',
            title: `Joined trip to ${t.destination || 'a new destination'}`,
            points: 2,
            date: t.date // Ideally we'd have a join date, but trip date is a fallback
        }));

    const ecoExpenses = db.get('expenses')
        .filter(e => e.payerId === userId && e.isEcoFriendly)
        .value()
        .map(e => ({
            type: 'ECO_EXPENSE',
            title: `Eco-friendly: ${e.description}`,
            points: 50,
            date: e.date
        }));

    const userDonations = db.get('donations')
        .filter(d => d.userId === userId)
        .value()
        .map(d => ({
            type: 'DONATION',
            title: `Donated to ${d.cause}`,
            points: -d.amount,
            date: d.date
        }));

    // Combine and sort by date descending
    const allActivity = [...userTrips, ...joinedTrips, ...ecoExpenses, ...userDonations]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10); // Last 10 actions

    res.json(allActivity);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
