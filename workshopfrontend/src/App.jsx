import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/pages/admin/AdminLogin';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import AttendeeLogin from './components/pages/attendee/AttendeeLogin';
import AttendeeDashboard from './components/pages/attendee/AttendeeDashboard';
import AttendeeSignup from './components/pages/attendee/AttendeeSignup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Attendee Routes */}
        <Route path="/attendee/login" element={<AttendeeLogin />} />
        <Route path="/attendee/register" element={<AttendeeSignup />} />
        <Route path="/attendee/dashboard" element={<AttendeeDashboard />} />
        <Route path="/" element={<AttendeeLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
