const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const teamController = require('../controllers/teamController');

router.use(authMiddleware);

router.get('/', teamController.listTeams);
router.post('/', teamController.createTeam);
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);
router.get('/:id', teamController.getTeamById);

router.post('/:teamId/assign', teamController.assignEmployee);
router.delete('/:teamId/unassign', teamController.unassignEmployee);

module.exports = router;