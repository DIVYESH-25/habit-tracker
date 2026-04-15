const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const auth = require('../middleware/auth');

router.get('/', auth, streakController.getStreak);

module.exports = router;
