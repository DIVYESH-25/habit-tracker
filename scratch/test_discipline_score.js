const disciplineScoreService = require('../server/services/disciplineScoreService');

// Current Date: 2026-04-17
// Week 3 started on April 15.
// Elapsed in week 3 = 3 days (15, 16, 17)
const mockStats = {
  cleanRecords: [
    { date: '2026-04-15', completionPercentage: 80 }, // Success 1
    { date: '2026-04-16', completionPercentage: 40 }, // Fail
    { date: '2026-04-17', completionPercentage: 90 }, // Success 2
  ],
  currentStreak: 1
};

// Mock analyticsCore.getCoreStats
const analyticsCore = require('../server/services/analyticsCore');
analyticsCore.getCoreStats = async () => mockStats;

async function runTest() {
  try {
    const result = await disciplineScoreService.calculateDisciplineScore('test-user');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Manual check:
    // weekScore = (2 success / 3 elapsed) * 100 = 66.6... -> 67
    // projectedWeekScore = Math.round(67 * (3 / 7) + 50 * (4 / 7))
    //                   = Math.round(28.71 + 28.57) = 57
    // monthConsistency = (2 success / 17 elapsed) * 100 = 11.76... -> 12
    // streakScore = (1 streak / 17 elapsed) * 100 = 5.8... -> 6
    // momentum = 50 (no previous weeks)
    // disciplineScore = (11.76 * 0.5) + (5.8 * 0.3) + (50 * 0.2)
    //                  = 5.88 + 1.74 + 10 = 17.62 -> 18
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

runTest();
