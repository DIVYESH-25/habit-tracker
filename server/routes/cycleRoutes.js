const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycleController');
const auth = require('../middleware/auth');

router.get('/summary', auth, cycleController.getSummary);
router.get('/yearly-summary', auth, cycleController.getYearlySummary);

module.exports = router;
