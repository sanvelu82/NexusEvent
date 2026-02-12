import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { studentLogin } from "../services/api";
import Header from "../components/Header";

export default function ParentLogin() {
  const [regNo, setRegNo] = useState("");
  const [dob, setDob] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!regNo || !dob) {
      return Swal.fire("Required", "Please enter both Register No and DOB.", "warning");
    }

    // Show Loading Animation
    Swal.fire({
      title: "Verifying...",
      text: "Please wait while we check your child's record.",
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
        }).then(() => navigate("/parent-dashboard"));
      } else {
        Swal.fire("Access Denied", "❌ Invalid Register No or DOB.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  return (
    <div className="mobile-container">
      <Header title="Parent Login" subtitle="SRI VINAYAGA VIDYALAYA SCHOOL" />
      
      <main>
        <div className="section">
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>🔐 Parent Portal</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Register Number</label>
            <input
              placeholder="Enter student reg no"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />

            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Date of Birth</label>
            <input
              placeholder="DD-MM-YYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <button className="primary-btn" onClick={handleLogin} style={{ marginTop: "10px" }}>
              Login
            </button>
          </div>
        </div>

        <p className="text-center" style={{ marginTop: "20px", color: "#888", fontSize: "0.8rem" }}>
          Please use the credentials provided by the school.
        </p>
      </main>
    </div>
  );
}