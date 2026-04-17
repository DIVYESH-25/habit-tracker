const analyticsCore = require('./analyticsCore');

/**
 * MULTI-LAYER BEHAVIORAL ANALYTICS ENGINE
 * Separates raw activity, completion success, and behavioral trends.
 */
exports.calculateDisciplineScore = async (userId) => {
  try {
    const stats = await analyticsCore.getCoreStats(userId);
    const { cleanRecords: rawRecords, currentStreak, todayStr, hasAnyActivity } = stats;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 1. Days Passed Calculation (Monthly)
    const daysPassedInMonth = Math.floor((today - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;

    // 2. Enforce Deduplication Safety
    const uniqueMap = new Map();
    rawRecords.forEach(r => {
      uniqueMap.set(r.date, r);
    });
    const cleanRecords = Array.from(uniqueMap.values());

    // 3. Current Day Activity Status
    const todayRecord = cleanRecords.find(r => r.date === todayStr);
    const todayCompletion = todayRecord ? todayRecord.completionPercentage : 0;
    const isSuccessToday = todayCompletion >= 70;

    let activityStatus = "no_activity";
    if (todayCompletion >= 70) activityStatus = "active";
    else if (todayCompletion > 0) activityStatus = "in_progress";

    // 4. Weekly Grouping & Averages
    const weekMap = new Map();
    cleanRecords.forEach(record => {
      const date = new Date(record.date);
      const weekIndex = Math.floor((date.getDate() - 1) / 7);
      if (!weekMap.has(weekIndex)) {
        weekMap.set(weekIndex, []);
      }
      weekMap.get(weekIndex).push(record);
    });

    const currentWeekIdx = Math.floor((today.getDate() - 1) / 7);
    const elapsedDaysInCurrentWeek = ((today.getDate() - 1) % 7) + 1;

    const getWeekAvg = (idx, elapsed) => {
      const records = weekMap.get(idx) || [];
      const successfulDays = records.filter(r => r.completionPercentage >= 70).length;
      return (successfulDays / elapsed) * 100;
    };

    const currentWeekAvg = getWeekAvg(currentWeekIdx, elapsedDaysInCurrentWeek);
    const previousWeekAvg = getWeekAvg(currentWeekIdx - 1, 7);

    // 5. Momentum Logic (Stability-First)
    const diff = currentWeekAvg - previousWeekAvg;
    const clampedDiff = Math.max(-10, Math.min(10, diff));
    const momentum = Math.max(0, Math.min(100, 50 + (clampedDiff / 10) * 25));

    // 6. Overall Stats
    const successfulDaysInMonth = cleanRecords.filter(r => r.completionPercentage >= 70).length;
    const monthConsistency = (successfulDaysInMonth / daysPassedInMonth) * 100;
    const streakScore = Math.min((currentStreak / daysPassedInMonth) * 100, 100);

    const disciplineScore = Math.round(
      (monthConsistency * 0.5) +
      (streakScore * 0.3) +
      (momentum * 0.2)
    );

    // 7. Status Logic (Jitter Protection)
    let status = "stable";
    if (Math.abs(momentum - 50) > 5) {
      status = momentum > 50 ? "improving" : "declining";
    }

    // EDGE CASE: No Records at all in month
    if (cleanRecords.length === 0) {
      return {
        activityStatus: "no_activity",
        completion: 0,
        success: false,
        weekScore: 0,
        projectedWeekScore: 50,
        momentum: 50,
        disciplineScore: 10,
        status: "stable",
        monthConsistency: 0,
        streak: 0,
        hasAnyActivity: false,
        insight: "Start tracking to activate the Discipline Matrix."
      };
    }

    // 📊 Projected Score (Blended)
    const weekScore = Math.round(currentWeekAvg);
    const projectedWeekScore = Math.round(weekScore * (elapsedDaysInCurrentWeek / 7) + 50 * ((7 - elapsedDaysInCurrentWeek) / 7));

    return {
      activityStatus,
      completion: Math.round(todayCompletion),
      success: isSuccessToday,
      weekScore,
      projectedWeekScore,
      momentum: Math.round(momentum),
      disciplineScore,
      status,
      monthConsistency: Math.round(monthConsistency),
      streak: Math.round(currentStreak), // normalized in calculation, but return raw count
      hasAnyActivity,
      insight: disciplineScore >= 85 ? "Elite rhythm maintained." : isSuccessToday ? "Successful day secured." : activityStatus === "in_progress" ? "Day in progress. Reach 70% to hit success." : "Steady baseline. Log your first habit today.",
      
      // Legacy compatibility
      score: disciplineScore,
      breakdown: {
        consistency: Math.round(monthConsistency),
        streak: Math.round(streakScore),
        momentum: Math.round(momentum)
      }
    };

  } catch (err) {
    console.error('Analytics Engine Error:', err.message);
    throw err;
  }
};
