const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    tripId: { type: String, required: true },
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true }
});

module.exports = mongoose.model('Settlement', settlementSchema);
