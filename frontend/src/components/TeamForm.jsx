// frontend/src/components/TeamForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function TeamForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id; // True if an ID exists in the URL

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch team data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const fetchTeam = async () => {
                setLoading(true);
                setError('');
                try {
                    // CRITICAL: Ensure the API call uses ONLY the single ID
                    const response = await api.get(`/teams/${id}`);
                    setFormData({ name: response.data.name, description: response.data.description });
                } catch (err) {
                    // Check for specific 404 error
                    if (err.response && err.response.status === 404) {
                        setError(`Team ID ${id} not found.`);
                    } else {
                        setError('Failed to load team data. Check server status or ID format.');
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchTeam();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await api.put(`/teams/${id}`, formData);
            } else {
                await api.post('/teams', formData);
            }
            navigate('/teams');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save team data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div className="p-8 text-center text-lg">Loading form data...</div>;

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-200 mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                {isEditMode ? 'Edit Team Details' : 'Create New Team'}
            </h2>
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md border border-red-200">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                           className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4"
                           className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate('/teams')} 
                            className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} 
                            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400">
                        {loading ? 'Saving...' : isEditMode ? 'Update Team' : 'Create Team'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TeamForm;