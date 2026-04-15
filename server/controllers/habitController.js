const Habit = require('../models/Habit');
const DailyHabit = require('../models/DailyHabit');
const streakService = require('../services/streakService');
const automationService = require('../services/automationService');
const dailyResetService = require('../services/dailyResetService');

exports.updateHabits = async (req, res) => {
  try {
    await automationService.runCheck(req.user.id);
    await dailyResetService.runCheck(req.user.id);
    const { date, habits } = req.body; // habits: [{ habitId, name, completed }]
    
    // Calculate percentage
    const totalHabits = habits.length;
    const completedHabits = habits.filter(h => h.completed === true).length;
    const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const isCompletedDay = completionPercentage >= 70;

    // 1. Service Layer Pre-Check (Fail-Safe)
    let dailyHabit = await DailyHabit.findOne({ userId: req.user.id, date });

    try {
      if (dailyHabit) {
        // Atomic update if exists
        dailyHabit = await DailyHabit.findOneAndUpdate(
          { userId: req.user.id, date },
          { $set: { habits, completionPercentage, isCompletedDay } },
          { returnDocument: 'after' }
        );
      } else {
        // Atomic upsert with $setOnInsert for initialization
        dailyHabit = await DailyHabit.findOneAndUpdate(
          { userId: req.user.id, date },
          {
            $setOnInsert: {
              userId: req.user.id,
              date,
              habits,
              completionPercentage,
              isCompletedDay
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (err) {
      if (err.code === 11000) {
        console.log(`[habitController] Concurrent collision recovery for ${req.user.id} on ${date}`);
        dailyHabit = await DailyHabit.findOne({ userId: req.user.id, date });
      } else {
        throw err;
      }
    }

    // Recalculate streak atomically
    const newStreak = await streakService.updateStreakOnCompletion(req.user.id, date, isCompletedDay);

    res.json({ dailyHabit, streak: newStreak });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getHabits = async (req, res) => {
  try {
    await automationService.runCheck(req.user.id);
    await dailyResetService.runCheck(req.user.id);
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }
    let dailyHabit = await DailyHabit.findOne({ userId: req.user.id, date });
    
    // Return empty defaults based on ACTIVE habits if no record exists
    if (!dailyHabit) {
      const activeTargets = await Habit.find({ userId: req.user.id, isActive: true }).sort({ createdAt: 1 });
      
      const defaultHabits = activeTargets.map(t => ({
        habitId: t._id,
        name: t.name,
        completed: false
      }));

      return res.json({
        userId: req.user.id,
        date,
        habits: defaultHabits,
        completionPercentage: 0,
        isCompletedDay: false
      });
    }

    res.json(dailyHabit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getHeatmap = async (req, res) => {
  try {
    await automationService.runCheck(req.user.id);
    await dailyResetService.runCheck(req.user.id);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const monthName = firstDay.toLocaleString('default', { month: 'long' });

    const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

    const habitRecords = await DailyHabit.find({
      userId: req.user.id,
      date: { $gte: startDateStr, $lte: endDateStr }
    }).sort({ date: 1 });

    const data = [];
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = habitRecords.find(r => r.date === dateStr);
      
      if (record) {
        const totalCount = record.habits.length;
        const completedCount = record.habits.filter(h => h.completed === true).length;
        data.push({
          date: dateStr,
          completionPercentage: record.completionPercentage,
          completedHabitsCount: completedCount,
          totalHabitsCount: totalCount
        });
      } else {
        data.push({
          date: dateStr,
          completionPercentage: 0,
          completedHabitsCount: 0,
          totalHabitsCount: 0
        });
      }
    }

    res.json({
      month: monthName,
      year: year,
      totalDays: totalDays,
      data: data
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
