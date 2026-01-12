const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');
const Settlement = require('./models/Settlement');
const Donation = require('./models/Donation');

const migrateData = async () => {
    try {
        if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>')) {
            console.error('ERROR: MONGO_URI is not set or contains placeholders in .env file.');
            process.exit(1);
        }

        const uri = process.env.MONGO_URI || '';
        console.log(`Connecting to MongoDB: ${uri.substring(0, 20)}...`);

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Migration');

        const dbPath = path.join(__dirname, 'db.json');
        if (!fs.existsSync(dbPath)) {
            console.error('db.json not found!');
            process.exit(1);
        }

        const rawData = fs.readFileSync(dbPath);
        const jsonData = JSON.parse(rawData);

        console.log(`Migrating ${jsonData.users.length} Users...`);
        if (jsonData.users.length > 0) {
            await User.deleteMany({}); // Clear existing
            await User.insertMany(jsonData.users);
        }

        console.log(`Migrating ${jsonData.trips.length} Trips...`);
        if (jsonData.trips.length > 0) {
            await Trip.deleteMany({});
            await Trip.insertMany(jsonData.trips);
        }

        console.log(`Migrating ${jsonData.expenses.length} Expenses...`);
        if (jsonData.expenses.length > 0) {
            await Expense.deleteMany({});
            await Expense.insertMany(jsonData.expenses);
        }

        console.log(`Migrating ${jsonData.settlements.length} Settlements...`);
        if (jsonData.settlements.length > 0) {
            await Settlement.deleteMany({});
            await Settlement.insertMany(jsonData.settlements);
        }

        console.log(`Migrating ${jsonData.donations.length} Donations...`);
        if (jsonData.donations.length > 0) {
            await Donation.deleteMany({});
            await Donation.insertMany(jsonData.donations);
        }

        console.log('Migration Completed Successfully!');
        process.exit();
    } catch (err) {
        console.error('Migration Error Name:', err.name);
        console.error('Migration Error Message:', err.message);
        console.error('Full Error:', JSON.stringify(err, null, 2));
        process.exit(1);
    }
};

migrateData();
