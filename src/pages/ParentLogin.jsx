import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { studentLogin } from "../services/api";

export default function ParentLogin() {
  const [regNo, setRegNo] = useState("");
  const [dob, setDob] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 1. Basic Validation
    if (!regNo || !dob) {
      return Swal.fire("Required", "Please enter both Register No and DOB.", "warning");
    }

    // 2. Loading State
    Swal.fire({
      title: "Verifying...",
      text: "Checking your child's record.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await studentLogin(regNo, dob);

      if (res.status === "success") {
        // 3. IMPORTANT: Clear any old session data first
        localStorage.clear();

        // 4. Save new data (Dashboard depends on these specific keys)
        // Ensure the response object 'res' contains the regNo from the backend
        localStorage.setItem("studentData", JSON.stringify(res));
        localStorage.setItem("regNo", regNo); 
        
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          timer: 1500,
          showConfirmButton: false
        }).then(() => navigate("/parent"));
      } else {
        Swal.fire("Access Denied", "Invalid Register No or DOB.", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-top">
        <img 
          src="https://i.ibb.co/qYxNQQPx/Picture2.png" 
          alt="School Logo" 
          className="school-logo"
        />
        <h2 className="school-name">SVV HI TECH School</h2>
        <p className="school-tagline">NEXUS '26 - Annual Day</p>
      </div>

      <div className="login-form-section">
        <h1>Sign in</h1>
        <span className="role-badge">🎓 Parent Portal</span>

        <div className="form-field">
          <label>Register Number</label>
          <div className="input-wrapper">
            <span className="field-icon">📋</span>
            <input
              type="text"
              placeholder="Enter student reg no"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              // Added: trigger login on Enter key
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
            />
          </div>
        </div>

        <div className="form-field">
          <label>Date of Birth</label>
          <div className="input-wrapper">
            <span className="field-icon">📅</span>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              // Added: trigger login on Enter key
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}