import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/sections/Navbar';
import { Footer } from './components/sections/Footer';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { SelectRole } from './pages/onboarding/SelectRole';
import { CroOnboarding } from './pages/onboarding/CroOnboarding';
import { NurseOnboarding } from './pages/onboarding/NurseOnboarding';
import { DoctorOnboarding } from './pages/onboarding/DoctorOnboarding';
import { CroDashboard } from './pages/dashboard/CroDashboard';
import { NurseDashboard } from './pages/dashboard/NurseDashboard';
import { DoctorDashboard } from './pages/dashboard/DoctorDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter basename="/Clinical-OS-V.1">
      {/* Some pages like dashboards might not need the main landing Navbar, but for simplicity we keep it global or page-specific. 
          Actually, let's keep Navbar inside the Landing page layout, OR conditionally render it. 
          Since it's a root component, we can conditionally hide it on auth/dashboard routes, 
          but making a Layout wrapper is cleaner. We will do a generic visual wrapper here. */}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="min-h-screen bg-slate-50 font-sans selection:bg-sky-200">
            <Navbar />
            <Landing />
            <Footer />
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Onboarding Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/onboarding/cro" element={<CroOnboarding />} />
          <Route path="/onboarding/nurse" element={<NurseOnboarding />} />
          <Route path="/onboarding/doctor" element={<DoctorOnboarding />} />
        </Route>

        {/* Protected Dashboard Routes (Role Specific) */}
        <Route element={<ProtectedRoute requireRole="cro" />}>
          <Route path="/dashboard/cro" element={<CroDashboard />} />
        </Route>
        <Route element={<ProtectedRoute requireRole="nurse" />}>
          <Route path="/dashboard/nurse" element={<NurseDashboard />} />
        </Route>
        <Route element={<ProtectedRoute requireRole="doctor" />}>
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
        </Route>

        {/* Catch-all Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
