const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    cause: { type: String, required: true },
    date: { type: String, required: true }
});

module.exports = mongoose.model('Donation', donationSchema);
