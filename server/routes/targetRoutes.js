const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const targetController = require('../controllers/targetController');

// All routes are protected by auth
router.get('/', auth, targetController.getTargets);
router.post('/', auth, targetController.createTarget);
router.put('/:id', auth, targetController.updateTarget);
router.delete('/:id', auth, targetController.deleteTarget);

module.exports = router;
