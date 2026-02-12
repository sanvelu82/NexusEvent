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
    <div className="login-container">
      {/* Top Decorative Section with Logo */}
      <div className="login-top">
        <img 
          src="https://i.ibb.co/qYxNQQPx/Picture2.png" 
          alt="School Logo" 
          className="school-logo"
        />
        <h2 className="school-name">SVV HI TECH School</h2>
        <p className="school-tagline">NEXUS '26 - Annual Day</p>
      </div>

      {/* Form Section */}
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
            />
          </div>
        </div>

        <div className="form-field">
          <label>Date of Birth</label>
          <div className="input-wrapper">
            <span className="field-icon">📅</span>
            <input
              type="text"
              placeholder="DD-MM-YYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
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