const MonthlySummary = require('../models/MonthlySummary');
const YearlySummary = require('../models/YearlySummary');

exports.checkAndGenerateYearlySummary = async (userId, year) => {
  try {
    // Check if we already have a summary for this year
    const existing = await YearlySummary.findOne({ userId, year });
    if (existing) return existing;

    // Fetch all monthly summaries for this year
    const monthlySummaries = await MonthlySummary.find({ userId, year });

    // We only generate if we have data for the full year (or if it's the end of the year)
    // The user requirement says "after 12 months"
    if (monthlySummaries.length < 12) {
      return null;
    }

    const totalSuccessfulDays = monthlySummaries.reduce((sum, s) => sum + s.totalCompletedDays, 0);
    const avgPercentage = monthlySummaries.reduce((sum, s) => sum + s.percentage, 0) / 12;
    const maxStreak = Math.max(...monthlySummaries.map(s => s.bestStreak));

    // Find best month
    const bestMonthRecord = monthlySummaries.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const bestMonthName = monthNames[bestMonthRecord.month - 1];

    const yearlySummary = new YearlySummary({
      userId,
      year,
      averageCompletionRate: Math.round(avgPercentage),
      totalSuccessfulDays,
      bestMonth: bestMonthName,
      bestStreak: maxStreak
    });

    await yearlySummary.save();
    return yearlySummary;
  } catch (err) {
    console.error('Yearly Summary Error:', err.message);
    return null;
  }
};
