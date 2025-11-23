import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Trash2, Edit, Users } from 'lucide-react';

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEmployees = async () => {
        setError('');
        try {
            setLoading(true);
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (err) {
            setError('Failed to fetch employees. Please log in or check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete employee ${name}?`)) return;

        try {
            await api.delete(`/employees/${id}`);
            fetchEmployees(); 
        } catch (err) {
            setError('Failed to delete employee.');
        }
    };

    if (loading) return <div className="p-8 text-center text-xl text-gray-600">Loading employees...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-600">Error: {error}</div>;

    return (
        <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
                    <Users className="w-7 h-7 mr-3 text-blue-600" /> Employee Management ({employees.length})
                </h2>
                <Link to="/employees/new" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md">
                    + Add New Employee
                </Link>
            </div>
            
            <div className="space-y-4">
                {employees.length === 0 ? (
                    <p className="text-gray-500 text-center p-10 border rounded-lg">No employee records found. Start by adding one!</p>
                ) : (
                    employees.map(emp => (
                        <div key={emp.id} className="bg-gray-50 border p-4 rounded-xl flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-gray-800">{emp.first_name} {emp.last_name}</span>
                                <span className="text-sm text-gray-600">{emp.email} | {emp.phone}</span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Teams: {emp.Teams?.map(team => team.name).join(', ') || 'Unassigned'}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <Link to={`/employees/edit/${emp.id}`}>
                                    <button className="p-2 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full transition-colors">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </Link>
                                <button onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
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

export default Employees;