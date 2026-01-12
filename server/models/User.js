const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // UUID from frontend
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Nullable for Google Auth
    photoUrl: { type: String },
    ecoPoints: { type: Number, default: 10 },
    donatedPoints: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
