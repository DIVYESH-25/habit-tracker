// DEV TOOL - NOT USED IN PRODUCTION
const mongoose = require('mongoose');
const User = require('../models/User');
const Habit = require('../models/Habit');
const DailyHabit = require('../models/DailyHabit');
require('dotenv').config();

const DEFAULT_HABITS = [
  { key: 'water', name: 'Drink 3-4L Water' },
  { key: 'java', name: '1 Hour Java Study' },
  { key: 'project', name: '1 Hour Project Work' },
  { key: 'english', name: '30 min English Practice' },
  { key: 'dsa', name: '30 min DSA Practice' },
  { key: 'exercise', name: '10 min Exercise' }
];

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('Using local memory server? Skipping migration or connect manually.');
      // Since this env uses memory server in dev, we might need to handle it in server.js instead
      // but if the user has a real URI, we use it.
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to DB for migration...');

    const users = await User.find();
    console.log(`Migrating ${users.length} users...`);

    for (const user of users) {
      console.log(`Processing user: ${user.email}`);

      // 1. Create default habit definitions if they don't exist
      const habitMap = {}; // key -> habitId
      for (const def of DEFAULT_HABITS) {
        let habit = await Habit.findOne({ userId: user._id, name: def.name });
        if (!habit) {
          habit = new Habit({ userId: user._id, name: def.name });
          await habit.save();
        }
        habitMap[def.key] = habit;
      }

      // 2. Migrate DailyHabit records
      const records = await DailyHabit.find({ userId: user._id });
      for (const record of records) {
        // If habits is already an array, skip
        if (Array.isArray(record.habits)) continue;

        const oldHabits = record.habits; // This might be a Mongoose Document/Object
        const newHabitsArray = [];

        for (const def of DEFAULT_HABITS) {
          const isCompleted = oldHabits[def.key] || false;
          newHabitsArray.push({
            habitId: habitMap[def.key]._id,
            name: def.name,
            completed: isCompleted
          });
        }

        record.habits = newHabitsArray;
        // Mongoose might need to know the array changed if it's Mixed
        record.markModified('habits');
        await record.save();
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
