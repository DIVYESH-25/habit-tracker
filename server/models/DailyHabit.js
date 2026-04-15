const mongoose = require('mongoose');

const dailyHabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Storing as YYYY-MM-DD in UTC to avoid timezone drift
    required: true
  },
  habits: [
    {
      habitId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Habit' 
      },
      name: { 
        type: String, 
        required: true 
      },
      completed: { 
        type: Boolean, 
        default: false 
      }
    }
  ],
  completionPercentage: {
    type: Number,
    default: 0
  },
  isCompletedDay: {
    type: Boolean,
    default: false
  }
});

// Ensure only one record per user per date
dailyHabitSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyHabit', dailyHabitSchema);
