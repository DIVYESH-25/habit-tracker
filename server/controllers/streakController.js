const Streak = require('../models/Streak');

exports.getStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.user.id });
    
    if (!streak) {
      // Default fallback
      streak = {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null
      };
    }

    res.json(streak);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
