const mongoose = require('mongoose');

const yearlySummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  averageCompletionRate: {
    type: Number,
    required: true
  },
  totalSuccessfulDays: {
    type: Number,
    required: true
  },
  bestMonth: {
    type: String, // "January", etc.
    required: true
  },
  bestStreak: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Unique index for userId and year
yearlySummarySchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('YearlySummary', yearlySummarySchema);
