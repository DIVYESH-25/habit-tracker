const analyticsCore = require('../services/analyticsCore');
const insightService = require('../services/insightService');
const disciplineScoreService = require('../services/disciplineScoreService');
const DailyHabit = require('../models/DailyHabit');
const Streak = require('../models/Streak');
const MonthlySummary = require('../models/MonthlySummary');

exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get Core Stats (Unified)
    const stats = await analyticsCore.getCoreStats(userId);
    
    // 2. Generate Insights based on those stats
    const insights = insightService.generateSmartInsights(stats.weeklyBreakdown, stats.consistencyScore);
    
    // 3. Determine best/worst week
    const bestWeek = stats.weeklyBreakdown.reduce((a, b) => (a.score > b.score ? a : b)).week;
    const worstWeek = stats.weeklyBreakdown.reduce((a, b) => (a.score < b.score ? a : b)).week;

    // 4. Combine and return
    res.json({
      weeklyBreakdown: stats.weeklyBreakdown,
      insight: insights.insight,
      consistencyScore: stats.consistencyScore,
      status: insights.status,
      consistencyMessage: insights.consistencyMessage,
      totalSuccessful: stats.successfulDays,
      currentDay: stats.today,
      totalDays: stats.totalDays,
      bestWeek: bestWeek,
      worstWeek: worstWeek,
      streakTimeline: stats.streakTimeline,
      comparison: stats.comparison,
      hasAnyActivity: stats.hasAnyActivity,
      milestone: stats.consistencyScore >= 80 ? "Elite" : stats.consistencyScore >= 60 ? "Rising" : "Novice"
    });
  } catch (err) {
    console.error('Analytics Controller Error:', err.message);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
};

exports.getDisciplineScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const scoreData = await disciplineScoreService.calculateDisciplineScore(userId);
    res.json(scoreData);
  } catch (err) {
    console.error('Discipline Score Controller Error:', err.message);
    res.status(500).json({ message: "Server error calculating discipline score" });
  }
};

exports.hardReset = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[AUTH] hardReset triggered for user ${userId}`);

    // 1. Delete all habit records
    await DailyHabit.deleteMany({ userId });
    
    // 2. Delete all summaries
    await MonthlySummary.deleteMany({ userId });

    // 3. Reset streak
    await Streak.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          currentStreak: 0, 
          longestStreak: 0, 
          lastCompletedDate: null,
          startDate: new Date().toLocaleDateString('en-CA')
        } 
      },
      { upsert: true }
    );

    res.json({ message: "Discipline matrix reset successfully. You now have a clean slate." });
  } catch (err) {
    console.error('Hard Reset Error:', err.message);
    res.status(500).json({ error: "Failed to reset data." });
  }
};

exports.debugUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const Habit = require('../models/Habit');

    const habits = await DailyHabit.find({ userId }).sort({ date: -1 });
    const streak = await Streak.findOne({ userId });
    const targetDefs = await Habit.find({ userId });

    const dateMap = new Map();
    habits.forEach(h => {
      dateMap.set(h.date, (dateMap.get(h.date) || 0) + 1);
    });

    const duplicates = Array.from(dateMap.entries())
      .filter(([date, count]) => count > 1)
      .map(([date, count]) => ({ date, count }));

    res.json({
      sessionUserId: userId,
      totalRecords: habits.length,
      uniqueDates: dateMap.size,
      duplicatesCount: duplicates.length,
      duplicatesDetail: duplicates,
      streakRecord: streak,
      targetsCount: targetDefs.length,
      sampleHabits: habits.slice(0, 5),
      currentSystemDate: new Date().toLocaleDateString('en-CA')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

