const Habit = require('../models/Habit');
const DailyHabit = require('../models/DailyHabit');
const Streak = require('../models/Streak');

exports.runCheck = async (userId) => {
  try {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA'); 
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    let streak = await Streak.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, lastAutomationMonth: now.getMonth(), lastAutomationYear: now.getFullYear() } },
      { upsert: true, returnDocument: 'after' }
    );

    // 1. HARD BLOCK: Check if today's record already exists (Fail-Safe)
    const existingToday = await DailyHabit.findOne({ userId, date: todayStr });
    if (existingToday) {
      return existingToday; 
    }

    // Get the latest habit record overall
    const latestHabit = await DailyHabit.findOne({ userId }).sort({ date: -1 });

    const getActiveHabitSnapshots = async () => {
      const activeTargets = await Habit.find({ userId, isActive: true }).sort({ createdAt: 1 });
      return activeTargets.map(t => ({
        habitId: t._id,
        name: t.name,
        completed: false
      }));
    };

    // 2. DAY CHANGE DETECTED
    if (latestHabit) {
        if (latestHabit.date !== yesterdayStr || !latestHabit.isCompletedDay) {
            streak.currentStreak = 0;
        }
        
        if (latestHabit.date === yesterdayStr && latestHabit.isCompletedDay) {
            streak.lastCompletedDate = yesterdayStr;
        }
    }

    // 3. CREATE TODAY (Strict Upsert & Concurrent-Safe Fallback)
    const habits = await getActiveHabitSnapshots();
    let dailyHabit;
    try {
        dailyHabit = await DailyHabit.findOneAndUpdate(
          { userId, date: todayStr },
          {
            $setOnInsert: {
              userId,
              date: todayStr,
              habits,
              completionPercentage: 0,
              isCompletedDay: false
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
    } catch (err) {
        if (err.code === 11000) {
            console.log(`[dailyReset] Concurrent collision recovery for ${userId} on ${todayStr}`);
            dailyHabit = await DailyHabit.findOne({ userId, date: todayStr });
        } else {
            throw err;
        }
    }

    await streak.save();

    console.log(`Daily reset executed for user ${userId}. New day: ${todayStr}`);
  } catch (err) {
    console.error('Daily Reset Service Error:', err.message);
  }
};
