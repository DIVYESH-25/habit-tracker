exports.generateSmartInsights = (weeklyBreakdown, averageScore) => {
  const messages = [];

  // 1. Weekly Comparison Logic (Rule Engine)
  for (let i = 1; i < weeklyBreakdown.length; i++) {
    const prev = weeklyBreakdown[i - 1].score;
    const curr = weeklyBreakdown[i].score;

    if (curr > 0 && prev > 0) {
      if (curr > prev) {
        messages.push(`Week ${i + 1} improved by ${curr - prev}% from Week ${i}`);
      } else if (curr < prev) {
        messages.push(`Performance dropped in Week ${i + 1} by ${prev - curr}%`);
      }
    } else if (curr > 0 && prev === 0 && i === 1) {
       messages.push(`Week 2 momentum is building at ${curr}%!`);
    }
  }

  // Fallback if no comparisons possible
  const insight = messages.length > 0 ? messages[messages.length - 1] : "No activity trends detected yet — keep tracking.";

  // 2. Status Engine
  const getStatus = (avg) => {
    if (avg > 80) return "🔥 On Fire";
    if (avg >= 60) return "👍 Good";
    return "⚠️ Needs Work";
  };

  return {
    insight,
    consistencyMessage: `Consistency: ${averageScore}%`,
    status: getStatus(averageScore),
    allInsights: messages
  };
};
