import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import RegisterOrg from './pages/RegisterOrg';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Teams from './pages/Teams';
import AuditLogs from './pages/AuditLogs';
import Navbar from './components/Navbar'; 
import EmployeeForm from './components/EmployeeForm'; 
import TeamForm from './components/TeamForm'; 

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
    }, [isLoggedIn]); 

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            <div className="min-h-screen">
                <Routes>
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/register-org" element={<RegisterOrg />} />

                    <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    
                    <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                    <Route path="/employees/new" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
                    <Route path="/employees/edit/:id" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
                    
                    <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
                    <Route path="/teams/new" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />
                    <Route path="/teams/edit/:id" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />

                    <Route path="/logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} /> 
                </Routes>
            </div>
        </Router>
    );
}

export default App;