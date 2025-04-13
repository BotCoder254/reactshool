import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const AssignmentManagement = () => {
  const { user } = useAuthStore();
  const { classes, assignments, loading, error, fetchClasses, createAssignment, updateAssignment, deleteAssignment } = useClassStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    points: 100
  });

  useEffect(() => {
    if (user) {
      fetchClasses(user.uid, 'teacher');
    }
  }, [user, fetchClasses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAssignment) {
        await updateAssignment(selectedAssignment.id, { ...formData });
      } else {
        await createAssignment({
          ...formData,
          teacherId: user.uid,
          createdAt: new Date()
        });
      }
      setIsModalOpen(false);
      setSelectedAssignment(null);
      setFormData({
        title: '',
        description: '',
        classId: '',
        dueDate: '',
        points: 100
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId,
      dueDate: assignment.dueDate?.toDate().toISOString().split('T')[0],
      points: assignment.points
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
              points: 100
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

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>Due: {new Date(assignment.dueDate?.toDate()).toLocaleDateString()}</div>
              <div>Points: {assignment.points}</div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Submissions: {assignment.submissions?.length || 0}
                </span>
                <span className="text-primary">
                  View Details →
                </span>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
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
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  {selectedAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement; 