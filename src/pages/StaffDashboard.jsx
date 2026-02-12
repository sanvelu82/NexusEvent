import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Html5QrcodeScanner } from "html5-qrcode";
import { searchPickup, approvePickup, markPicked } from "../services/api";
import Header from "../components/Header";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]); // Stores multiple students
  const [facultyName, setFacultyName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Synchronized check for /staff-login
    if (localStorage.getItem("staffLogged") !== "true") {
      navigate("/staff-login");
    } else {
      setFacultyName(localStorage.getItem("facultyName") || "Staff Member");
    }
  }, [navigate]);

  const toggleScanner = () => {
    if (!isScanning) {
      setIsScanning(true);
      setTimeout(() => {
        const newScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
        newScanner.render((text) => {
          setSearchInput(text);
          handleSearch(text);
          newScanner.clear();
          setIsScanning(false);
        });
        setScanner(newScanner);
      }, 300);
    } else {
      if (scanner) scanner.clear();
      setIsScanning(false);
    }
  };

  const handleSearch = async (query = searchInput) => {
    if (!query.trim()) return;

    Swal.fire({
      title: "Searching...",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await searchPickup(query);
      if (res.status === "found") {
        setResults(res.data); // Apps Script returns an array in 'data'
        Swal.close();
      } else {
        setResults([]);
        Swal.fire("Not Found", "❌ No registration found.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  const handleApprove = async (regNo) => {
    Swal.showLoading();
    const res = await approvePickup(regNo, facultyName);
    if (res.status === "approved") {
      Swal.fire("Success", "Pickup Approved ✅", "success");
      handleSearch(); 
    }
  };

  const handleMarkPicked = async (regNo) => {
    Swal.showLoading();
    const res = await markPicked(regNo);
    if (res.status === "picked") {
      Swal.fire("Success", "Student Picked Up Successfully!", "success");
      handleSearch();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff-login");
  };

  return (
    <div className="mobile-container">
      <Header title="Staff Dashboard" subtitle={`Staff: ${facultyName}`} onLogout={handleLogout} />

      <main>
        <div className="section">
          <h3 style={{ color: "#4a90e2" }}>🔍 Pickup Search</h3>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              placeholder="Reg No / Phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button className="primary-btn" onClick={() => handleSearch()}>Search</button>
          </div>

          <button 
            className="secondary-btn" 
            onClick={toggleScanner}
            style={{ width: "100%", background: isScanning ? "#dc3545" : "#6c757d", color: "white" }}
          >
            {isScanning ? "Close Scanner" : "📷 Scan QR Code"}
          </button>
          {isScanning && <div id="reader" style={{ marginTop: "15px" }}></div>}
        </div>

        {results.length > 0 && (
          <div className="results-container">
            <h3 className="text-center" style={{ color: "#4a90e2", margin: "15px 0" }}>
              {results.length} Student(s) Found
            </h3>
            
            {results.map((student, index) => (
              <div key={index} className="student-card section">
                <div className="card-header">
                   <img src={student.pickupPhoto} className="pickup-avatar" alt="Pickup" />
                   <div className="badge" style={{ background: student.statusPickup === "APPROVED" ? "#28a745" : "#007bff" }}>
                     {student.statusPickup}
                   </div>
                </div>
                <div className="card-body">
                  <p><strong>Student:</strong> {student.studentName}</p>
                  <p><strong>Pickup:</strong> {student.pickupName}</p>
                  <p><strong>Relation:</strong> {student.relation}</p>
                  <p><strong>Approved By:</strong> {student.approvedBy || "—"}</p>
                </div>
                <div className="card-footer">
                  {student.statusPickup === "REGISTERED" && (
                    <button className="success-btn" onClick={() => handleApprove(student.regNo)}>✅ Approve</button>
                  )}
                  {student.statusPickup === "APPROVED" && (
                    <button className="primary-btn" onClick={() => handleMarkPicked(student.regNo)}>📦 Mark Picked</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}