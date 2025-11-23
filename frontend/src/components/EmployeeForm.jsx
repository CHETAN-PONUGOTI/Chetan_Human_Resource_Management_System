// frontend/src/components/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EmployeeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id; // True if an ID exists in the URL

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [allTeams, setAllTeams] = useState([]); // List of all available teams for checkboxes
    const [assignedTeams, setAssignedTeams] = useState(new Set()); // Set of assigned team IDs
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Fetch Employee Data, Assigned Teams, and All Available Teams ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch all available teams (needed for checkboxes)
                const teamsResponse = await api.get('/teams');
                setAllTeams(teamsResponse.data);

                if (isEditMode) {
                    // 2. Fetch specific employee data (for pre-filling form and current assignments)
                    const empResponse = await api.get(`/employees/${id}`);
                    setFormData(empResponse.data);
                    
                    // 3. Set the initial set of assigned team IDs
                    const assignedIds = new Set(empResponse.data.Teams.map(t => t.id));
                    setAssignedTeams(assignedIds);
                }
            } catch (err) {
                console.error("Fetch Data Error:", err);
                // Enhanced error reporting for 404s
                if (err.response && err.response.status === 404) {
                    setError(`Employee ID ${id} not found or unauthorized.`);
                } else {
                    setError(err.response?.data?.message || 'Failed to load form data or team list.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Handle Team Checkbox Changes ---
    const handleTeamAssignment = (teamId, isChecked) => {
        setAssignedTeams(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(teamId);
            } else {
                newSet.delete(teamId);
            }
            return newSet;
        });
    };

    // --- Handle Form Submission (CRUD + Assignment Sync) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        let employeeId;

        try {
            // A) CREATE/UPDATE EMPLOYEE RECORD
            if (isEditMode) {
                await api.put(`/employees/${id}`, formData); // 🚨 This is the failing PUT request
                employeeId = id;
            } else {
                const response = await api.post('/employees', formData);
                employeeId = response.data.id;
            }

            // B) SYNC TEAM ASSIGNMENTS 
            if (employeeId) {
                // Fetch the absolute latest assignment state BEFORE processing changes
                const currentTeamsResponse = await api.get(`/employees/${employeeId}`);
                const currentAssignedIds = new Set(currentTeamsResponse.data.Teams.map(t => t.id));

                const teamsToAssign = [...assignedTeams].filter(teamId => !currentAssignedIds.has(teamId));
                const teamsToUnassign = [...currentAssignedIds].filter(teamId => !assignedTeams.has(teamId));

                // Process assignments
                await Promise.all(teamsToAssign.map(teamId => 
                    api.post(`/teams/${teamId}/assign`, { employeeId: employeeId })
                ));
                
                // Process unassignments (Must use { data: ... } for DELETE with body)
                await Promise.all(teamsToUnassign.map(teamId => 
                    api.delete(`/teams/${teamId}/unassign`, { data: { employeeId: employeeId } })
                ));
            }

            navigate('/employees');
        } catch (err) {
            // Display specific error message from backend (like 'Employee not found or unauthorized.')
            setError(err.response?.data?.message || 'Failed to save data or update assignments.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-xl text-gray-600">Loading form data...</div>;

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-200 mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                {isEditMode ? `Edit Employee: ${formData.first_name}` : 'Create New Employee'}
            </h2>
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md border border-red-200">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- Employee Details Section --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                {/* --- Team Assignment Section --- */}
                {isEditMode && (
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Team Assignment</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {allTeams.length === 0 ? (
                                <p className="col-span-3 text-gray-500">No teams available. Create teams first.</p>
                            ) : (
                                allTeams.map(team => (
                                    <label key={team.id} className="inline-flex items-center p-3 border rounded-lg bg-white shadow-sm cursor-pointer hover:border-blue-500">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                            checked={assignedTeams.has(team.id)}
                                            onChange={(e) => handleTeamAssignment(team.id, e.target.checked)}
                                            disabled={loading}
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">{team.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* --- Action Buttons --- */}
                <div className="pt-6 flex justify-end space-x-3 border-t">
                    <button type="button" onClick={() => navigate('/employees')} 
                            className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} 
                            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400">
                        {loading ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EmployeeForm;