import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaUserTie, FaClock, FaTasks, FaPlus } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';
import JoinClass from './JoinClass';

const EnrolledClasses = () => {
  const { user } = useAuthStore();
  const { classes, loading, error, fetchClasses } = useClassStore();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchClasses(user.uid, 'student');
    }
  }, [user, fetchClasses]);

  const filteredClasses = classes.filter(cls => {
    switch (activeTab) {
      case 'active':
        return cls.assignments?.some(a => !a.submitted);
      case 'completed':
        return cls.assignments?.every(a => a.submitted);
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          <FaPlus /> Join Class
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          All Classes
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'completed'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white p-6 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105 ${
              selectedClass?.id === cls.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedClass(cls.id === selectedClass?.id ? null : cls)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <FaBook className="text-2xl text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{cls.name}</h2>
                <p className="text-sm text-gray-600">{cls.subject}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <FaUserTie className="text-primary" />
                <span>{cls.teacherName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaClock className="text-primary" />
                <span>{cls.schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaTasks className="text-primary" />
                <span>
                  {cls.assignments?.filter(a => !a.submitted).length || 0} Pending Assignments
                </span>
              </div>
            </div>

            {selectedClass?.id === cls.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t"
              >
                <h3 className="font-medium text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{cls.description}</p>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Recent Assignments</h3>
                  {cls.assignments?.length > 0 ? (
                    <div className="space-y-2">
                      {cls.assignments.slice(0, 3).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm text-gray-600">{assignment.title}</span>
                          <span className="text-xs text-primary">
                            Due: {new Date(assignment.dueDate?.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No assignments yet</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <img
            src="https://illustrations.popsy.co/white/taking-notes.svg"
            alt="No classes"
            className="w-48 h-48 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Classes Found
          </h2>
          <p className="text-gray-600">
            Join your first class to get started.
          </p>
        </div>
      )}

      {/* Join Class Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <JoinClass onClose={() => setShowJoinModal(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnrolledClasses; 