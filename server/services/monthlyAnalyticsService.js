const DailyHabit = require('../models/DailyHabit');
const MonthlySummary = require('../models/MonthlySummary');

exports.getLiveAnalytics = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDaysInMonth = lastDay.getDate();

    const habits = await DailyHabit.find({
      userId,
      date: { 
        $gte: firstDay.toISOString().split('T')[0], 
        $lte: lastDay.toISOString().split('T')[0] 
      }
    }).sort({ date: 1 });

    const successfulDays = habits.filter(h => h.isCompletedDay).length;
    
    // 1. Consistency Score: (successfulDays / daysPassed) * 100
    const consistencyScore = Math.round((successfulDays / currentDay) * 100) || 0;

    // 2. Weekly Breakdown
    const weeklyBreakdown = [0, 0, 0, 0];
    const weekCounts = [0, 0, 0, 0];

    habits.forEach(h => {
      const day = new Date(h.date).getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      if (h.isCompletedDay) {
        weeklyBreakdown[weekIndex]++;
      }
      weekCounts[weekIndex]++;
    });

    const weeklyPercentages = weeklyBreakdown.map((count, i) => {
      // Each week has 7 days except maybe the last one
      const daysInWeek = (i === 3) ? (totalDaysInMonth - 21) : 7;
      // We only show percentage for days that have passed in that week
      const daysPassedInWeek = Math.min(daysInWeek, Math.max(0, currentDay - (i * 7)));
      if (daysPassedInWeek === 0) return null;
      return Math.round((count / daysPassedInWeek) * 100);
    });

    // 3. Comparison with previous month
    let comparison = "N/A";
    const prevMonth = currentMonth === 0 ? 12 : currentMonth;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const lastSummary = await MonthlySummary.findOne({ 
      userId, 
      month: prevMonth, // Wait, my MonthlySummary uses 1-12. prevMonth+1
      year: prevYear 
    });

    if (lastSummary) {
      const diff = consistencyScore - lastSummary.percentage;
      comparison = diff >= 0 ? `+${diff}%` : `${diff}%`;
    }

    // 4. Streak Timeline (Boolean array for every day in the month)
    const streakTimeline = Array.from({ length: totalDaysInMonth }, (_, i) => {
      const day = i + 1;
      if (day > currentDay) return null; // Future day
      const record = habits.find(h => new Date(h.date).getDate() === day);
      return record ? record.isCompletedDay : false;
    });

    return {
      monthlyCompletionRate: Math.round((successfulDays / totalDaysInMonth) * 100),
      successfulDays,
      totalDays: totalDaysInMonth,
      currentDay,
      consistencyScore,
      weeklyBreakdown: weeklyPercentages,
      comparison,
      streakTimeline
    };
  } catch (err) {
    console.error('Monthly Analytics Error:', err.message);
    return null;
  }
};
