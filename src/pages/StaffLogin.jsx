import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { staffLogin } from "../services/api";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (localStorage.getItem("staffLogged") === "true") {
      navigate("/staff-dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      return Swal.fire("Required", "Please enter both Username and Password.", "warning");
    }

    Swal.fire({
      title: "Authenticating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await staffLogin(username, password);

      if (res.status === "success") {
        localStorage.setItem("staffLogged", "true");
        localStorage.setItem("facultyName", res.faculty);
        
        Swal.fire({
          icon: "success",
          title: "Staff Login Successful",
          timer: 1500,
          showConfirmButton: false
        }).then(() => navigate("/staff-dashboard"));
      } else {
        Swal.fire("Login Failed", "Invalid Credentials.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  return (
    <div className="login-container staff-login">
      {/* Top Decorative Section with Logo */}
      <div className="login-top">
        <img 
          src="https://i.ibb.co/qYxNQQPx/Picture2.png" 
          alt="School Logo" 
          className="school-logo"
        />
        <h2 className="school-name">SVV HI TECH School</h2>
        <p className="school-tagline">NEXUS '26 - Staff Portal</p>
      </div>

      {/* Form Section */}
      <div className="login-form-section">
        <h1>Sign in</h1>
        <span className="role-badge staff">🛡️ Staff Portal</span>

        <div className="form-field">
          <label>Username</label>
          <div className="input-wrapper">
            <span className="field-icon">👤</span>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label>Password</label>
          <div className="input-wrapper">
            <span className="field-icon">🔒</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          color: '#888', 
          fontSize: '0.75rem' 
        }}>
          Authorized access only. All activities are monitored.
        </p>
      </div>
    </div>
  );
}