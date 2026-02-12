import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { studentLogin } from "../services/api";

export default function ParentLogin() {
  const [regNo, setRegNo] = useState("");
  const [dob, setDob] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!regNo || !dob) {
      return Swal.fire("Required", "Please enter both Register No and DOB.", "warning");
    }

    Swal.fire({
      title: "Verifying...",
      text: "Checking your child's record.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await studentLogin(regNo, dob);

      if (res.status === "success") {
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
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  return (
    <div className="split-screen-container">
      {/* Left Panel - Travel Poster */}
      <div className="left-panel">
        <h1 className="brand-title">SVV HI TECH</h1>
        <p className="brand-slogan">
          Nurturing young minds with excellence in education and holistic development
        </p>
        <img 
          className="travel-image" 
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800" 
          alt="School Event"
        />
      </div>

      {/* Right Panel - Login Form */}
      <div className="right-panel">
        <div className="login-card">
          <div className="plane-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          
          <h2 className="welcome-title">Welcome</h2>
          <p className="welcome-subtitle">Login with your credentials</p>
          
          <div className="portal-title">🎓 Parent Portal</div>

          <div className="input-group">
            <label>Register Number</label>
            <span className="input-icon">📋</span>
            <input
              type="text"
              placeholder="Enter student reg no"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Date of Birth</label>
            <span className="input-icon">📅</span>
            <input
              type="text"
              placeholder="DD-MM-YYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <button className="primary-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}