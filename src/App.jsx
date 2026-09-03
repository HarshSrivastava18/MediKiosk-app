import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './portals/Landing'
import Login from './portals/Login'

// Registration Wizards
import PatientRegistration from './portals/patient/pages/PatientRegistration'
import HospitalRegistration from './portals/hospital/pages/HospitalRegistration'

// Patient Portal
import PatientLayout from './portals/patient/PatientLayout'
import PatientDashboard from './portals/patient/pages/Dashboard'
import MyCase from './portals/patient/pages/MyCase'
import HealthRecords from './portals/patient/pages/HealthRecords'
import Documents from './portals/patient/pages/Documents'
import HospitalVisits from './portals/patient/pages/HospitalVisits'
import ConsentSharing from './portals/patient/pages/ConsentSharing'
import Prescriptions from './portals/patient/pages/Prescriptions'
import LabReports from './portals/patient/pages/LabReports'
import PatientProfile from './portals/patient/pages/Profile'

// Doctor Portal
import DoctorLayout from './portals/doctor/DoctorLayout'
import DoctorDashboard from './portals/doctor/pages/Dashboard'
import PatientCase from './portals/doctor/pages/PatientCase'
import Referrals from './portals/doctor/pages/Referrals'
import DoctorAnalytics from './portals/doctor/pages/Analytics'
import Messages from './portals/doctor/pages/Messages'

// Hospital Admin Portal
import HospitalLayout from './portals/hospital/HospitalLayout'
import HospitalDashboard from './portals/hospital/pages/Dashboard'
import Branches from './portals/hospital/pages/Branches'
import Departments from './portals/hospital/pages/Departments'
import Doctors from './portals/hospital/pages/Doctors'
import Staff from './portals/hospital/pages/Staff'
import Reception from './portals/hospital/pages/Reception'
import HospitalReports from './portals/hospital/pages/Reports'
import HospitalSettings from './portals/hospital/pages/Settings'

// Super Admin Portal
import SuperAdminLayout from './portals/superadmin/SuperAdminLayout'
import SuperDashboard from './portals/superadmin/pages/Dashboard'
import Hospitals from './portals/superadmin/pages/Hospitals'
import Verification from './portals/superadmin/pages/Verification'
import AdminUsers from './portals/superadmin/pages/Users'
import AuditLogs from './portals/superadmin/pages/AuditLogs'
import AdminAnalytics from './portals/superadmin/pages/Analytics'
import AdminSettings from './portals/superadmin/pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Global Registration Flows */}
          <Route path="/patient/register" element={<PatientRegistration />} />
          <Route path="/register/patient" element={<PatientRegistration />} />
          <Route path="/hospital/register" element={<HospitalRegistration />} />
          <Route path="/register/hospital" element={<HospitalRegistration />} />

          {/* Patient Portal */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PatientDashboard />} />
            <Route path="my-case" element={<MyCase />} />
            <Route path="health-records" element={<HealthRecords />} />
            <Route path="documents" element={<Documents />} />
            <Route path="hospital-visits" element={<HospitalVisits />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="lab-reports" element={<LabReports />} />
            <Route path="consent" element={<ConsentSharing />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>

          {/* Doctor Portal */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="patient/:id" element={<PatientCase />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="analytics" element={<DoctorAnalytics />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* Hospital Admin Portal */}
          <Route
            path="/hospital"
            element={
              <ProtectedRoute requiredRole="hospital">
                <HospitalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HospitalDashboard />} />
            <Route path="branches" element={<Branches />} />
            <Route path="departments" element={<Departments />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="staff" element={<Staff />} />
            <Route path="reception" element={<Reception />} />
            <Route path="reports" element={<HospitalReports />} />
            <Route path="settings" element={<HospitalSettings />} />
          </Route>

          {/* Super Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperDashboard />} />
            <Route path="hospitals" element={<Hospitals />} />
            <Route path="verification" element={<Verification />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
