const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const employeeController = require('../controllers/employeeController');

router.use(authMiddleware);

router.get('/', employeeController.listEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.get('/:id', employeeController.getEmployeeById);

module.exports = router;