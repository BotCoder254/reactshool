import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const ClassManagement = () => {
  const { user } = useAuthStore();
  const { classes, loading, error, fetchClasses, createClass, updateClass, deleteClass } = useClassStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    schedule: ''
  });

  useEffect(() => {
    if (user) {
      fetchClasses(user.uid, 'teacher');
    }
  }, [user, fetchClasses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, { ...formData });
      } else {
        await createClass({
          ...formData,
          teacherId: user.uid,
          createdAt: new Date()
        });
      }
      setIsModalOpen(false);
      setSelectedClass(null);
      setFormData({ name: '', description: '', subject: '', schedule: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (cls) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name,
      description: cls.description,
      subject: cls.subject,
      schedule: cls.schedule
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      await deleteClass(classId);
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
        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
        <button
          onClick={() => {
            setSelectedClass(null);
            setFormData({ name: '', description: '', subject: '', schedule: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FaPlus /> Add New Class
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{cls.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cls)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(cls.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{cls.description}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Subject:</span> {cls.subject}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Schedule:</span> {cls.schedule}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Students:</span> {cls.studentIds?.length || 0}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedClass ? 'Edit Class' : 'Create New Class'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Mon/Wed 10:00 AM - 11:30 AM"
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
                  {selectedClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement; 