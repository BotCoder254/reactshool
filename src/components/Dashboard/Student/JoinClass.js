import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaKey } from 'react-icons/fa';
import useClassStore from '../../../store/classStore';
import useAuthStore from '../../../store/authStore';

const JoinClass = ({ onClose }) => {
  const [classCode, setClassCode] = useState('');
  const { joinClassByCode, loading, error, clearError } = useClassStore();
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await joinClassByCode(classCode.toUpperCase(), user.uid);
      onClose();
    } catch (error) {
      console.error('Error joining class:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Join a Class</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
          {error}
          <button
            onClick={clearError}
            className="float-right text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Code
          </label>
          <div className="relative">
            <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter 6-digit class code"
              maxLength={6}
              pattern="[A-Z0-9]{6}"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter the 6-digit code provided by your teacher
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || classCode.length !== 6}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Class'}
        </button>
      </form>
    </motion.div>
  );
};

export default JoinClass; 