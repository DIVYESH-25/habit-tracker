const DailyHabit = require('../models/DailyHabit');
const Streak = require('../models/Streak');

/**
 * 10/10 DISCIPLINE SCORE ENGINE
 * Calculates a single score (0-100) based on weighted factors.
 */
exports.calculateDisciplineScore = async (userId) => {
  try {
    const now = new Date();
    // Use Local Date string (YYYY-MM-DD) to align with seeder and ensure no UTC drift
    const todayStr = now.toLocaleDateString('en-CA'); 
    
    const mongoose = require('mongoose');
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1).toLocaleDateString('en-CA');
    const end = new Date(year, month + 1, 0).toLocaleDateString('en-CA');

    const recordsRaw = await DailyHabit.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const recordsMap = new Map();
    for (const r of recordsRaw) {
      if (!recordsMap.has(r.date) || recordsMap.get(r.date).updatedAt < r.updatedAt) {
        recordsMap.set(r.date, r);
      }
    }
    const cleanRecords = Array.from(recordsMap.values());
    const totalTrackedDays = cleanRecords.length;
    console.log(`[DEBUG] Found ${totalTrackedDays} records for user ${userId}`);

    // --- Factor 1: CONSISTENCY (50%) ---
    // successfulDays = completionPercentage >= 70
    const successfulDays = cleanRecords.filter(r => r.completionPercentage >= 70).length;
    const consistency = totalTrackedDays > 0 ? (successfulDays / totalTrackedDays) * 100 : 0;

    // --- Factor 2: STREAK (30%) ---
    const streakData = await Streak.findOne({ userId });
    const currentStreak = streakData ? streakData.currentStreak : 0;
    const maxPossibleStreak = Math.min(totalTrackedDays, 30);
    const streakScore = maxPossibleStreak > 0 ? Math.min((currentStreak / maxPossibleStreak) * 100, 100) : 0;

    // --- Factor 3: MOMENTUM (20%) ---
    // Measure improvement trend across weeks
    const weeks = { 1: [], 2: [], 3: [], 4: [] };
    cleanRecords.forEach(r => {
      const day = parseInt(r.date.split('-')[2]);
      if (day <= 7) weeks[1].push(r);
      else if (day <= 14) weeks[2].push(r);
      else if (day <= 21) weeks[3].push(r);
      else weeks[4].push(r);
    });

    const getWeekAvg = (weekData) => {
      if (weekData.length === 0) return 0;
      const successCount = weekData.filter(d => d.completionPercentage >= 70).length;
      return (successCount / weekData.length) * 100;
    };

    const w1 = getWeekAvg(weeks[1]);
    const w2 = getWeekAvg(weeks[2]);
    const w3 = getWeekAvg(weeks[3]);
    const w4 = getWeekAvg(weeks[4]);

    const diffs = [];
    if (weeks[2].length > 0) diffs.push(w2 - w1);
    if (weeks[3].length > 0) diffs.push(w3 - w2);
    if (weeks[4].length > 0) diffs.push(w4 - w3);

    const avgDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
    // Normalize Momentum: baseline 50, +diff increases, -diff decreases (capped 0-100)
    const momentum = Math.min(Math.max(50 + (avgDiff * 2), 0), 100);

    // --- FINAL CALCULATION ---
    const disciplineScore = Math.round(
      (consistency * 0.5) +
      (streakScore * 0.3) +
      (momentum * 0.2)
    );

    // Get Status
    let status = "Critical";
    if (disciplineScore >= 85) status = "Elite";
    else if (disciplineScore >= 70) status = "Strong";
    else if (disciplineScore >= 50) status = "Growing";
    else if (disciplineScore >= 30) status = "Needs Work";

    return {
      disciplineScore,
      status,
      breakdown: {
        consistency: Math.round(consistency),
        streak: Math.round(streakScore),
        momentum: Math.round(momentum)
      },
      insight: disciplineScore > 70 ? "Strong discipline forming. Maintain your streak." : "Your discipline system is unstable. Focus on daily consistency."
    };

  } catch (err) {
    console.error('Discipline Score Service Error:', err.message);
    throw err;
  }
};
