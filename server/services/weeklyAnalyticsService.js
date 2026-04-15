const DailyHabit = require('../models/DailyHabit');

/**
 * 10/10 DETERMINISTIC WEEKLY ANALYTICS ENGINE
 * Strictly data-driven, duplicate-safe, and dynamically normalized.
 */
exports.calculateWeeklyStats = async (userId) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    // 1. Fetch Month Data
    const records = await DailyHabit.find({
      userId,
      date: { $gte: start.toLocaleDateString('en-CA'), $lte: end.toLocaleDateString('en-CA') }
    }).sort({ date: 1 });

    // 2. Hard De-duplication (Guarantee one record per day)
    const map = new Map();
    for (const r of records) {
      const key = r.date; // already YYYY-MM-DD
      if (!map.has(key) || map.get(key).updatedAt < r.updatedAt) {
        map.set(key, r);
      }
    }
    const cleanRecords = Array.from(map.values());

    // 3. Week Bucketing (Fixed & Safe)
    const weeks = { 1: [], 2: [], 3: [], 4: [] };
    cleanRecords.forEach(r => {
      const day = parseInt(r.date.split('-')[2]);
      if (day <= 7) weeks[1].push(r);
      else if (day <= 14) weeks[2].push(r);
      else if (day <= 21) weeks[3].push(r);
      else weeks[4].push(r);
    });

    // 4. Fixed Week Length (Encourages full 7-day consistency)
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const weekDaysMax = [
      7, // Week 1
      7, // Week 2
      7, // Week 3
      totalDaysInMonth - 21 // Week 4 (Final stretch)
    ];

    // 5. Calculate Scores
    const calcWeekScore = (weekData, totalDaysInWeek) => {
      const success = weekData.filter(d => d.completionPercentage >= 70).length;
      return {
        score: totalDaysInWeek <= 0 ? 0 : Math.round((success / totalDaysInWeek) * 100),
        successDays: success,
        totalDays: totalDaysInWeek
      };
    };

    const weeklyBreakdown = [
      { week: "Week 1", ...calcWeekScore(weeks[1], weekDaysMax[0]) },
      { week: "Week 2", ...calcWeekScore(weeks[2], weekDaysMax[1]) },
      { week: "Week 3", ...calcWeekScore(weeks[3], weekDaysMax[2]) },
      { week: "Week 4", ...calcWeekScore(weeks[4], weekDaysMax[3]) }
    ];

    const scores = weeklyBreakdown.map(w => w.score);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / 4) : 0;

    // 6. Streak Timeline (Boolean array for every day in the month)
    const streakTimeline = Array.from({ length: totalDaysInMonth }, (_, i) => {
      const dayNumeric = i + 1;
      if (dayNumeric > today) return null; // Future day
      const record = cleanRecords.find(r => parseInt(r.date.split('-')[2]) === dayNumeric);
      return record ? record.completionPercentage >= 70 : false;
    });

    return {
      weeklyBreakdown,
      averageScore,
      bestWeek: weeklyBreakdown.reduce((a, b) => a.score > b.score ? a : b).week,
      worstWeek: weeklyBreakdown.reduce((a, b) => a.score < b.score ? a : b).week,
      totalSuccessful: cleanRecords.filter(h => h.completionPercentage >= 70).length,
      currentDay: today,
      totalDays: totalDaysInMonth,
      streakTimeline
    };

  } catch (err) {
    console.error('Analytics Service Error:', err.message);
    throw err;
  }
};

/**
 * Calculates Month-over-Month comparison score.
 * RETURNS: "+X%", "-X%", or "Baseline"
 */
exports.calculateMonthComparison = async (userId, currentAvg) => {
  try {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = prevMonthDate.getFullYear();
    const month = prevMonthDate.getMonth();

    const start = new Date(year, month, 1).toLocaleDateString('en-CA');
    const end = new Date(year, month + 1, 0).toLocaleDateString('en-CA');

    const prevRecordsRaw = await DailyHabit.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const prevMap = new Map();
    for (const r of prevRecordsRaw) {
      if (!prevMap.has(r.date) || prevMap.get(r.date).updatedAt < r.updatedAt) {
        prevMap.set(r.date, r);
      }
    }
    const prevRecords = Array.from(prevMap.values());

    if (prevRecords.length === 0) return "Baseline";

    const totalDaysInPrevMonth = new Date(year, month + 1, 0).getDate();
    const successfulDays = prevRecords.filter(r => r.completionPercentage >= 70).length;
    const prevAvg = Math.round((successfulDays / totalDaysInPrevMonth) * 100);

    if (prevAvg === 0) return currentAvg > 0 ? `+${currentAvg}%` : "0%";
    
    const diff = currentAvg - prevAvg;
    return diff >= 0 ? `+${diff}%` : `${diff}%`;
  } catch (err) {
    return "Baseline";
  }
};
