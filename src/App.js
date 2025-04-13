import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import useAuthStore from './store/authStore';

// Landing Page Components
import Hero from './components/LandingPage/Hero';
import Features from './components/LandingPage/Features';
import Stats from './components/LandingPage/Stats';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ResetPassword from './components/Auth/ResetPassword';

// Dashboard Layout and Components
import DashboardLayout from './components/Dashboard/DashboardLayout';
import TeacherDashboard from './components/Dashboard/Teacher/TeacherDashboard';
import StudentDashboard from './components/Dashboard/Student/StudentDashboard';
import ClassManagement from './components/Dashboard/Teacher/ClassManagement';
import AssignmentManagement from './components/Dashboard/Teacher/AssignmentManagement';
import EnrolledClasses from './components/Dashboard/Student/EnrolledClasses';
import AssignmentSubmission from './components/Dashboard/Student/AssignmentSubmission';
import GradedAssignments from './components/Dashboard/Student/GradedAssignments';
import Settings from './components/Dashboard/Settings';
import StudentSubmission from './components/Dashboard/Student/StudentSubmission';
import SubmissionReview from './components/Dashboard/Teacher/SubmissionReview';

const LandingPage = () => (
  <div>
    <Hero />
    <Features />
    <Stats />
  </div>
);

const App = () => {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        useAuthStore.setState({ user: { ...user, ...userData }, loading: false });
      } else {
        useAuthStore.setState({ user: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/reset-password" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={!user ? <Navigate to="/login" /> : <DashboardLayout />}>
          {/* Common Dashboard Home */}
          <Route index element={user?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />} />
          
          {/* Teacher Routes */}
          <Route path="teacher">
            <Route path="classes" element={user?.role === 'teacher' ? <ClassManagement /> : <Navigate to="/dashboard" />} />
            <Route path="assignments" element={user?.role === 'teacher' ? <AssignmentManagement /> : <Navigate to="/dashboard" />} />
            <Route path="submissions/:assignmentId" element={user?.role === 'teacher' ? <SubmissionReview /> : <Navigate to="/dashboard" />} />
          </Route>
          
          {/* Student Routes */}
          <Route path="student">
            <Route path="classes" element={user?.role === 'student' ? <EnrolledClasses /> : <Navigate to="/dashboard" />} />
            <Route path="assignments" element={user?.role === 'student' ? <AssignmentSubmission /> : <Navigate to="/dashboard" />} />
            <Route path="graded" element={user?.role === 'student' ? <GradedAssignments /> : <Navigate to="/dashboard" />} />
            <Route path="submission/:assignmentId" element={user?.role === 'student' ? <StudentSubmission /> : <Navigate to="/dashboard" />} />
          </Route>
          
          {/* Common Routes */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default App;
