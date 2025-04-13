import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBook,
  FaTasks,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const teacherMenuItems = [
    { icon: FaChartBar, label: 'Dashboard', path: '/dashboard' },
    { icon: FaBook, label: 'Classes', path: '/dashboard/teacher/classes' },
    { icon: FaTasks, label: 'Assignments', path: '/dashboard/teacher/assignments' },
    { icon: FaCog, label: 'Settings', path: '/dashboard/settings' },
  ];

  const studentMenuItems = [
    { icon: FaChartBar, label: 'Dashboard', path: '/dashboard' },
    { icon: FaBook, label: 'My Classes', path: '/dashboard/student/classes' },
    { icon: FaTasks, label: 'Assignments', path: '/dashboard/student/assignments' },
    { icon: FaCheckCircle, label: 'Graded Work', path: '/dashboard/student/graded' },
    { icon: FaCog, label: 'Settings', path: '/dashboard/settings' },
  ];

  const menuItems = user?.role === 'teacher' ? teacherMenuItems : studentMenuItems;

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: isCollapsed ? 80 : 250 }}
      className="min-h-screen bg-white shadow-lg relative z-10"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-primary text-white p-1 rounded-full shadow-lg z-10"
      >
        {isCollapsed ? <FaBars size={14} /> : <FaTimes size={14} />}
      </button>

      <div className="p-4">
        <div className="flex items-center mb-8">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              {user?.role === 'teacher' ? (
                <FaChalkboardTeacher className="text-2xl text-primary" />
              ) : (
                <FaUserGraduate className="text-2xl text-primary" />
              )}
              <span className="font-semibold text-gray-800">
                {user?.fullName || 'User'}
              </span>
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto"
            >
              {user?.role === 'teacher' ? (
                <FaChalkboardTeacher className="text-2xl text-primary" />
              ) : (
                <FaUserGraduate className="text-2xl text-primary" />
              )}
            </motion.div>
          )}
        </div>

        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`text-xl ${active ? 'text-white' : ''}`} />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-xl" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      Sign Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar; 