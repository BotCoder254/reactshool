import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUserPlus, 
  FaUserMinus,
  FaKey,
  FaUsers,
  FaChalkboard,
  FaCopy
} from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const ClassManagement = () => {
  const { user } = useAuthStore();
  const { 
    classes, 
    loading, 
    error, 
    fetchClasses, 
    createClass, 
    updateClass, 
    deleteClass,
    addStudentToClass,
    removeStudentFromClass 
  } = useClassStore();

  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    schedule: '',
    maxStudents: 30
  });
  const [studentEmail, setStudentEmail] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchClasses(user.uid, 'teacher');
    }
  }, [user, fetchClasses]);

  const generateClassCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, { ...formData });
      } else {
        await createClass({
          ...formData,
          teacherId: user.uid,
          teacherName: user.fullName,
          classCode: generateClassCode(),
          createdAt: new Date(),
          studentIds: []
        });
      }
      setIsModalOpen(false);
      setSelectedClass(null);
      setFormData({
        name: '',
        description: '',
        subject: '',
        schedule: '',
        maxStudents: 30
      });
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
      schedule: cls.schedule,
      maxStudents: cls.maxStudents || 30
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      await deleteClass(classId);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (selectedClass && studentEmail) {
      try {
        await addStudentToClass(selectedClass.id, studentEmail);
        setStudentEmail('');
      } catch (error) {
        console.error('Error adding student:', error);
      }
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      await removeStudentFromClass(classId, studentId);
    }
  };

  const copyClassCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const filteredClasses = classes.filter(cls => {
    switch (activeTab) {
      case 'active':
        return cls.studentIds?.length > 0;
      case 'empty':
        return !cls.studentIds?.length;
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
        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
        <button
          onClick={() => {
            setSelectedClass(null);
            setFormData({
              name: '',
              description: '',
              subject: '',
              schedule: '',
              maxStudents: 30
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          <FaPlus /> Create Class
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
          Active Classes
        </button>
        <button
          onClick={() => setActiveTab('empty')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'empty'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          Empty Classes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
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
                  onClick={() => {
                    setSelectedClass(cls);
                    setIsStudentModalOpen(true);
                  }}
                  className="p-2 text-primary hover:bg-primary/10 rounded-full"
                  title="Manage Students"
                >
                  <FaUsers />
                </button>
                <button
                  onClick={() => handleEdit(cls)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Edit Class"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(cls.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete Class"
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
                <span className="font-medium">Students:</span>{' '}
                {cls.studentIds?.length || 0} / {cls.maxStudents}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Class Code:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">{cls.classCode}</code>
                <button
                  onClick={() => copyClassCode(cls.classCode)}
                  className="text-primary hover:text-secondary"
                  title="Copy Class Code"
                >
                  <FaCopy />
                </button>
                {copySuccess && <span className="text-green-500 text-xs">{copySuccess}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <img
            src="https://illustrations.popsy.co/white/teaching.svg"
            alt="No classes"
            className="w-48 h-48 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Classes Found
          </h2>
          <p className="text-gray-600">
            Create your first class to get started.
          </p>
        </div>
      )}

      {/* Class Creation/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Students
                  </label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    min="1"
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
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                  >
                    {selectedClass ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Management Modal */}
      <AnimatePresence>
        {isStudentModalOpen && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Manage Students - {selectedClass.name}
                </h2>
                <button
                  onClick={() => setIsStudentModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="Enter student email"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center gap-2"
                  >
                    <FaUserPlus /> Add
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedClass.students?.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(selectedClass.id, student.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove Student"
                    >
                      <FaUserMinus />
                    </button>
                  </div>
                ))}
              </div>

              {(!selectedClass.students || selectedClass.students.length === 0) && (
                <p className="text-center text-gray-600 py-4">
                  No students enrolled yet
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassManagement; 