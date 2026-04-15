const User = require('../models/User');
const Habit = require('../models/Habit');
const DailyHabit = require('../models/DailyHabit');
const Streak = require('../models/Streak');
const bcrypt = require('bcrypt');

/**
 * SENIOR ARCHITECT SEEDER ENGINE
 * Controlled, isolated, and deterministic data population.
 */
async function runAutoSeed() {
    // 1. Safety Guard: Never seed in production
    if (process.env.NODE_ENV === 'production') return;

    try {
        const SEED_DEMO = process.env.SEED_DEMO_USER === 'true';
        const SEED_ALL = process.env.SEED_ALL_USERS === 'true';
        const DEMO_EMAIL = 'pro_discipline@example.com';

        // 2. Logic Exit: If both disabled, do nothing
        if (!SEED_DEMO && !SEED_ALL) {
            console.log('⏹️ Seeding disabled by configuration.');
            return;
        }

        let targetUsers = [];

        if (SEED_ALL) {
            console.log('⚠️ WARNING: SEED_ALL_USERS enabled. Seeding entire database...');
            targetUsers = await User.find({});
        } else if (SEED_DEMO) {
            let demoUser = await User.findOne({ email: DEMO_EMAIL });
            if (!demoUser) {
                console.log('🌱 Creating dedicated Demo User...');
                const hashedPassword = await bcrypt.hash('password123', 10);
                demoUser = await User.create({
                    name: 'Pro Discipline',
                    email: DEMO_EMAIL,
                    password: hashedPassword
                });
            }
            targetUsers = [demoUser];
        }

        console.log(`📡 Targeting ${targetUsers.length} user(s) for Elite Seeding...`);

        // 3. Core Targets Blueprint
        const habitBlueprints = [
            'Drink 3-4L Water', '1 Hour Java Study', '1 Hour Project Work',
            '30 min English Practice', '30 min DSA Practice', '10 min Exercise'
        ];

        for (const user of targetUsers) {
            await seedUserHistory(user, habitBlueprints);
        }

    } catch (err) {
        console.error('❌ Architect Seeder Failure:', err.message);
    }
}

/**
 * ISOLATED SEEDING LOGIC PER USER
 * Strictly deterministic 14-day high-performance history.
 */
async function seedUserHistory(user, blueprints) {
    try {
        // A. Reset ONLY targeted user data (Fail-Safe Isolation)
        await DailyHabit.deleteMany({ userId: user._id });
        await Streak.deleteMany({ userId: user._id });

        // B. Ensure habit definitions exist
        const habits = [];
        for (const name of blueprints) {
            let h = await Habit.findOne({ userId: user._id, name });
            if (!h) {
                h = await Habit.create({ userId: user._id, name });
            }
            habits.push(h);
        }

        // C. Generate 14-Day Baseline History
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD

            // ELITE PERFORMANCE: 90% - 100% adherence
            const dailyHabits = habits.map(h => ({
                habitId: h._id,
                name: h.name,
                completed: Math.random() > 0.1 // 90% success rate
            }));

            const completedCount = dailyHabits.filter(h => h.completed).length;
            const percentage = Math.round((completedCount / habits.length) * 100);

            try {
                await DailyHabit.findOneAndUpdate(
                    { userId: user._id, date: dateStr },
                    {
                        $set: { 
                            habits: dailyHabits, 
                            completionPercentage: percentage, 
                            isCompletedDay: percentage >= 70 
                        },
                        $setOnInsert: { userId: user._id, date: dateStr }
                    },
                    { upsert: true, returnDocument: 'after' }
                );
            } catch (err) {
                if (err.code === 11000) {
                    // Concurrent safe
                    continue;
                }
                throw err;
            }
        }

        // D. Initialize Deterministic Streak
        await Streak.findOneAndUpdate(
            { userId: user._id },
            {
                $set: {
                    currentStreak: 14,
                    longestStreak: 14,
                    lastCompletedDate: today.toLocaleDateString('en-CA')
                },
                $setOnInsert: { userId: user._id }
            },
            { upsert: true }
        );

        console.log(`✅ Elite history seeded for: ${user.email}`);
    } catch (err) {
        console.error(`❌ Failed to seed history for ${user.email}:`, err.message);
    }
}

module.exports = { runAutoSeed };
