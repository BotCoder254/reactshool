import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { FaFile, FaDownload, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const SubmissionReview = () => {
  const { assignmentId } = useParams();
  const { user } = useAuthStore();
  const { fetchSubmissions, updateSubmission, loading, error } = useClassStore();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    if (assignmentId) {
      loadSubmissions();
    }
  }, [assignmentId]);

  const loadSubmissions = async () => {
    const data = await fetchSubmissions(assignmentId);
    setSubmissions(data);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission) return;

    try {
      await updateSubmission(selectedSubmission.id, {
        feedback,
        grade: parseFloat(grade),
        gradedBy: user.uid,
        gradedAt: new Date()
      });

      setSelectedSubmission(null);
      setFeedback('');
      setGrade('');
      await loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
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
        <h1 className="text-2xl font-bold text-gray-800">Review Submissions</h1>
        <div className="text-gray-600">
          Total Submissions: {submissions.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Submissions List
          </h2>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedSubmission?.id === submission.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary'
                }`}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setFeedback(submission.feedback || '');
                  setGrade(submission.grade?.toString() || '');
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {submission.studentName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(submission.submittedAt?.toDate()).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      submission.grade
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {submission.grade ? 'Graded' : 'Pending'}
                  </div>
                </div>

                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-2 text-primary hover:underline"
                  >
                    <FaFile />
                    <span className="text-sm">View Submission</span>
                  </a>
                )}
              </motion.div>
            ))}

            {submissions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No submissions yet
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Provide Feedback
          </h2>

          {selectedSubmission ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (0-100)
                </label>
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  rows="6"
                  placeholder="Provide detailed feedback for the student..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setFeedback('');
                    setGrade('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!grade || !feedback}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a submission to provide feedback
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview; 