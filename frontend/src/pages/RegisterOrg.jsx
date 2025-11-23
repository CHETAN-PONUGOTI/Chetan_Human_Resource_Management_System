import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function RegisterOrg() {
    const [formData, setFormData] = useState({
        orgName: '',
        adminName: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/register', formData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setMessage('Registration successful! Redirecting to dashboard...');
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-lg p-10 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-900">Register Organization Account</h2>
                {message && <p className="text-green-600 text-center text-sm">{message}</p>}
                {error && <p className="text-red-600 text-center text-sm">{error}</p>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input type="text" name="orgName" placeholder="Organization Name" value={formData.orgName} onChange={handleChange} required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input type="text" name="adminName" placeholder="Admin Full Name" value={formData.adminName} onChange={handleChange} required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input type="email" name="email" placeholder="Admin Email" value={formData.email} onChange={handleChange} required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Processing...' : 'Register & Create Account'}
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-600">
                    Already have an organization? 
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterOrg;