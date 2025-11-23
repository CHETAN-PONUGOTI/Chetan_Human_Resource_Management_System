import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Trash2, Edit, Briefcase } from 'lucide-react';

function Teams() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTeams = async () => {
        setError('');
        try {
            setLoading(true);
            const response = await api.get('/teams');
            setTeams(response.data);
        } catch (err) {
            setError('Failed to fetch teams. Ensure the backend is running and you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete the team "${name}"? This will unassign all employees.`)) return;

        try {
            await api.delete(`/teams/${id}`);
            fetchTeams(); 
        } catch (err) {
            setError('Failed to delete team.');
        }
    };

    if (loading) return <div className="p-8 text-center text-xl text-gray-600">Loading teams...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-600">Error: {error}</div>;

    return (
        <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
                    <Briefcase className="w-7 h-7 mr-3 text-green-600" /> Team Management ({teams.length})
                </h2>
                <Link to="/teams/new" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md">
                    + Create New Team
                </Link>
            </div>
            
            <div className="space-y-4">
                {teams.length === 0 ? (
                    <p className="text-gray-500 text-center p-10 border rounded-lg">No teams found. Start by creating one!</p>
                ) : (
                    teams.map(team => (
                        <div key={team.id} className="bg-gray-50 border p-4 rounded-xl flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-gray-800">{team.name}</span>
                                <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                                <span className="text-xs text-gray-500 mt-2 font-medium">
                                    Employees: {team.Employees ? team.Employees.length : 0}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <Link to={`/teams/edit/${team.id}`}>
                                    <button className="p-2 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full transition-colors">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </Link>
                                <button onClick={() => handleDelete(team.id, team.name)}
                                        className="p-2 text-red-600 hover:text-red-800 bg-red-100 rounded-full transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Teams;