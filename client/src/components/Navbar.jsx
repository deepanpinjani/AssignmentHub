import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 text-gray-900 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-gray-900">AssignmentHub</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                PRMCEAM
              </span>
            </div>
          </Link>

          {/* Right Navigation / User Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                  {user?.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-blue-600" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                  )}
                  <div className="text-left text-xs">
                    <p className="font-semibold text-gray-800 leading-tight">{user?.name}</p>
                    <p className="text-gray-500 capitalize">{user?.role === 'admin' ? 'Professor / Admin' : 'Student'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  title="Log out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/student/login"
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
