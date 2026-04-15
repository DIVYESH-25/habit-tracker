const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: String, // YYYY-MM-DD
    default: null
  },
  startDate: {
    type: String, // Date when current 30-day cycle started
    default: null
  },
  lastAutomationMonth: {
    type: Number, // 0-11
    default: -1
  },
  lastAutomationYear: {
    type: Number,
    default: -1
  }
});

module.exports = mongoose.model('Streak', streakSchema);
