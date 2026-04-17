const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/monthly', auth, analyticsController.getMonthlyAnalytics);
router.get('/discipline-score', auth, analyticsController.getDisciplineScore);
router.post('/hard-reset', auth, analyticsController.hardReset);

if (process.env.NODE_ENV !== 'production') {
    router.get('/debug', auth, analyticsController.debugUserData);
}


module.exports = router;
