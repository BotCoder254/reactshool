import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUpload, FaFile, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { storage } from '../../../firebase/config';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';
import toast, { Toaster } from 'react-hot-toast';

const AssignmentManagement = () => {
  const { user } = useAuthStore();
  const { classes, assignments, loading, error, fetchClasses, fetchAssignments, createAssignment, updateAssignment, deleteAssignment, uploadFile } = useClassStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    points: 100,
    instructions: '',
    allowedFileTypes: '.pdf,.doc,.docx',
    maxFileSize: 5, // in MB
  });

  useEffect(() => {
    if (user) {
      fetchClasses(user.uid, 'teacher');
      fetchAssignments(user.uid, 'teacher');
    }
  }, [user, fetchClasses, fetchAssignments]);

  const handleFileUpload = async (files) => {
    try {
      const fileArray = Array.from(files);
      const newAttachments = [];
      
      for (const file of fileArray) {
        if (file.size > formData.maxFileSize * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds ${formData.maxFileSize}MB limit`);
        }

        // Create a unique ID for this upload
        const uploadId = `${file.name}-${Date.now()}`;
        setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

        try {
          const fileUrl = await uploadFile(file, (progress) => {
            setUploadProgress(prev => ({ ...prev, [uploadId]: progress }));
          });

          newAttachments.push({
            name: file.name,
            url: fileUrl,
            type: file.type,
            size: file.size,
            uploadId
          });
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          // Continue with other files even if one fails
        }
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error handling files:', error);
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.classId || !formData.dueDate) return;

    try {
      const assignmentData = {
        ...formData,
        attachments,
        teacherId: user.uid,
        dueDate: new Date(formData.dueDate),
        createdAt: new Date()
      };

      if (selectedAssignment) {
        await updateAssignment(selectedAssignment.id, assignmentData);
      } else {
        await createAssignment(assignmentData);
      }
      setIsModalOpen(false);
      setSelectedAssignment(null);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      classId: '',
      dueDate: '',
      points: 100,
      instructions: '',
      allowedFileTypes: '.pdf,.doc,.docx',
      maxFileSize: 5,
    });
    setAttachments([]);
    setUploadProgress({});
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId,
      dueDate: assignment.dueDate?.toDate().toISOString().split('T')[0],
      points: assignment.points,
      instructions: assignment.instructions,
      allowedFileTypes: assignment.allowedFileTypes,
      maxFileSize: assignment.maxFileSize,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignment(assignmentId);
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
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Assignment Management</h1>
        <button
          onClick={() => {
            setSelectedAssignment(null);
            setFormData({
              title: '',
              description: '',
              classId: '',
              dueDate: '',
              points: 100,
              instructions: '',
              allowedFileTypes: '.pdf,.doc,.docx',
              maxFileSize: 5,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FaPlus /> Create Assignment
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {classes.find(c => c.id === assignment.classId)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/dashboard/submissions/${assignment.id}`}
                  className="p-2 text-primary hover:bg-primary/10 rounded-full"
                >
                  <FaEye />
                </Link>
                <button
                  onClick={() => handleEdit(assignment)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{assignment.description}</p>

            {assignment.attachments?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {assignment.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FaFile className="text-primary" />
                      <span className="text-sm text-gray-600">{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>Due: {new Date(assignment.dueDate?.toDate()).toLocaleDateString()}</div>
              <div>Points: {assignment.points}</div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Submissions: {assignment.submissions?.length || 0}
                </span>
                <Link
                  to={`/dashboard/submissions/${assignment.id}`}
                  className="text-primary hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <img
            src="https://illustrations.popsy.co/white/task-list.svg"
            alt="No assignments"
            className="w-48 h-48 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Assignments Created
          </h2>
          <p className="text-gray-600">
            Create your first assignment to get started.
          </p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedAssignment ? 'Edit Assignment' : 'Create Assignment'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    rows="4"
                    placeholder="Provide detailed instructions for the assignment..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                      accept={formData.allowedFileTypes}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <FaUpload className="text-2xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload files (max {formData.maxFileSize}MB each)
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Accepted formats: {formData.allowedFileTypes}
                      </span>
                    </label>
                  </div>

                  {Object.entries(uploadProgress).map(([uploadId, progress]) => (
                    progress < 100 && (
                      <div key={uploadId} className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{uploadId.split('-')[0]}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  ))}

                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={file.uploadId || index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FaFile className="text-primary" />
                            <div>
                              <span className="text-sm text-gray-600">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newAttachments = attachments.filter((_, i) => i !== index);
                              setAttachments(newAttachments);
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <FaSpinner className="animate-spin" />}
                    {selectedAssignment ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentManagement; 