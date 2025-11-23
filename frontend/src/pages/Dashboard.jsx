// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; 

function Dashboard() {
    const [userName, setUserName] = useState('Admin');
    const [orgId, setOrgId] = useState(null);
    const [stats, setStats] = useState({ employees: 0, teams: 0 });
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            setUserName(user.name || user.email);
            setOrgId(user.orgId);
        }
        
        fetchStats();

    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch employee and team counts concurrently
            const [empCountResponse, teamCountResponse] = await Promise.all([
                api.get('/stats/employees/count'),
                api.get('/stats/teams/count')
            ]);
            
            setStats({ 
                employees: empCountResponse.data.count, 
                teams: teamCountResponse.data.count 
            });
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            // Set stats to 0 or an error state if API fails
            setStats({ employees: 'N/A', teams: 'N/A' }); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 text-center min-h-[80vh] bg-gray-50">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3">Welcome back, {userName}!</h1>
            <p className="text-lg text-gray-500 mb-10">HRMS Dashboard for Organization ID: #{orgId || 'N/A'}</p>

            <div className="flex justify-center gap-8 mt-10 flex-wrap">
                {/* Employees Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 w-72 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Employees</h2>
                    <p className="text-6xl font-bold text-blue-600 mb-6">
                        {loading ? '...' : stats.employees}
                    </p>
                    <Link to="/employees" className="block w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Manage Employees
                    </Link>
                </div>

                {/* Teams Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 w-72 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Teams</h2>
                    <p className="text-6xl font-bold text-green-600 mb-6">
                        {loading ? '...' : stats.teams}
                    </p>
                    <Link to="/teams" className="block w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        Manage Teams
                    </Link>
                </div>
                
                {/* Logs Card (Audit Trail) */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 w-72 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Audit Logs</h2>
                    <p className="text-6xl font-bold text-purple-600 mb-6">
                        View
                    </p>
                    <Link to="/logs" className="block w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                        View Audit Trail
                    </Link>
                </div>
            </div>
            
            <p className="mt-12 text-gray-600 text-lg">
                Quick Actions: 
                <Link to="/employees/new" className="text-blue-600 hover:text-blue-800 ml-4 font-medium">Add Employee</Link> 
                | 
                <Link to="/teams/new" className="text-blue-600 hover:text-blue-800 ml-4 font-medium">Create Team</Link>
            </p>
        </div>
    );
}

export default Dashboard;