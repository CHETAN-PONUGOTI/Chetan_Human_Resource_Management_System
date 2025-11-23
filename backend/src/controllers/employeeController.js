const db = require('../db');
const { Employee, Team } = db;
const { createLog } = require('./utils/logUtil');

exports.listEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({ 
            where: { organisation_id: req.user.orgId },
            include: [{ model: Team, as: 'Teams', attributes: ['id', 'name'] }]
        });
        return res.status(200).json(employees);
    } catch (error) {
        console.error('Error listing employees:', error);
        return res.status(500).json({ message: 'Server error listing employees.' });
    }
};

exports.createEmployee = async (req, res) => {
    const { first_name, last_name, email, phone } = req.body;
    const orgId = req.user.orgId;

    if (!first_name || !last_name) {
        return res.status(400).json({ message: 'First and last name are required.' });
    }

    try {
        const employee = await Employee.create({ 
            first_name, last_name, email, phone, organisation_id: orgId 
        });

        await createLog(orgId, req.user.userId, 'employee_created', { 
            employeeId: employee.id, 
            name: `${first_name} ${last_name}` 
        });

        return res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).json({ message: 'Server error creating employee.' });
    }
};

exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId; // The ID of the logged-in user's organization

    try {
        // 1. Ownership Check: Find the employee to ensure they belong to this organization.
        const employeeRecord = await db.Employee.findOne({ 
            where: { id, organisation_id: orgId } 
        });

        if (!employeeRecord) {
            // If the record doesn't exist under this organization's ID, it's unauthorized.
            return res.status(404).json({ message: 'Employee not found or unauthorized.' });
        }
        
        // 2. Perform the Update (now we are sure the employee belongs to this org)
        // Note: The ID and OrgId are implicitly checked via the initial findOne check.
        await employeeRecord.update(req.body); 

        // 3. Fetch the updated record with associations for the response.
        const updatedEmployee = await db.Employee.findOne({ 
            where: { id },
            include: [{ model: db.Team, as: 'Teams', attributes: ['id', 'name'] }]
        });
        
        // 4. Log the action.
        await createLog(orgId, req.user.userId, 'employee_updated', { 
            employeeId: id, 
            name: `${updatedEmployee.first_name} ${updatedEmployee.last_name}`, 
            changes: req.body 
        });

        // 5. Return the record.
        return res.status(200).json(updatedEmployee);

    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ message: 'Server error updating employee.' });
    }
};

exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId;

    try {
        const employee = await Employee.findOne({ where: { id, organisation_id: orgId } });
        if (!employee) {
             return res.status(404).json({ message: 'Employee not found or unauthorized.' });
        }
        
        const deleted = await Employee.destroy({ where: { id, organisation_id: orgId } });

        if (deleted) {
             await createLog(orgId, req.user.userId, 'employee_deleted', { 
                employeeId: id, 
                name: `${employee.first_name} ${employee.last_name}`
            });
            return res.status(204).send();
        }

        return res.status(404).json({ message: 'Employee not found or unauthorized.' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ message: 'Server error deleting employee.' });
    }
};


exports.getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await Employee.findOne({ 
            where: { id, organisation_id: req.user.orgId },
            include: [{ model: db.Team, as: 'Teams', attributes: ['id', 'name'] }] 
        });

        if (!employee) {
            console.error(`Employee ID ${id} not found for Org ${req.user.orgId}`); 
            return res.status(404).json({ message: 'Employee not found or unauthorized.' });
        }
        return res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee details:', error);
        return res.status(500).json({ message: 'Server error fetching employee details.' });
    }
};

exports.getEmployeeCount = async (req, res) => {
    try {
        const count = await db.Employee.count({ 
            where: { organisation_id: req.user.orgId }
        });
        return res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching employee count:', error);
        return res.status(500).json({ message: 'Server error fetching employee count.' });
    }
};