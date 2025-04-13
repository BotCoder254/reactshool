import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaUpload, FaSpinner, FaExclamationCircle, FaCalendar, FaCheckCircle, FaClock } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const formatDate = (date) => {
  if (!date) return 'No due date';
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

    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const AssignmentView = () => {
  const { user } = useAuthStore();
  const { assignments, loading, error, fetchAssignments } = useClassStore();
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      fetchAssignments(user.uid, user.role);
    }
  }, [user, fetchAssignments]);

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 gap-2">
        <FaExclamationCircle />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Assignments</h2>
        <div className="text-sm text-gray-600">
          Total: {assignments.length} | Pending: {assignments.filter(a => !a.submitted).length}
        </div>
      </div>
      
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <img
            src="https://illustrations.popsy.co/white/work-from-home.svg"
            alt="No assignments"
            className="w-48 h-48 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Assignments Found</h3>
          <p className="text-gray-600">You don't have any assignments at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 bg-white rounded-lg shadow-lg border-l-4 ${
                assignment.submitted 
                  ? 'border-green-500' 
                  : isOverdue(assignment.dueDate)
                    ? 'border-red-500'
                    : 'border-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                {assignment.submitted ? (
                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full flex items-center gap-1">
                    <FaCheckCircle /> Submitted
                  </span>
                ) : isOverdue(assignment.dueDate) ? (
                  <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full flex items-center gap-1">
                    <FaClock /> Overdue
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full flex items-center gap-1">
                    <FaClock /> Pending
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <FaCalendar />
                <span>Due: {formatDate(assignment.dueDate)}</span>
              </div>
              
              {assignment.attachments?.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Assignment Files:</div>
                  <div className="space-y-2">
                    {assignment.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm text-primary transition-colors"
                      >
                        <FaFileAlt />
                        <span className="truncate">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to={`/dashboard/student/submission/${assignment.id}`}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 mt-4 rounded-lg text-white transition-colors ${
                  assignment.submitted
                    ? 'bg-green-500 hover:bg-green-600'
                    : isOverdue(assignment.dueDate)
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {assignment.submitted ? (
                  <>
                    <FaCheckCircle />
                    View Submission
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Submit Assignment
                  </>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AssignmentView; 