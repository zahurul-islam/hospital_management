import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Layout Components
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import SocialAuthCallback from './pages/SocialAuthCallback';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientMedicalRecords from './pages/patient/MedicalRecords';
import PatientProfile from './pages/patient/Profile';
import BookAppointment from './pages/patient/BookAppointment';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorProfile from './pages/doctor/Profile';
import CreateDoctorProfile from './pages/doctor/CreateProfile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAppointments from './pages/admin/Appointments';
import AdminMedicalRecords from './pages/admin/MedicalRecords';

// Shared Pages
import AppointmentDetails from './pages/AppointmentDetails';
import VideoCall from './pages/VideoCall';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'patient') {
      return <Navigate to="/patient/dashboard" />;
    } else if (user.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/social-auth-callback" element={<SocialAuthCallback />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<Layout />}>
            {/* Patient Routes */}
            <Route
              path="patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/appointments"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/medical-records"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientMedicalRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/profile"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/book-appointment"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctor/appointments"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctor/patients"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctor/profile"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctor/create-profile"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <CreateDoctorProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/appointments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/medical-records"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMedicalRecords />
                </ProtectedRoute>
              }
            />

            {/* Shared Routes */}
            <Route
              path="appointments/:id"
              element={
                <ProtectedRoute>
                  <AppointmentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="video-call/:id"
              element={
                <ProtectedRoute>
                  <VideoCall />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </AuthProvider>
  );
}

export default App
