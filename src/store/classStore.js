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
      const classesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch students for each class if teacher
      if (role === 'teacher') {
        const classesWithStudents = await Promise.all(
          classesData.map(async (cls) => {
            if (!cls.studentIds?.length) return { ...cls, students: [] };

            const studentsData = await Promise.all(
              cls.studentIds.map(async (studentId) => {
                const studentDoc = await getDoc(doc(db, 'users', studentId));
                return { id: studentId, ...studentDoc.data() };
              })
            );

            return { ...cls, students: studentsData };
          })
        );

        set({ classes: classesWithStudents, loading: false });
      } else {
        set({ classes: classesData, loading: false });
      }
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
        studentIds: [],
        assignments: []
      });
      const newClass = { id: docRef.id, ...classData };
      set(state => ({ classes: [...state.classes, newClass], loading: false }));
      return newClass;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
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
      throw error;
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
      throw error;
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
      
      // Find class by code
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('classCode', '==', classCode));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Invalid class code');
      }

      const classDoc = snapshot.docs[0];
      const classData = classDoc.data();

      // Check if student is already enrolled
      if (classData.studentIds?.includes(studentId)) {
        throw new Error('You are already enrolled in this class');
      }

      // Check if class is full
      if (classData.studentIds?.length >= classData.maxStudents) {
        throw new Error('Class is full');
      }

      // Add student to class
      await updateDoc(doc(db, 'classes', classDoc.id), {
        studentIds: arrayUnion(studentId)
      });

      // Update local state
      const updatedClass = { id: classDoc.id, ...classData, studentIds: [...(classData.studentIds || []), studentId] };
      set(state => ({
        classes: [...state.classes, updatedClass],
        loading: false
      }));

      return updatedClass;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
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