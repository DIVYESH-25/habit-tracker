// DEV TOOL - NOT USED IN PRODUCTION
const loginAndFetch = async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pro_discipline@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    const token = loginData.token;
    console.log('✅ Pro User Login OK');

    const res = await fetch('http://localhost:5000/api/cycle/summary', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('✅ PRO USER ANALYTICS:');
    console.log(`  Completion Rate: ${data.monthlyCompletionRate}%`);
    console.log(`  Consistency Score: ${data.consistencyScore}%`);
    console.log(`  Successful Days: ${data.successfulDays} / ${data.currentDay}`);
    console.log(`  Current Streak: ${data.currentStreak}`);
    console.log(`  Weekly Breakdown: ${JSON.stringify(data.weeklyBreakdown)}`);
    console.log(`  Streak Timeline (first 12): ${JSON.stringify(data.streakTimeline?.slice(0,12))}`);
    console.log(`  Insight: ${data.insightMessage}`);
    console.log(`  Milestone: ${data.milestone}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};
loginAndFetch();
