const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const auth = require('../middleware/auth');

router.post('/update', auth, habitController.updateHabits);
router.get('/today', auth, habitController.getHabits); // Uses ?date=YYYY-MM-DD
router.get('/heatmap', auth, habitController.getHeatmap);

module.exports = router;
