const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reportedId: { type: String, required: true },
  reason: { type: String, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
