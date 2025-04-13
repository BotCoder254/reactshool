import { create } from 'zustand';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const formatDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return null;
};

const useClassStore = create((set, get) => ({
  classes: [],
  assignments: [],
  submissions: [],
  loading: false,
  error: null,

  // File Upload
  uploadFile: async (file, onProgress) => {
    try {
      // Check file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }

      const storageRef = ref(storage, `assignments/${file.name}-${Date.now()}`);
      
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytes(storageRef, file);

        // Handle the upload completion
        uploadTask
          .then(async (snapshot) => {
            // Clear any existing progress simulation
            if (window.progressInterval) {
              clearInterval(window.progressInterval);
            }
            // Set progress to 100% immediately upon completion
            if (onProgress) {
              onProgress(100);
            }
            const downloadURL = await getDownloadURL(snapshot.ref);
            resolve(downloadURL);
          })
          .catch((error) => {
            // Clear progress simulation on error
            if (window.progressInterval) {
              clearInterval(window.progressInterval);
            }
            console.error('Error uploading file:', error);
            reject(error);
          });

        // Improved progress simulation
        if (onProgress) {
          let progress = 0;
          const simulateProgress = () => {
            if (progress < 98) {
              // Slower progress as we get closer to 98%
              const increment = Math.max(1, (98 - progress) / 10);
              progress += increment;
              onProgress(Math.min(98, progress));
            }
          };

          // Clear any existing interval
          if (window.progressInterval) {
            clearInterval(window.progressInterval);
          }

          // Start new progress simulation
          window.progressInterval = setInterval(simulateProgress, 200);
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Class Management
  fetchClasses: async (userId, role) => {
    try {
      set({ loading: true, error: null });
      const classesRef = collection(db, 'classes');
      let q;

      if (role === 'teacher') {
        q = query(classesRef, where('teacherId', '==', userId));
      } else {
        q = query(classesRef, where('studentIds', 'array-contains', userId));
      }

      const querySnapshot = await getDocs(q);
      const classesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      set({ classes: classesData, loading: false });
    } catch (error) {
      console.error('Error fetching classes:', error);
      set({ error: error.message, loading: false });
    }
  },

  createClass: async (classData) => {
    try {
      set({ loading: true, error: null });
      const docRef = await addDoc(collection(db, 'classes'), {
        ...classData,
        createdAt: serverTimestamp(),
        studentIds: [],
      });
      
      set(state => ({
        classes: [...state.classes, { id: docRef.id, ...classData }],
        loading: false
      }));
    } catch (error) {
      console.error('Error creating class:', error);
      set({ error: error.message, loading: false });
    }
  },

  updateClass: async (classId, updates) => {
    try {
      set({ loading: true, error: null });
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, updates);
      
      set(state => ({
        classes: state.classes.map(cls => 
          cls.id === classId ? { ...cls, ...updates } : cls
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating class:', error);
      set({ error: error.message, loading: false });
    }
  },

  deleteClass: async (classId) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'classes', classId));
      
      set(state => ({
        classes: state.classes.filter(cls => cls.id !== classId),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting class:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Student Management
  addStudentToClass: async (classId, studentEmail) => {
    try {
      set({ loading: true, error: null });
      
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', studentEmail));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('No user found with this email');
      }

      const studentDoc = snapshot.docs[0];
      const studentId = studentDoc.id;
      const studentData = studentDoc.data();

      // Check if student is already in class
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      const classData = classDoc.data();

      if (classData.studentIds?.includes(studentId)) {
        throw new Error('Student is already enrolled in this class');
      }

      // Check if class is full
      if (classData.studentIds?.length >= classData.maxStudents) {
        throw new Error('Class is full');
      }

      // Add student to class
      await updateDoc(classRef, {
        studentIds: arrayUnion(studentId)
      });

      // Update local state
      set(state => ({
        classes: state.classes.map(c => {
          if (c.id === classId) {
            const updatedStudents = [...(c.students || []), { id: studentId, ...studentData }];
            const updatedStudentIds = [...(c.studentIds || []), studentId];
            return { ...c, students: updatedStudents, studentIds: updatedStudentIds };
          }
          return c;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  removeStudentFromClass: async (classId, studentId) => {
    try {
      set({ loading: true, error: null });
      
      await updateDoc(doc(db, 'classes', classId), {
        studentIds: arrayRemove(studentId)
      });

      set(state => ({
        classes: state.classes.map(c => {
          if (c.id === classId) {
            return {
              ...c,
              students: c.students?.filter(s => s.id !== studentId) || [],
              studentIds: c.studentIds?.filter(id => id !== studentId) || []
            };
          }
          return c;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Class Code Management
  joinClassByCode: async (classCode, studentId) => {
    try {
      set({ loading: true, error: null });
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('classCode', '==', classCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid class code');
      }

      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data();

      if (classData.studentIds?.includes(studentId)) {
        throw new Error('You are already enrolled in this class');
      }

      const updatedStudentIds = [...(classData.studentIds || []), studentId];
      await updateDoc(doc(db, 'classes', classDoc.id), {
        studentIds: updatedStudentIds
      });

      set(state => ({
        classes: [...state.classes, { id: classDoc.id, ...classData }],
        loading: false
      }));
    } catch (error) {
      console.error('Error joining class:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Assignment Management
  fetchAssignments: async (userId, role) => {
    try {
      set({ loading: true, error: null });

      // Early return if user is not logged in
      if (!userId || !role) {
        set({ 
          assignments: [],
          loading: false
        });
        return;
      }

      const assignmentsRef = collection(db, 'assignments');
      let q;

      if (role === 'teacher') {
        q = query(assignmentsRef, where('teacherId', '==', userId));
      } else if (role === 'student') {
        // First get the student's classes
        const classesRef = collection(db, 'classes');
        const classesQuery = query(classesRef, where('studentIds', 'array-contains', userId));
        const classesSnapshot = await getDocs(classesQuery);
        
        if (classesSnapshot.empty) {
          set({ assignments: [], loading: false });
          return;
        }

        const classIds = classesSnapshot.docs.map(doc => doc.id);
        q = query(assignmentsRef, where('classId', 'in', classIds));
      } else {
        set({ assignments: [], loading: false });
        return;
      }

      const querySnapshot = await getDocs(q);
      const assignmentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamps to JavaScript Dates
        const dueDate = data.dueDate ? new Date(data.dueDate.seconds * 1000) : null;
        const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : null;
        const submittedAt = data.submittedAt ? new Date(data.submittedAt.seconds * 1000) : null;

        return {
          id: doc.id,
          ...data,
          dueDate,
          createdAt,
          submittedAt,
          attachments: data.attachments || [],
          submissions: data.submissions || []
        };
      });

      set({ assignments: assignmentsData, loading: false });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      set({ 
        error: error.message || 'Error fetching assignments', 
        loading: false,
        assignments: []
      });
    }
  },

  createAssignment: async (assignmentData, files) => {
    try {
      set({ loading: true, error: null });
      const uploadedFiles = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const storageRef = ref(storage, `assignments/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          uploadedFiles.push({ name: file.name, url });
        }
      }

      // Convert dueDate to Timestamp if it's a Date
      const dueDateTimestamp = assignmentData.dueDate instanceof Date 
        ? Timestamp.fromDate(assignmentData.dueDate)
        : assignmentData.dueDate;

      const docRef = await addDoc(collection(db, 'assignments'), {
        ...assignmentData,
        dueDate: dueDateTimestamp,
        files: uploadedFiles,
        createdAt: serverTimestamp(),
      });

      set(state => ({
        assignments: [...state.assignments, { 
          id: docRef.id, 
          ...assignmentData,
          dueDate: assignmentData.dueDate,
          files: uploadedFiles 
        }],
        loading: false
      }));
    } catch (error) {
      console.error('Error creating assignment:', error);
      set({ error: error.message, loading: false });
    }
  },

  updateAssignment: async (assignmentId, data) => {
    try {
      set({ loading: true, error: null });
      await updateDoc(doc(db, 'assignments', assignmentId), data);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'assignments', assignmentId));
      const assignments = get().assignments.filter(a => a.id !== assignmentId);
      set({ assignments, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Submission Management
  submitAssignment: async (assignmentId, submission) => {
    try {
      set({ loading: true, error: null });
      
      // Create a new submission document instead of updating
      const submissionRef = await addDoc(collection(db, 'submissions'), {
        assignmentId,
        ...submission,
        submittedAt: serverTimestamp()
      });

      set(state => ({
        assignments: state.assignments.map(assignment =>
          assignment.id === assignmentId
            ? { ...assignment, submitted: true }
            : assignment
        ),
        loading: false
      }));

      return submissionRef.id;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSubmissions: async (assignmentId) => {
    try {
      set({ loading: true, error: null });
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, where('assignmentId', '==', assignmentId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  clearError: () => set({ error: null })
}));

export default useClassStore; 