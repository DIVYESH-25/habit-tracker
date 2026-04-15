// DEV TOOL - NOT USED IN PRODUCTION
const mongoose = require('mongoose');
const User = require('../models/User');
const DailyHabit = require('../models/DailyHabit');
const Streak = require('../models/Streak');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SEED_EMAIL = 'pro_discipline@example.com';
const SEED_PASSWORD = 'password123';

const seedData = async () => {
  try {
    // 1. Connect (Try to find the URI from the running server if possible, else default)
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/habit-tracker';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // 2. Create/Find User
    let user = await User.findOne({ email: SEED_EMAIL });
    if (!user) {
      console.log('Creating Pro User...');
      const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
      user = new User({ name: 'Pro Discipline', email: SEED_EMAIL, password: hashedPassword });
      await user.save();
    }
    const userId = user._id;

    // 3. Clear existing habits for this month to avoid duplicates
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
    
    await DailyHabit.deleteMany({ userId, date: { $gte: firstDay, $lte: lastDay } });
    console.log('Cleared existing habits for this month.');

    // 4. Populate 15 days of success (up to today)
    const currentDay = now.getDate();
    console.log(`Seeding habits up to Day ${currentDay}...`);

    for (let i = 1; i <= currentDay; i++) {
       const dateStr = new Date(currentYear, currentMonth, i).toISOString().split('T')[0];
       // Higher success rate (80-100%)
       const success = Math.random() > 0.1; 
       
       const habits = {
         water: success || Math.random() > 0.3,
         java: success || Math.random() > 0.3,
         project: success || Math.random() > 0.2,
         english: success || Math.random() > 0.1,
         dsa: success || Math.random() > 0.4,
         exercise: success || Math.random() > 0.3
       };

       const completedCount = Object.values(habits).filter(v => v === true).length;
       const percentage = Math.round((completedCount / 6) * 100);

       await DailyHabit.create({
         userId,
         date: dateStr,
         habits,
         completionPercentage: percentage,
         isCompletedDay: percentage >= 70
       });
    }

    // 5. Update Streak
    await Streak.deleteMany({ userId });
    await Streak.create({
      userId,
      currentStreak: 12,
      longestStreak: 25,
      lastCompletedDate: new Date(currentYear, currentMonth, currentDay - 1).toISOString().split('T')[0]
    });

    console.log('✅ Seeding Complete!');
    console.log(`Login: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
    process.exit(1);
  }
};

seedData();
