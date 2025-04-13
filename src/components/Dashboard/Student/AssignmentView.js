import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaUpload, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const formatDate = (date) => {
  if (!date) return 'No due date';
  try {
    if (date.toDate) {
      // Handle Firestore Timestamp
      date = date.toDate();
    } else if (typeof date === 'string') {
      // Handle string date
      date = new Date(date);
    } else if (!(date instanceof Date)) {
      // Handle any other format
      date = new Date(date);
    }

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString(undefined, {
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
  const { assignments, loading, error, fetchAssignments, submitAssignment } = useClassStore();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      fetchAssignments(user.uid, user.role);
    }
  }, [user, fetchAssignments]);

  const handleFileChange = (e, assignmentId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadError('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setSelectedAssignment(assignmentId);
      setUploadError(null);
    }
  };

  const handleSubmit = async (assignmentId) => {
    if (!selectedFile) return;

    try {
      setSubmitting(true);
      await submitAssignment(assignmentId, {
        studentId: user.uid,
        file: selectedFile,
        submittedAt: new Date()
      });
      
      setSelectedFile(null);
      setSelectedAssignment(null);
      setUploadError(null);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

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
      
      {uploadError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <FaExclamationCircle />
          <span>{uploadError}</span>
        </div>
      )}
      
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <img
            src="https://illustrations.popsy.co/white/work-from-home.svg"
            alt="No assignments"
            className="w-48 h-48 mx-auto mb-4"
          />
          <p className="text-gray-600">No assignments available.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
              <p className="mt-2 text-gray-600">{assignment.description}</p>
              
              <div className="mt-4 text-sm text-gray-500">
                Due: {formatDate(assignment.dueDate)}
              </div>
              
              {assignment.files?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700">Assignment Files:</h4>
                  <div className="mt-2 space-y-2">
                    {assignment.files.map((file) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <FaFileAlt className="mr-2" />
                        {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!assignment.submitted ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, assignment.id)}
                      className="hidden"
                      id={`file-upload-${assignment.id}`}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <label
                      htmlFor={`file-upload-${assignment.id}`}
                      className={`flex-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer ${
                        isOverdue(assignment.dueDate)
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-primary hover:bg-primary-dark'
                      }`}
                    >
                      <FaUpload />
                      {selectedFile && selectedAssignment === assignment.id
                        ? selectedFile.name
                        : 'Choose File'}
                    </label>
                    {selectedFile && selectedAssignment === assignment.id && (
                      <button
                        onClick={() => handleSubmit(assignment.id)}
                        disabled={submitting}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Accepted formats: PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                  {isOverdue(assignment.dueDate) && (
                    <p className="text-xs text-red-500">
                      This assignment is overdue. Late submissions may be penalized.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-green-500 font-medium flex items-center gap-2">
                  <FaFileAlt />
                  Submitted
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AssignmentView; 