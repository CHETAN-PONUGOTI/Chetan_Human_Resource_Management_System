// backend/src/controllers/teamController.js
const db = require('../db');
const { Team, Employee, EmployeeTeam } = db;
const { createLog } = require('./utils/logUtil');

// GET /api/teams
exports.listTeams = async (req, res) => {
    try {
        const teams = await Team.findAll({ 
            where: { organisation_id: req.user.orgId },
            // Include employees to display the count on the list view
            include: [{ model: Employee, as: 'Employees', attributes: ['id', 'first_name', 'last_name'], through: { attributes: [] } }]
        });
        return res.status(200).json(teams);
    } catch (error) {
        console.error('Error listing teams:', error);
        return res.status(500).json({ message: 'Server error listing teams.' });
    }
};

// --- NEW FUNCTION: GET /api/teams/:id (Needed for Edit Form) ---
exports.getTeamById = async (req, res) => {
    const { id } = req.params;
    try {
        const team = await Team.findOne({ 
            where: { id, organisation_id: req.user.orgId },
            include: [{ model: Employee, as: 'Employees', attributes: ['id', 'first_name', 'last_name'] }]
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or unauthorized.' });
        }
        return res.status(200).json(team);
    } catch (error) {
        console.error('Error fetching single team:', error);
        return res.status(500).json({ message: 'Server error fetching team.' });
    }
};
// -----------------------------------------------------------------

// POST /api/teams
exports.createTeam = async (req, res) => {
    const { name, description } = req.body;
    const orgId = req.user.orgId;

    if (!name) {
        return res.status(400).json({ message: 'Team name is required.' });
    }

    try {
        const team = await Team.create({ name, description, organisation_id: orgId });

        await createLog(orgId, req.user.userId, 'team_created', { 
            teamId: team.id, 
            name: team.name 
        });

        return res.status(201).json(team);
    } catch (error) {
        console.error('Error creating team:', error);
        return res.status(500).json({ message: 'Server error creating team.' });
    }
};

// PUT /api/teams/:id
exports.updateTeam = async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId;

    try {
        const [updated] = await Team.update(
            req.body,
            { where: { id, organisation_id: orgId } }
        );

        if (updated) {
            const updatedTeam = await Team.findOne({ where: { id } });

            await createLog(orgId, req.user.userId, 'team_updated', { 
                teamId: id, 
                name: updatedTeam.name, 
                changes: req.body 
            });

            return res.status(200).json(updatedTeam);
        }

        return res.status(404).json({ message: 'Team not found or unauthorized.' });
    } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({ message: 'Server error updating team.' });
    }
};

// DELETE /api/teams/:id
exports.deleteTeam = async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId;

    try {
        const team = await Team.findOne({ where: { id, organisation_id: orgId } });
        if (!team) {
            return res.status(404).json({ message: 'Team not found or unauthorized.' });
        }
        
        const deleted = await Team.destroy({ where: { id, organisation_id: orgId } });

        if (deleted) {
             await createLog(orgId, req.user.userId, 'team_deleted', { 
                teamId: id, 
                name: team.name
            });
            return res.status(204).send();
        }

        return res.status(404).json({ message: 'Team not found or unauthorized.' });
    } catch (error) {
        console.error('Error deleting team:', error);
        return res.status(500).json({ message: 'Server error deleting team.' });
    }
};

// POST /api/teams/:teamId/assign
exports.assignEmployee = async (req, res) => {
    const { teamId } = req.params;
    const { employeeId, employeeIds } = req.body;
    const orgId = req.user.orgId;
    const idsToAssign = employeeIds || (employeeId ? [employeeId] : []);

    if (idsToAssign.length === 0) {
        return res.status(400).json({ message: 'Employee ID(s) are required for assignment.' });
    }

    try {
        const team = await Team.findOne({ where: { id: teamId, organisation_id: orgId } });
        if (!team) return res.status(404).json({ message: 'Team not found or unauthorized.' });

        const employees = await Employee.findAll({ 
            where: { id: idsToAssign, organisation_id: orgId } 
        });
        
        if (employees.length !== idsToAssign.length) {
            return res.status(404).json({ message: 'One or more employees not found or unauthorized.' });
        }

        const assignments = employees.map(emp => ({
            employee_id: emp.id,
            team_id: team.id
        }));

        const result = await EmployeeTeam.bulkCreate(assignments, { 
            ignoreDuplicates: true 
        });

        await createLog(orgId, req.user.userId, 'employee_assigned_to_team', { 
            teamId, teamName: team.name, employeeIds: idsToAssign 
        });

        return res.status(200).json({ 
            message: `${result.length} employee(s) assigned successfully.` 
        });
    } catch (error) {
        console.error('Error assigning employee(s):', error);
        return res.status(500).json({ message: 'Server error during assignment.' });
    }
};

// DELETE /api/teams/:teamId/unassign
exports.unassignEmployee = async (req, res) => {
    const { teamId } = req.params;
    // DELETE requests require the body to be sent via the { data: ... } property in axios
    const { employeeId } = req.body; 
    const orgId = req.user.orgId;

    if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required for unassignment.' });
    }

    try {
        const team = await Team.findOne({ where: { id: teamId, organisation_id: orgId } });
        if (!team) return res.status(404).json({ message: 'Team not found or unauthorized.' });

        const deleted = await EmployeeTeam.destroy({
            where: {
                team_id: teamId,
                employee_id: employeeId,
            }
        });

        if (deleted) {
            await createLog(orgId, req.user.userId, 'employee_unassigned_from_team', { 
                teamId, teamName: team.name, employeeId 
            });
            return res.status(204).send();
        }

        return res.status(404).json({ message: 'Assignment not found.' });

    } catch (error) {
        console.error('Error unassigning employee:', error);
        return res.status(500).json({ message: 'Server error during unassignment.' });
    }
};

exports.getTeamCount = async (req, res) => {
    try {
        const count = await db.Team.count({ 
            where: { organisation_id: req.user.orgId }
        });
        return res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching team count:', error);
        return res.status(500).json({ message: 'Server error fetching team count.' });
    }
};