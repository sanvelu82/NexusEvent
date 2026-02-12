import { BrowserRouter, Routes, Route } from "react-router-dom";
import ParentLogin from "./pages/ParentLogin";
import ParentDashboard from "./pages/ParentDashboard";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ParentLogin />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff" element={<StaffDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
