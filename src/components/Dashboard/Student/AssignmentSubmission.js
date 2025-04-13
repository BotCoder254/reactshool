import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaFile, FaClock, FaCheckCircle } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const AssignmentSubmission = () => {
  const { user } = useAuthStore();
  const { assignments, loading, error, fetchAssignments, submitAssignment } = useClassStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    if (user) {
      // Fetch assignments for all enrolled classes
      fetchAssignments();
    }
  }, [user, fetchAssignments]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (assignmentId) => {
    if (!selectedFile) return;

    try {
      setSubmitting(true);
      await submitAssignment({
        assignmentId,
        studentId: user.uid,
        submittedAt: new Date(),
      }, selectedFile);
      
      setSelectedFile(null);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        <div className="text-gray-600">
          Pending: {assignments.filter(a => !a.submitted).length}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {assignment.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {assignment.className} - {assignment.subject}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                assignment.submitted
                  ? 'bg-green-100 text-green-600'
                  : new Date(assignment.dueDate?.toDate()) > new Date()
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {assignment.submitted
                  ? 'Submitted'
                  : new Date(assignment.dueDate?.toDate()) > new Date()
                  ? 'Pending'
                  : 'Overdue'}
              </div>
            </div>

            <p className="text-gray-600 mb-4">{assignment.description}</p>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <FaClock />
              <span>Due: {new Date(assignment.dueDate?.toDate()).toLocaleDateString()}</span>
            </div>

            {!assignment.submitted && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex-1">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                    />
                    <div className="flex items-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <FaUpload className="text-gray-400" />
                      <span className="text-gray-600">
                        {selectedFile && selectedAssignment?.id === assignment.id
                          ? selectedFile.name
                          : 'Choose file'}
                      </span>
                    </div>
                  </label>
                  <button
                    onClick={() => handleSubmit(assignment.id)}
                    disabled={!selectedFile || submitting || selectedAssignment?.id !== assignment.id}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>
            )}

            {assignment.submitted && (
              <div className="flex items-center gap-2 text-green-600">
                <FaCheckCircle />
                <span>Submitted on {new Date(assignment.submittedAt?.toDate()).toLocaleDateString()}</span>
                {assignment.fileUrl && (
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline ml-4"
                  >
                    <FaFile />
                    View Submission
                  </a>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <img
            src="https://illustrations.popsy.co/white/work-from-home.svg"
            alt="No assignments"
            className="w-48 h-48 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Assignments Found
          </h2>
          <p className="text-gray-600">
            You don't have any assignments at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmission; 