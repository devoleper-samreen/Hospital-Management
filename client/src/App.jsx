import { Navigate, Route, Routes } from 'react-router-dom';
import {
  BarChart3,
  CalendarPlus,
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Search,
  Stethoscope,
  Users,
  UserCog,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Contact from './pages/public/Contact';

import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminUsers from './pages/admin/Users';
import AdminPatients from './pages/admin/Patients';
import AdminAppointmentHistory from './pages/admin/AppointmentHistory';
import AdminContactQueries from './pages/admin/ContactQueries';
import AdminSessionLogs from './pages/admin/SessionLogs';
import AdminReports from './pages/admin/Reports';
import AdminPatientSearch from './pages/admin/PatientSearch';
import AdminChangePassword from './pages/admin/ChangePassword';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointmentHistory from './pages/doctor/AppointmentHistory';
import DoctorPatients from './pages/doctor/Patients';
import DoctorSearch from './pages/doctor/Search';
import DoctorProfile from './pages/doctor/Profile';

import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointmentHistory from './pages/patient/AppointmentHistory';
import MedicalHistory from './pages/patient/MedicalHistory';
import PatientProfile from './pages/patient/Profile';

const adminNav = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/patients', label: 'Patients', icon: ClipboardList },
  { to: '/admin/appointments', label: 'Appointment History', icon: CalendarPlus },
  { to: '/admin/queries', label: 'Contact Us Queries', icon: MessageSquare },
  { to: '/admin/session-logs', label: 'Session Logs', icon: FileText },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/search', label: 'Patient Search', icon: Search },
  { to: '/admin/change-password', label: 'Change Password', icon: KeyRound },
];

const doctorNav = [
  { to: '/doctor', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/doctor/appointments', label: 'Appointment History', icon: CalendarPlus },
  { to: '/doctor/patients', label: 'Patients', icon: ClipboardList },
  { to: '/doctor/search', label: 'Search', icon: Search },
  { to: '/doctor/profile', label: 'Profile', icon: UserCog },
];

const patientNav = [
  { to: '/patient', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/patient/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
  { to: '/patient/appointments', label: 'Appointment History', icon: ClipboardList },
  { to: '/patient/medical-history', label: 'Medical History', icon: FileText },
  { to: '/patient/profile', label: 'Profile', icon: UserCog },
];

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout title="Admin Panel" navItems={adminNav} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="appointments" element={<AdminAppointmentHistory />} />
        <Route path="queries" element={<AdminContactQueries />} />
        <Route path="session-logs" element={<AdminSessionLogs />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="search" element={<AdminPatientSearch />} />
        <Route path="change-password" element={<AdminChangePassword />} />
      </Route>

      <Route
        path="/doctor"
        element={
          <ProtectedRoute roles={['doctor']}>
            <DashboardLayout title="Doctor Panel" navItems={doctorNav} />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointmentHistory />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="search" element={<DoctorSearch />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      <Route
        path="/patient"
        element={
          <ProtectedRoute roles={['patient']}>
            <DashboardLayout title="Patient Panel" navItems={patientNav} />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="appointments" element={<PatientAppointmentHistory />} />
        <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
