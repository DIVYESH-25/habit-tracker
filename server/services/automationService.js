const DailyHabit = require('../models/DailyHabit');
const MonthlySummary = require('../models/MonthlySummary');
const Streak = require('../models/Streak');
const yearlySummaryService = require('./yearlySummaryService');

exports.runCheck = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    let streak = await Streak.findOne({ userId });
    if (!streak) return;

    // Detect if month changed (or first time running automation)
    if (streak.lastAutomationMonth === -1) {
      // Initialize if new
      streak.lastAutomationMonth = currentMonth;
      streak.lastAutomationYear = currentYear;
      await streak.save();
      return;
    }

    if (streak.lastAutomationMonth === currentMonth && streak.lastAutomationYear === currentYear) {
      // Month hasn't changed
      return;
    }

    // --- MONTH CHANGED ---
    console.log(`Month change detected for user ${userId}. Triggering automated reset.`);

    // 1. Determine the previous month and year to summarize
    const lastMonth = streak.lastAutomationMonth;
    const lastYear = streak.lastAutomationYear;

    // First and last day of the PREVIOUSLY TRACKED month
    const firstDay = new Date(lastYear, lastMonth, 1);
    const lastDay = new Date(lastYear, lastMonth + 1, 0);
    const totalDaysInMonth = lastDay.getDate();

    const startDateStr = firstDay.toLocaleDateString('en-CA');
    const endDateStr = lastDay.toLocaleDateString('en-CA');

    // 2. Aggregate previous month data
    const recordsRaw = await DailyHabit.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr }
    }).sort({ date: 1 });

    const recordsMap = new Map();
    for (const r of recordsRaw) {
      if (!recordsMap.has(r.date) || recordsMap.get(r.date).updatedAt < r.updatedAt) {
        recordsMap.set(r.date, r);
      }
    }
    const cleanRecords = Array.from(recordsMap.values());
    const totalTrackedDays = cleanRecords.length;

    const successfulDays = cleanRecords.filter(h => h.isCompletedDay).length;
    const completionRate = totalDaysInMonth > 0 ? Math.round((successfulDays / totalDaysInMonth) * 100) : 0;
    
    // For bestStreak, we currently track longestStreak globally in the Streak model.
    // In an automated system, we'll take the longestStreak accrued up to this point as the cycle's best.
    const bestStreak = streak.longestStreak;

    // 3. Save Monthly Summary
    const summary = new MonthlySummary({
      userId,
      month: lastMonth + 1,
      year: lastYear,
      totalDays: totalDaysInMonth,
      percentage: completionRate,
      bestStreak,
      totalCompletedDays: successfulDays
    });
    await summary.save();

    // 4. Check for Yearly Summary (if 12 summaries exist for that year)
    await yearlySummaryService.checkAndGenerateYearlySummary(userId, lastYear);

    // 5. Reset System
    // Delete ONLY records for the month just completed (or all previous records as per user strict "reset daily data" request)
    // User requested: "Delete all dailyHabits for that user"
    await DailyHabit.deleteMany({ userId });

    // Reset streak fields for a fresh start
    streak.currentStreak = 0;
    streak.longestStreak = 0;
    streak.lastCompletedDate = null;
    streak.lastAutomationMonth = currentMonth;
    streak.lastAutomationYear = currentYear;
    streak.startDate = now.toLocaleDateString('en-CA');

    await streak.save();
    console.log(`Automated reset complete for user ${userId}`);
  } catch (err) {
    console.error('Automation Service Error:', err.message);
  }
};
