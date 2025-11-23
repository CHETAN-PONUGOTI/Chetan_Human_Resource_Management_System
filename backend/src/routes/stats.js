// backend/src/routes/stats.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get controllers
const employeeController = require('../controllers/employeeController');
const teamController = require('../controllers/teamController');

router.use(authMiddleware);

// Employee Stats
router.get('/employees/count', employeeController.getEmployeeCount);

// Team Stats
router.get('/teams/count', teamController.getTeamCount);

module.exports = router;