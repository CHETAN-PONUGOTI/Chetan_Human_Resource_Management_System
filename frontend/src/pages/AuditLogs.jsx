// frontend/src/pages/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History } from 'lucide-react';

function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/logs');
                setLogs(response.data);
            } catch (err) {
                setError('Failed to fetch audit logs. Ensure backend /api/logs route is working.');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div className="p-8 text-center text-xl text-gray-600">Loading audit trail...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-600">Error: {error}</div>;

    return (
        <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                <History className="w-7 h-7 mr-3 text-purple-600" /> Audit Log (Last 100 Entries)
            </h2>
            
            {logs.length === 0 ? (
                <p className="text-gray-500 text-center p-10 border rounded-lg">No audit activity logged yet.</p>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div key={log.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-purple-700 uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</span>
                                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-800 mt-1">
                                By User: **{log.User?.email || `ID ${log.user_id}`}**
                            </p>
                            <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2 overflow-auto">
                                {JSON.stringify(log.meta, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AuditLogs;