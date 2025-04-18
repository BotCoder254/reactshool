import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { FaUpload, FaFile, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';
import { storage } from '../../../firebase/config';

const formatDate = (date) => {
  if (!date) return 'Not available';
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

    return dateObj.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const StudentSubmission = () => {
  const { assignmentId } = useParams();
  const { user } = useAuthStore();
  const { assignments, fetchAssignments, submitAssignment, loading, error } = useClassStore();
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      fetchAssignments(user.uid, user.role);
    }
  }, [user, fetchAssignments]);

  const assignment = assignments.find(a => a.id === assignmentId);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) { // 10MB limit
      setFile(selectedFile);
    } else {
      alert('File size should be less than 10MB');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !comment) return;

    try {
      const now = new Date();
      const submissionData = {
        assignmentId,
        studentId: user.uid,
        comment,
        submittedAt: now,
        submittedAtString: now.toISOString(), // Add string version for consistency
      };

      if (file) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`submissions/${assignmentId}/${user.uid}/${file.name}`);
        
        const uploadTask = fileRef.put(file);
        
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
          },
          async () => {
            try {
              const fileUrl = await uploadTask.snapshot.ref.getDownloadURL();
              submissionData.fileUrl = fileUrl;
              submissionData.fileName = file.name;
              
              await submitAssignment(assignmentId, submissionData);
              setFile(null);
              setComment('');
              setUploadProgress(0);
              await fetchAssignments(user.uid, user.role);
            } catch (uploadError) {
              console.error('Error completing submission:', uploadError);
              alert('Error submitting assignment. Please try again.');
            }
          }
        );
      } else {
        await submitAssignment(assignmentId, submissionData);
        setComment('');
        await fetchAssignments(user.uid, user.role);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting assignment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8 text-gray-500">
        Assignment not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {assignment.title}
        </h1>
        
        <div className="prose max-w-none mb-6">
          <p className="text-gray-600">{assignment.description}</p>
          
          <div className="mt-4">
            <strong className="text-gray-700">Due Date:</strong>{' '}
            <span className="text-gray-600">
              {formatDate(assignment.dueDate)}
            </span>
          </div>

          {assignment.fileUrl && (
            <a
              href={assignment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline mt-4"
            >
              <FaFile />
              <span>Download Assignment Materials</span>
            </a>
          )}
        </div>

        {submission ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Submission
            </h2>
            
            <div className="space-y-4">
              {submission.fileUrl && (
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <FaFile />
                  <span>{submission.fileName}</span>
                </a>
              )}

              {submission.comment && (
                <div className="text-gray-600">
                  <strong className="text-gray-700">Your Comment:</strong>
                  <p className="mt-1">{submission.comment}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Submitted on: {formatDate(submission.submittedAt)}
              </div>

              {submission.grade !== undefined && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Feedback
                  </h3>
                  <div className="space-y-2">
                    <div className="text-gray-700">
                      <strong>Grade:</strong> {submission.grade}/100
                    </div>
                    {submission.feedback && (
                      <div className="text-gray-600">
                        <strong>Teacher's Feedback:</strong>
                        <p className="mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File (Optional)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <div className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                    <FaUpload className="mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {file ? file.name : 'Choose a file'}
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                rows="4"
                placeholder="Add any comments about your submission..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={(!file && !comment) || loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentSubmission; 