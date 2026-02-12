import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { staffLogin } from "../services/api";
import Header from "../components/Header";

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
        Swal.fire("Login Failed", "❌ Invalid Credentials.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  return (
    <div className="mobile-container">
      <Header title="Staff Login" subtitle="NEXUS '26 - Event Portal" />
      
      <main>
        <div className="section">
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>🛡️ Staff Portal</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Username</label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="primary-btn" onClick={handleLogin} style={{ marginTop: "10px" }}>
              Staff Login
            </button>
          </div>
        </div>

        <p className="text-center" style={{ marginTop: "20px", color: "#888", fontSize: "0.8rem" }}>
          Authorized access only. All activities are monitored.
        </p>
      </main>
    </div>
  );
}