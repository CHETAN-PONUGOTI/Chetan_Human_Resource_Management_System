import { Link, useNavigate } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 p-4 shadow-lg flex justify-between items-center sticky top-0 z-10">
            <div className="text-xl font-bold text-white">
                <Link to="/" className="hover:text-gray-300">HRMS</Link>
            </div>
            <div className="flex items-center">
                {isLoggedIn ? (
                    <>
                        <Link to="/employees" className="text-white hover:text-blue-400 px-3 py-2 transition-colors duration-200">
                            Employees
                        </Link>
                        <Link to="/teams" className="text-white hover:text-blue-400 px-3 py-2 transition-colors duration-200">
                            Teams
                        </Link>
                        <button
                            onClick={handleLogoutClick}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 ml-4"
                        >
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-white hover:text-gray-300 px-3 py-2 transition-colors duration-200">
                            Login
                        </Link>
                        <Link to="/register-org" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 ml-3">
                            Register Org
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;