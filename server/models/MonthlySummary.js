const mongoose = require('mongoose');

const monthlySummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number, // 1-12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  bestStreak: {
    type: Number,
    required: true
  },
  totalCompletedDays: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MonthlySummary', monthlySummarySchema);
