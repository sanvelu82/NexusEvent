import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Html5Qrcode } from "html5-qrcode";
import { searchPickup, approvePickup, markPicked } from "../services/api";
import Header from "../components/Header";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [facultyName, setFacultyName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("staffLogged") !== "true") {
      navigate("/staff-login");
    } else {
      setFacultyName(localStorage.getItem("facultyName") || "Staff Member");
    }

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [navigate]);

  const startScanner = async () => {
    if (isScanning) {
      // Stop scanner
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
      setIsScanning(false);
      return;
    }

    // First, request camera permission explicitly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (permissionError) {
      Swal.fire({
        icon: "warning",
        title: "Camera Permission Required",
        text: "Please allow camera access to scan QR codes.",
        confirmButtonText: "OK"
      });
      return;
    }

    setIsScanning(true);
    
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setSearchInput(decodedText);
          handleSearch(decodedText);
          html5QrCode.stop();
          scannerRef.current = null;
          setIsScanning(false);
        },
        () => {} // Ignore errors during scanning
      );
    } catch (err) {
      Swal.fire("Camera Error", "Could not start camera. Please try again.", "error");
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
        setResults(res.data);
        Swal.close();
      } else {
        setResults([]);
        Swal.fire("Not Found", "No registration found.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not connect to the server.", "error");
    }
  };

  const handleApprove = async (regNo) => {
    Swal.showLoading();
    const res = await approvePickup(regNo, facultyName);
    if (res.status === "approved") {
      Swal.fire({
        icon: "success",
        title: "Approved",
        timer: 1500,
        showConfirmButton: false
      });
      handleSearch();
    }
  };

  const handleMarkPicked = async (regNo) => {
    Swal.showLoading();
    const res = await markPicked(regNo);
    if (res.status === "picked") {
      Swal.fire({
        icon: "success",
        title: "Picked Up",
        timer: 1500,
        showConfirmButton: false
      });
      handleSearch();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff-login");
  };

  // QR Icon SVG (GPay-style)
  const QRIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 0h1v2h-2v-1h1v-1zm-2-2h2v1h-1v1h-1v-2zm2 4h2v2h-1v-1h-1v-1zm-2 2h1v2h-2v-2h1zm2 0h2v1h-2v-1zm1-4h1v1h-1v-1zm-11-8h2v2H8V5zm4 0h2v2h-2V5zm-4 4h2v2H8V9zm4 0h2v2h-2V9z"/>
    </svg>
  );

  return (
    <div className="dashboard-container">
      <Header 
        title="Staff Dashboard" 
        subtitle={`Staff: ${facultyName}`} 
        onLogout={handleLogout} 
      />

      <main className="dashboard-main">
        {/* Search Section */}
        <div className="section">
          <h3>🔍 Pickup Search</h3>
          
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <input
                placeholder="Reg No / Phone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="qr-icon-btn" onClick={startScanner} title="Scan QR Code">
                <QRIcon />
              </button>
            </div>
            <button className="primary-btn" onClick={() => handleSearch()} style={{ width: 'auto', padding: '14px 20px' }}>
              Search
            </button>
          </div>

          {isScanning && (
            <div style={{ marginTop: '15px' }}>
              <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
              <button 
                className="secondary-btn" 
                onClick={startScanner}
                style={{ width: '100%', marginTop: '10px', background: '#e74c3c', color: 'white', border: 'none' }}
              >
                Close Scanner
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <p style={{ textAlign: 'center', color: '#00bcd4', fontWeight: '600', margin: '15px 0' }}>
              {results.length} Student(s) Found
            </p>
            
            {results.map((student, index) => (
              <div key={index} className="result-card">
                {/* Images Row - Student & Pickup */}
                <div className="images-row">
                  <div className="image-box">
                    <img src={student.studentPhoto || student.photo || 'https://via.placeholder.com/90'} alt="Student" />
                    <p>Student</p>
                  </div>
                  <div className="image-box">
                    <img 
                      src={student.pickupPhoto} 
                      alt="Pickup Person"
                      style={{ borderColor: student.statusPickup === 'APPROVED' ? '#00c853' : '#00bcd4' }}
                    />
                    <p>Pickup Person</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Student Name</label>
                    <span>{student.studentName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Class</label>
                    <span>{student.class || '-'} {student.section || ''}</span>
                  </div>
                  <div className="detail-item">
                    <label>Reg No</label>
                    <span>{student.regNo}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pickup Name</label>
                    <span>{student.pickupName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Relation</label>
                    <span>{student.relation}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{student.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge ${
                      student.statusPickup === 'APPROVED' ? 'status-approved' : 
                      student.statusPickup === 'PICKED' ? 'status-picked' : 'status-registered'
                    }`}>
                      {student.statusPickup}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Approved By</label>
                    <span>{student.approvedBy || '—'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="actions">
                  {student.statusPickup === "REGISTERED" && (
                    <button className="success-btn" onClick={() => handleApprove(student.regNo)}>
                      ✓ Approve
                    </button>
                  )}
                  {student.statusPickup === "APPROVED" && (
                    <button className="primary-btn" onClick={() => handleMarkPicked(student.regNo)}>
                      📦 Mark Picked
                    </button>
                  )}
                  {student.statusPickup === "PICKED" && (
                    <button className="secondary-btn" disabled style={{ opacity: 0.6 }}>
                      Completed
                    </button>
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