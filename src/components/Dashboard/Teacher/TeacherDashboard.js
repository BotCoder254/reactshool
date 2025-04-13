import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaTasks, FaUserGraduate, FaChartLine } from 'react-icons/fa';
import useAuthStore from '../../../store/authStore';
import useClassStore from '../../../store/classStore';

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    let dateObj;
    if (typeof date === 'object' && date.toDate) {
      // Handle Firestore Timestamp
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      // Handle string date
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      // Handle Date object
      dateObj = date;
    } else {
      // Handle any other format
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const isDatePassed = (date) => {
  if (!date) return false;
  try {
    let dateObj;
    if (typeof date === 'object' && date.toDate) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    return dateObj < new Date();
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const { classes, assignments, loading, fetchClasses, fetchAssignments } = useClassStore();

  useEffect(() => {
    if (user) {
      fetchClasses(user.uid, 'teacher');
      fetchAssignments(user.uid, 'teacher');
    }
  }, [user, fetchClasses, fetchAssignments]);

  const stats = [
    {
      icon: <FaBook className="text-4xl text-primary" />,
      label: 'Total Classes',
      value: classes.length
    },
    {
      icon: <FaTasks className="text-4xl text-secondary" />,
      label: 'Active Assignments',
      value: assignments.length
    },
    {
      icon: <FaUserGraduate className="text-4xl text-accent" />,
      label: 'Total Students',
      value: classes.reduce((acc, curr) => acc + (curr.studentIds?.length || 0), 0)
    },
    {
      icon: <FaChartLine className="text-4xl text-light" />,
      label: 'Completion Rate',
      value: '85%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your classes today
          </p>
        </div>
        <img
          src="https://illustrations.popsy.co/white/teacher-pointing-at-board.svg"
          alt="Teacher"
          className="w-32 h-32"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              {stat.icon}
              <span className="text-3xl font-bold text-gray-800">
                {stat.value}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">{stat.label}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Classes
          </h2>
          <div className="space-y-4">
            {classes.slice(0, 3).map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{cls.name}</h3>
                  <p className="text-sm text-gray-600">
                    {cls.studentIds?.length || 0} students enrolled
                  </p>
                </div>
                <span className="text-primary">
                  {formatDate(cls.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upcoming Assignments
          </h2>
          <div className="space-y-4">
            {assignments.slice(0, 3).map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Due: {formatDate(assignment.dueDate)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    !isDatePassed(assignment.dueDate)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {!isDatePassed(assignment.dueDate) ? 'Upcoming' : 'Past Due'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 