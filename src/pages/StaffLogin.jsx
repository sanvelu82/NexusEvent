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
    <div className="split-screen-container">
      {/* Left Panel - Travel Poster */}
      <div className="left-panel">
        <h1 className="brand-title">SVV HI TECH</h1>
        <p className="brand-slogan">
          NEXUS '26 - Annual Day Event Management Portal for authorized staff members
        </p>
        <img 
          className="travel-image" 
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" 
          alt="Staff Portal"
        />
      </div>

      {/* Right Panel - Login Form */}
      <div className="right-panel">
        <div className="login-card">
          <div className="plane-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          
          <h2 className="welcome-title">Welcome</h2>
          <p className="welcome-subtitle">Staff Authentication</p>
          
          <div className="portal-title">🛡️ Staff Portal</div>

          <div className="input-group">
            <label>Username</label>
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="primary-btn" onClick={handleLogin}>
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
    </div>
  );
}