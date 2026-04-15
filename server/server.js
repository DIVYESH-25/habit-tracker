require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB().then(async () => {
    // ONE-TIME MIGRATION: Delete legacy ISO date records (Prevent dupe-key collisions)
    const DailyHabit = require('./models/DailyHabit');
    await DailyHabit.deleteMany({ date: { $regex: /T/ } });
    console.log('🧹 Legacy ISO records cleaned successfully.');

    // Run idempotent seeder in the background
    const { runAutoSeed } = require('./utils/seeder');
    runAutoSeed().catch(err => console.error('Seeder background error:', err));
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/streak', require('./routes/streakRoutes'));
app.use('/api/cycle', require('./routes/cycleRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/targets', require('./routes/targetRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
