const Habit = require('../models/Habit');
const DailyHabit = require('../models/DailyHabit');

// 1. Get all active targets for the user
exports.getTargets = async (req, res) => {
  try {
    const targets = await Habit.find({ userId: req.user.id, isActive: true }).sort({ createdAt: 1 });
    res.json(targets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 2. Create a new target
exports.createTarget = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Validate limit (Max 10)
    const count = await Habit.countDocuments({ userId: req.user.id, isActive: true });
    if (count >= 10) {
      return res.status(400).json({ error: 'Max 10 active habits allowed. Remove one to add more.' });
    }

    // Check for duplicates
    const existing = await Habit.findOne({ userId: req.user.id, name: name.trim(), isActive: true });
    if (existing) {
      return res.status(400).json({ error: 'Habit with this name already exists' });
    }

    const newHabit = new Habit({
      userId: req.user.id,
      name: name.trim()
    });

    await newHabit.save();

    // MID-DAY SYNC: If today's record exists, add this new habit to it
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = await DailyHabit.findOne({ userId: req.user.id, date: todayStr });

    if (todayRecord) {
      todayRecord.habits.push({
        habitId: newHabit._id,
        name: newHabit.name,
        completed: false
      });
      
      // Recalculate percentage for today
      const total = todayRecord.habits.length;
      const completed = todayRecord.habits.filter(h => h.completed).length;
      todayRecord.completionPercentage = Math.round((completed / total) * 100);
      todayRecord.isCompletedDay = todayRecord.completionPercentage >= 70;
      
      await todayRecord.save();
    }

    res.json(newHabit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 3. Update target name
exports.updateTarget = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    let habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    habit.name = name.trim();
    await habit.save();

    // Update today's record snapshot name if it exists
    const todayStr = new Date().toISOString().split('T')[0];
    await DailyHabit.updateOne(
      { userId: req.user.id, date: todayStr, 'habits.habitId': habit._id },
      { $set: { 'habits.$.name': habit.name } }
    );

    res.json(habit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 4. Soft delete target
exports.deleteTarget = async (req, res) => {
  try {
    let habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    habit.isActive = false;
    await habit.save();

    // OPTIONAL: We keep today's record as is. The user can still check it off today 
    // but it won't appear starting tomorrow. This is safer for consistency.

    res.json({ message: 'Habit removed from future tracking' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
