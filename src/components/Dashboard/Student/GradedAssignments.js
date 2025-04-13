import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaFile, FaComment } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const GradedAssignments = () => {
  const { user } = useAuthStore();
  const { assignments, loading, error, fetchAssignments } = useClassStore();

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user, fetchAssignments]);

  // Filter only graded assignments
  const gradedAssignments = assignments.filter(
    (assignment) => assignment.submitted && assignment.grade
  );

  // Calculate average grade
  const averageGrade = gradedAssignments.length
    ? (
        gradedAssignments.reduce((acc, curr) => acc + curr.grade, 0) /
        gradedAssignments.length
      ).toFixed(1)
    : 0;

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
        <h1 className="text-2xl font-bold text-gray-800">Graded Assignments</h1>
        <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
          <FaStar className="text-yellow-300" />
          <span>Average Grade: {averageGrade}%</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gradedAssignments.map((assignment) => (
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
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <FaStar className="text-primary" />
                <span className="font-semibold text-primary">
                  {assignment.grade}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FaFile />
                <span>Submitted on {new Date(assignment.submittedAt?.toDate()).toLocaleDateString()}</span>
                {assignment.fileUrl && (
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-2"
                  >
                    View Submission
                  </a>
                )}
              </div>

              {assignment.feedback && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-800 mb-2">
                    <FaComment className="text-primary" />
                    <h3 className="font-medium">Teacher's Feedback</h3>
                  </div>
                  <p className="text-gray-600">{assignment.feedback}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    assignment.grade >= 90
                      ? 'bg-green-500'
                      : assignment.grade >= 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                >
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${assignment.grade}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {assignment.grade >= 90
                    ? 'Excellent'
                    : assignment.grade >= 70
                    ? 'Good'
                    : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {gradedAssignments.length === 0 && (
        <div className="text-center py-12">
          <img
            src="https://illustrations.popsy.co/white/grade-calculator.svg"
            alt="No graded assignments"
            className="w-48 h-48 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Graded Assignments
          </h2>
          <p className="text-gray-600">
            Your submitted assignments will appear here once they are graded.
          </p>
        </div>
      )}
    </div>
  );
};

export default GradedAssignments; 