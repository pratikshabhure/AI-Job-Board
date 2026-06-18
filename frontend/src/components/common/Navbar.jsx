import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

const Navbar = () => {
  const { user, logout, isAdmin, isCandidate } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/jobs', label: 'Manage Jobs' },
  ];

  const candidateLinks = [
    { path: '/candidate/dashboard', label: 'Dashboard' },
    { path: '/candidate/profile', label: 'Profile' },
    { path: '/candidate/jobs', label: 'Browse Jobs' },
    { path: '/candidate/ai-match', label: 'AI Match' },
    { path: '/candidate/applications', label: 'My Applications' },
  ];

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              AI Job Board
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {isAdmin && adminLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              {isCandidate && candidateLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {user.role && (
              <>
                <span className="text-sm text-gray-600">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;