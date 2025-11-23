const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const logController = require('../controllers/logController');

router.use(authMiddleware);

router.get('/', logController.listLogs);

module.exports = router;