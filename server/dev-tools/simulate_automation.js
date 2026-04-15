// DEV TOOL - NOT USED IN PRODUCTION
const mongoose = require('mongoose');
const User = require('../models/User');
const Streak = require('../models/Streak');
const DailyHabit = require('../models/DailyHabit');
const MonthlySummary = require('../models/MonthlySummary');
const automationService = require('../services/automationService');
require('dotenv').config();

const runSimulation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for simulation');

    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('User test@example.com not found. Create it first by registering on the app.');
      process.exit(1);
    }

    const userId = user._id;

    // 1. Create a dummy habit for March 31
    await DailyHabit.deleteMany({ userId }); // Clear first
    const marchHabit = new DailyHabit({
      userId,
      date: '2026-03-31',
      habits: { water: true, java: true, project: true, english: true, dsa: true, exercise: true },
      completionPercentage: 100,
      isCompletedDay: true
    });
    await marchHabit.save();
    console.log('Saved fake March habit');

    // 2. Set automation pointer to March
    await Streak.findOneAndUpdate(
      { userId },
      { lastAutomationMonth: 2, lastAutomationYear: 2026, longestStreak: 1 }
    );
    console.log('Set automation pointer to March (2)');

    // 3. Trigger Automation Service manually
    console.log('Triggering automation check (Today is April)...');
    await automationService.runCheck(userId);

    // 4. Verify results
    const summary = await MonthlySummary.findOne({ userId, month: 3, year: 2026 });
    if (summary) {
      console.log('SUCCESS: Monthly summary for March created!');
      console.log('Summary stats:', { percentage: summary.percentage, days: summary.totalCompletedDays });
    } else {
      console.log('FAILURE: Monthly summary not found');
    }

    const remainingHabits = await DailyHabit.find({ userId });
    console.log(`Daily habits remaining: ${remainingHabits.length} (Expected: 0)`);

    const streak = await Streak.findOne({ userId });
    console.log(`Automation Pointer updated to: ${streak.lastAutomationMonth}/${streak.lastAutomationYear}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runSimulation();
