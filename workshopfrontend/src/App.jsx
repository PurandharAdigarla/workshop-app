import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./components/pages/admin/AdminLogin";
import AdminDashboard from "./components/pages/admin/AdminDashboard";
import AttendeeLogin from "./components/pages/attendee/AttendeeLogin";
import AttendeeDashboard from "./components/pages/attendee/AttendeeDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Attendee Routes */}
    <Route path="/attendee/login" element={<AttendeeLogin />} />
        <Route path="/attendee/dashboard" element={<AttendeeDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
