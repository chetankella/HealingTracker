import { Link } from 'react-router-dom';
import { FiUser, FiBell, FiSettings, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';

const Header = ({ userType, userName, hospitalName }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Hospital/App name */}
          <div className="flex items-center space-x-4">
            <Link to={userType === 'doctor' ? '/doctor' : '/patient'} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Healing Tracker</h1>
                {hospitalName && (
                  <p className="text-sm text-gray-500">{hospitalName}</p>
                )}
              </div>
            </Link>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <FiBell className="h-5 w-5" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FiUser className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userType}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiUser className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiSettings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <Link 
                    to="/" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiLogOut className="h-4 w-4 mr-3" />
                    Back to Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

