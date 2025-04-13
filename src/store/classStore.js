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
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const useClassStore = create((set, get) => ({
  classes: [],
  assignments: [],
  submissions: [],
  loading: false,
  error: null,

  // Class Management
  fetchClasses: async (userId, role) => {
    try {
      set({ loading: true, error: null });
      const classesRef = collection(db, 'classes');
      const q = role === 'teacher'
        ? query(classesRef, where('teacherId', '==', userId))
        : query(classesRef, where('studentIds', 'array-contains', userId));

      const snapshot = await getDocs(q);
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ classes, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createClass: async (classData) => {
    try {
      set({ loading: true, error: null });
      const docRef = await addDoc(collection(db, 'classes'), {
        ...classData,
        createdAt: serverTimestamp(),
        studentIds: []
      });
      const newClass = { id: docRef.id, ...classData };
      set(state => ({ classes: [...state.classes, newClass], loading: false }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateClass: async (classId, updates) => {
    try {
      set({ loading: true, error: null });
      await updateDoc(doc(db, 'classes', classId), updates);
      set(state => ({
        classes: state.classes.map(c => 
          c.id === classId ? { ...c, ...updates } : c
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteClass: async (classId) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'classes', classId));
      set(state => ({
        classes: state.classes.filter(c => c.id !== classId),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Assignment Management
  fetchAssignments: async (classId) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(db, 'assignments'),
        where('classId', '==', classId)
      );
      const snapshot = await getDocs(q);
      const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ assignments, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createAssignment: async (assignmentData) => {
    try {
      set({ loading: true, error: null });
      const docRef = await addDoc(collection(db, 'assignments'), {
        ...assignmentData,
        createdAt: serverTimestamp()
      });
      const newAssignment = { id: docRef.id, ...assignmentData };
      set(state => ({
        assignments: [...state.assignments, newAssignment],
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Submission Management
  submitAssignment: async (submissionData, file) => {
    try {
      set({ loading: true, error: null });
      let fileUrl = null;

      if (file) {
        const storageRef = ref(storage, `submissions/${file.name}-${Date.now()}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, 'submissions'), {
        ...submissionData,
        fileUrl,
        submittedAt: serverTimestamp()
      });

      const newSubmission = { id: docRef.id, ...submissionData, fileUrl };
      set(state => ({
        submissions: [...state.submissions, newSubmission],
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSubmissions: async (assignmentId) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', assignmentId)
      );
      const snapshot = await getDocs(q);
      const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ submissions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null })
}));

export default useClassStore; 