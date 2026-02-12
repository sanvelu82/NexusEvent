// src/pages/StaffDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Ensure npm install sweetalert2 was successful
import { searchPickup, approvePickup, markPicked } from "../services/api";
import Header from "../components/Header";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [result, setResult] = useState(null);
  const [facultyName, setFacultyName] = useState("");

  useEffect(() => {
    if (localStorage.getItem("staffLogged") !== "true") {
      navigate("/staff-login");
    } else {
      setFacultyName(localStorage.getItem("facultyName") || "Staff Member");
    }
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    // Show Loading Animation until API responds
    Swal.fire({
      title: 'Searching...',
      text: 'Please wait while we fetch pickup details.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Logic to determine if search is by Phone or RegNo
      const res = await searchPickup(searchInput);

      if (res.status === "found") {
        setResult(res);
        Swal.close(); // Close loading animation
      } else {
        setResult(null);
        Swal.fire("Not Found", "❌ No registration found for this input.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  const handleApprove = async () => {
    Swal.showLoading(); // Show loading while processing approval
    const res = await approvePickup(result.regNo || searchInput, facultyName);

    if (res.status === "approved") {
      Swal.fire("Success", "Pickup Approved ✅", "success");
      handleSearch();
    }
  };

  const handleMarkPicked = async () => {
    Swal.showLoading();
    const res = await markPicked(result.regNo || searchInput);

    if (res.status === "picked") {
      // Success animation exactly like previous repo
      Swal.fire("Success", "Student Picked Up Successfully!", "success").then(() => {
        setResult(null);
        setSearchInput("");
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    }).then((swalRes) => {
      if (swalRes.isConfirmed) {
        localStorage.removeItem("staffLogged");
        localStorage.removeItem("facultyName");
        navigate("/staff-login");
      }
    });
  };

  return (
    <div>
      <Header 
        title="Staff Dashboard" 
        subtitle={`Staff: ${facultyName}`} 
        onLogout={handleLogout} 
      />

      <main>
        <div className="section">
          <h3 style={{ color: '#4a90e2' }}>🔍 Pickup Search</h3>
          <p style={{fontSize: '0.85em', color: '#666', marginBottom: '8px'}}>Search by Register Number or Phone Number</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              placeholder="Reg No / Phone Number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button className="primary-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {result && (
          <div className="section">
            <h3 style={{ color: '#4a90e2', textAlign: 'center' }}>Pickup Details</h3>
            
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Displaying Parent/Pickup Person Image */}
              <img 
                src={result.pickupPhoto} 
                style={{ width: '180px', borderRadius: '12px', border: '4px solid #4a90e2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                alt="Pickup Person" 
              />
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <p><strong>Name:</strong> {result.pickupName}</p>
                <p><strong>Relation:</strong> {result.relation}</p>
                <p><strong>Phone:</strong> {result.phone}</p>
                <p><strong>Status:</strong> 
                  <span style={{ 
                    color: result.statusPickup === 'APPROVED' ? '#28a745' : '#007bff',
                    marginLeft: '8px',
                    fontWeight: 'bold'
                  }}>
                    {result.statusPickup}
                  </span>
                </p>
                <p><strong>Approved By:</strong> {result.approvedBy || "—"}</p>
              </div>
            </div>

            <div style={{ marginTop: 25, display: 'flex', gap: 15 }}>
              {result.statusPickup === "REGISTERED" && (
                <button className="success-btn" onClick={handleApprove} style={{ flex: 1, padding: '12px' }}>
                  ✅ Approve Pickup
                </button>
              )}

              {result.statusPickup === "APPROVED" && (
                <button className="primary-btn" onClick={handleMarkPicked} style={{ flex: 1, padding: '12px' }}>
                  📦 Mark as Picked
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}