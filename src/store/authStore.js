import { create } from 'zustand';
import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  
  signUp: async (email, password, role, fullName) => {
    try {
      set({ loading: true, error: null });
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        fullName,
        createdAt: new Date().toISOString(),
      });
      
      set({ user: { ...user, role, fullName }, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      set({ user: { ...user, ...userData }, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          fullName: user.displayName,
          role: 'student', // Default role
          createdAt: new Date().toISOString(),
        });
      }
      
      const userData = userDoc.exists() ? userDoc.data() : { role: 'student' };
      set({ user: { ...user, ...userData }, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await sendPasswordResetEmail(auth, email);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  signOut: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useAuthStore; 