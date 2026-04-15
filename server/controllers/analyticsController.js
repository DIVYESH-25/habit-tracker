const weeklyAnalyticsService = require('../services/weeklyAnalyticsService');
const insightService = require('../services/insightService');
const disciplineScoreService = require('../services/disciplineScoreService');

exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get Weekly Stats
    const stats = await weeklyAnalyticsService.calculateWeeklyStats(userId);
    
    // 2. Generate Insights based on those stats
    const insights = insightService.generateSmartInsights(stats.weeklyBreakdown, stats.averageScore);
    
    // 3. Calculate Real Comparison (Month over Month)
    const comparison = await weeklyAnalyticsService.calculateMonthComparison(userId, stats.averageScore);
    
    // 4. Combine and return
    res.json({
      weeklyBreakdown: stats.weeklyBreakdown,
      insight: insights.insight,
      consistencyScore: stats.averageScore,
      status: insights.status,
      consistencyMessage: insights.consistencyMessage,
      totalSuccessful: stats.totalSuccessful,
      currentDay: stats.currentDay,
      totalDays: stats.totalDays,
      bestWeek: stats.bestWeek,
      worstWeek: stats.worstWeek,
      streakTimeline: stats.streakTimeline,
      comparison: comparison,
      milestone: stats.averageScore >= 80 ? "Elite" : stats.averageScore >= 60 ? "Rising" : "Novice"
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

exports.debugUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const DailyHabit = require('../models/DailyHabit');
    const Streak = require('../models/Streak');
    const Habit = require('../models/Habit');

    const habits = await DailyHabit.find({ userId }).sort({ date: -1 });
    const streak = await Streak.findOne({ userId });
    const targetDefs = await Habit.find({ userId });

    // Calculate duplicates for debug
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
      currentSystemDate: new Date().toLocaleDateString('en-CA'),
      currentLocalDate: new Date().toLocaleDateString('en-CA')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
