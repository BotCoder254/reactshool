import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaBell, FaLock, FaSignOutAlt } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

const Settings = () => {
  const { user, signOut } = useAuthStore();
  const [notifications, setNotifications] = useState({
    email: true,
    assignments: true,
    grades: true,
    announcements: true
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-lg"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <FaUser className="text-2xl text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={user?.fullName || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Email Notifications</span>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => handleNotificationChange('email')}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white m-1 transition-transform ${
                      notifications.email ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Assignment Updates</span>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.assignments ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => handleNotificationChange('assignments')}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white m-1 transition-transform ${
                      notifications.assignments ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Grade Notifications</span>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.grades ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => handleNotificationChange('grades')}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white m-1 transition-transform ${
                      notifications.grades ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Announcements</span>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.announcements ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => handleNotificationChange('announcements')}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white m-1 transition-transform ${
                      notifications.announcements ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h2>
        <div className="space-y-4">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            onClick={() => {/* Implement password change */}}
          >
            <FaLock />
            Change Password
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={signOut}
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings; 