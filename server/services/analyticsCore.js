const DailyHabit = require('../models/DailyHabit');
const Streak = require('../models/Streak');
const MonthlySummary = require('../models/MonthlySummary');

/**
 * 10/10 UNIFIED ANALYTICS CORE
 * Ensures absolute consistency between all dashboard, summary, and discipline score views.
 */

const getSafeDateStrings = (now = new Date()) => {
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  
  const firstDay = new Date(year, month, 1).toLocaleDateString('en-CA');
  const lastDay = new Date(year, month + 1, 0).toLocaleDateString('en-CA');
  const todayStr = now.toLocaleDateString('en-CA');
  
  return { year, month, today, firstDay, lastDay, todayStr };
};

exports.getCoreStats = async (userId) => {
  try {
    const { year, month, today, firstDay, lastDay, todayStr } = getSafeDateStrings();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // 1. Fetch Month Data with strict de-duplication
    const recordsRaw = await DailyHabit.find({
      userId,
      date: { $gte: firstDay, $lte: lastDay }
    }).sort({ date: 1 });

    const recordsMap = new Map();
    for (const r of recordsRaw) {
      if (!recordsMap.has(r.date) || recordsMap.get(r.date).updatedAt < r.updatedAt) {
        recordsMap.set(r.date, r);
      }
    }
    const cleanRecords = Array.from(recordsMap.values());

    // 2. Calculate Consistency (Strict: Successful / Days Elapsed)
    const successfulDays = cleanRecords.filter(r => r.completionPercentage >= 70).length;
    const consistencyScore = today > 0 ? Math.round((successfulDays / today) * 100) : 0;

    // 3. Weekly Breakdown (Unified logic)
    const weekDaysMax = [7, 7, 7, totalDaysInMonth - 21];
    const weeklyData = [0, 0, 0, 0];
    
    cleanRecords.forEach(r => {
      const day = parseInt(r.date.split('-')[2]);
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      if (r.completionPercentage >= 70) {
        weeklyData[weekIndex]++;
      }
    });

    const weeklyBreakdown = weeklyData.map((count, i) => {
      const daysPassedInWeek = Math.min(weekDaysMax[i], Math.max(0, today - (i * 7)));
      return {
        week: `Week ${i + 1}`,
        score: daysPassedInWeek > 0 ? Math.round((count / daysPassedInWeek) * 100) : 0,
        successDays: count,
        totalDays: daysPassedInWeek
      };
    });

    // 4. Streak & Comparison
    const streakData = await Streak.findOne({ userId });
    const currentStreak = streakData ? streakData.currentStreak : 0;
    
    let comparison = "Baseline";
    const prevMonthIdx = month === 0 ? 12 : month;
    const prevYearIdx = month === 0 ? year - 1 : year;
    const lastSummary = await MonthlySummary.findOne({ userId, month: prevMonthIdx, year: prevYearIdx });
    if (lastSummary) {
      const diff = consistencyScore - lastSummary.percentage;
      comparison = diff >= 0 ? `+${diff}%` : `${diff}%`;
    }

    // 5. Streak Timeline (Enhanced with percentages for heatmap styling)
    const streakTimeline = Array.from({ length: totalDaysInMonth }, (_, i) => {
      const dayNumeric = i + 1;
      if (dayNumeric > today) return null;
      const record = cleanRecords.find(r => parseInt(r.date.split('-')[2]) === dayNumeric);
      return record ? record.completionPercentage : 0;
    });

    return {
      userId,
      today,
      todayStr,
      totalDays: totalDaysInMonth,
      successfulDays,
      consistencyScore,
      weeklyBreakdown,
      currentStreak,
      comparison,
      streakTimeline,
      cleanRecords,
      hasAnyActivity: cleanRecords.some(r => r.completionPercentage > 0)
    };
  } catch (err) {
    console.error('[AnalyticsCore] Error:', err.message);
    throw err;
  }
};
