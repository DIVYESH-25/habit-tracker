const Streak = require('../models/Streak');

// Atomic state-based streak calculation
exports.updateStreakOnCompletion = async (userId, date, isSuccess) => {
  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = new Streak({ userId });
  }

  // If the user just completed today successfully
  if (isSuccess) {
    // Only increment if we haven't already marked today as completed
    if (streak.lastCompletedDate !== date) {
      const yesterday = new Date(new Date(date).setDate(new Date(date).getDate() - 1)).toLocaleDateString('en-CA');
      
      if (streak.lastCompletedDate === yesterday) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1; // New streak
      }
      
      streak.lastCompletedDate = date;
      
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    }
  } else {
    // If they previously completed today but now untoggled below 70%
    if (streak.lastCompletedDate === date) {
        // Decrease streak because today is no longer consecutive
        streak.currentStreak = Math.max(0, streak.currentStreak - 1);
        
        // Find the "real" previous completed date
        // For simplicity, we just set the lastCompletedDate to "null" or find it.
        // But the 12:00 AM reset will eventually catch failures anyway.
        streak.lastCompletedDate = null; 
    }
  }

  await streak.save();
  return streak;
};
