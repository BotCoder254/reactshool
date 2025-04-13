import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaTasks, FaCheckCircle, FaClock } from 'react-icons/fa';
import useAuthStore from '../../../store/authStore';
import useClassStore from '../../../store/classStore';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { classes, assignments, loading, fetchClasses } = useClassStore();

  useEffect(() => {
    if (user) {
      fetchClasses(user.uid, 'student');
    }
  }, [user, fetchClasses]);

  const stats = [
    {
      icon: <FaBook className="text-4xl text-primary" />,
      label: 'Enrolled Classes',
      value: classes.length
    },
    {
      icon: <FaTasks className="text-4xl text-secondary" />,
      label: 'Pending Assignments',
      value: assignments.filter(a => !a.submitted).length
    },
    {
      icon: <FaCheckCircle className="text-4xl text-accent" />,
      label: 'Completed Assignments',
      value: assignments.filter(a => a.submitted).length
    },
    {
      icon: <FaClock className="text-4xl text-light" />,
      label: 'Average Grade',
      value: '88%'
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
            Welcome, {user?.fullName}
          </h1>
          <p className="text-gray-600 mt-1">
            Track your progress and upcoming assignments
          </p>
        </div>
        <img
          src="https://illustrations.popsy.co/white/student-work.svg"
          alt="Student"
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
            Your Classes
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
                    {cls.subject} - {cls.schedule}
                  </p>
                </div>
                <span className="text-primary">
                  {cls.teacherName}
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
            {assignments.filter(a => !a.submitted).slice(0, 3).map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(assignment.dueDate?.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    new Date(assignment.dueDate?.toDate()) > new Date()
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {new Date(assignment.dueDate?.toDate()) > new Date()
                    ? 'Upcoming'
                    : 'Past Due'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;