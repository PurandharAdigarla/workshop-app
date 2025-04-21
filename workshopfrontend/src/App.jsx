import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import AttendeeDashboard from './components/pages/attendee/AttendeeDashboard';
import AttendeeSignup from './components/pages/attendee/AttendeeSignup';
import Login from './components/pages/login/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Attendee Routes */}
        <Route path="/attendee/register" element={<AttendeeSignup />} />
        <Route path="/attendee/signup" element={<AttendeeSignup />} />
        <Route path="/attendee/dashboard" element={<AttendeeDashboard />} />
        
        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
