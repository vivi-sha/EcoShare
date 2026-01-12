const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String },
    destination: { type: String },
    creatorId: { type: String, required: true },
    members: [{ type: String }], // Array of User IDs (UUIDs)
    shareCode: { type: String, required: true },
    expenses: [{ type: String }], // Array of Expense IDs (optional, can just query expenses by tripId)
    date: { type: String, required: true }, // ISO Date string
    deletedForUsers: [{ type: String }]
});

module.exports = mongoose.model('Trip', tripSchema);
