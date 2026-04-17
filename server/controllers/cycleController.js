const analyticsCore = require('../services/analyticsCore');
const insightService = require('../services/insightService');
const YearlySummary = require('../models/YearlySummary');

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get Core Stats (Unified)
    const stats = await analyticsCore.getCoreStats(userId);
    
    // 2. Generate Insights (using common logic)
    const insights = insightService.generateSmartInsights(stats.weeklyBreakdown, stats.consistencyScore);
    
    // 3. Construct unified response
    // Ensuring field names match what Summary.jsx expects
    res.json({
      consistencyScore: stats.consistencyScore,
      totalSuccessful: stats.successfulDays,
      currentDay: stats.today,
      totalDays: stats.totalDays,
      weeklyBreakdown: stats.weeklyBreakdown,
      comparison: stats.comparison,
      currentStreak: stats.currentStreak,
      insight: insights.insight,
      milestone: stats.consistencyScore >= 80 ? "Elite" : stats.consistencyScore >= 60 ? "Rising" : "Novice",
      streakTimeline: stats.streakTimeline
    });
  } catch (err) {
    console.error('Summary API Error:', err.message);
    res.status(500).json({ message: "Server error" });
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

