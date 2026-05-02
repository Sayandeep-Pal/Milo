const Report = require('../models/Report');
const UserSession = require('../models/UserSession');

const reportedInSession = new Set();

exports.submitReport = async (req, res) => {
  const { reporterId, reportedId, reason, description } = req.body;

  if (!reporterId || !reportedId || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (reportedInSession.has(reporterId)) {
    return res.status(429).json({ error: 'You can only report once per session' });
  }

  try {
    const report = new Report({
      reporterId,
      reportedId,
      reason,
      description
    });

    await report.save();

    reportedInSession.add(reporterId);

    // Update reported user's report count
    await UserSession.findOneAndUpdate(
      { sessionId: reportedId },
      { $inc: { reportedCount: 1 } },
      { upsert: true }
    );

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};
