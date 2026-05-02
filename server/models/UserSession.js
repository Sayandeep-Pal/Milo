const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  connectedAt: { type: Date, default: Date.now },
  totalChats: { type: Number, default: 0 },
  country: String,
  reportedCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
