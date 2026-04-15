const Streak = require('../models/Streak');
const monthlyAnalyticsService = require('../services/monthlyAnalyticsService');
const insightService = require('../services/insightService');
const MonthlySummary = require('../models/MonthlySummary');
const YearlySummary = require('../models/YearlySummary');

exports.getSummary = async (req, res) => {
  console.log('--- EXECUTING NEW getSummary CONTROLLER ---');
  // Default Safe Response as requested
  const defaultResponse = {
    completionRate: 0,
    successfulDays: 0,
    bestStreak: 0,
    consistencyScore: 0,
    weeklyBreakdown: [0, 0, 0, 0],
    comparison: null,
    insightMessage: "Start tracking your habits today!",
    milestone: null
  };

  try {
    const userId = req.user.id;
    
    // Get Live Stats for current month
    const liveStats = await monthlyAnalyticsService.getLiveAnalytics(userId);
    const streakData = await Streak.findOne({ userId });
    const currentStreak = streakData ? streakData.currentStreak : 0;
    
    if (!liveStats) {
      return res.json(defaultResponse);
    }

    const { insightMessage, milestone } = insightService.generateInsights(liveStats, currentStreak);
    
    res.json({
      ...liveStats,
      currentStreak,
      insightMessage,
      milestone
    });
  } catch (err) {
    console.error('Summary API Error:', err.message);
    res.status(500).json({ message: "Server error", ...defaultResponse });
  }
};

exports.getYearlySummary = async (req, res) => {
  try {
    const summaries = await YearlySummary.find({ userId: req.user.id }).sort({ year: -1 });

    if (!summaries || summaries.length === 0) {
      return res.json({
        averageCompletionRate: 0,
        totalSuccessfulDays: 0,
        bestMonth: "N/A",
        bestStreak: 0,
        message: "No yearly summary available yet"
      });
    }

    res.json(summaries[0]);
  } catch (err) {
    console.error('Yearly Summary API Error:', err.message);
    res.status(500).json({ message: "Server error" });
  }
};
