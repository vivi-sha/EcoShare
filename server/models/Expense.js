const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    tripId: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    payerId: { type: String, required: true },
    splitWith: [{ type: String }], // Array of User IDs
    date: { type: String, required: true },
    isEcoFriendly: { type: Boolean, default: false },
    proofImageUrl: { type: String },
    verification: {
        timestamp: { type: String },
        location: {
            lat: { type: Number },
            lng: { type: Number }
        }
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
