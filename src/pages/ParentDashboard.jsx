import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerPickup, searchPickup } from "../services/api";
import Header from "../components/Header";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [pickupName, setPickupName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("studentData");
    const regNo = localStorage.getItem("regNo");

    if (!data || !regNo) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(data);
    setStudent(parsed);

    if (parsed.registered === "YES") {
      setDisabled(true);
      fetchExistingRegistration(regNo);
    }
  }, [navigate]);

  const fetchExistingRegistration = async (regNo) => {
    Swal.fire({
      title: "Loading...",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await searchPickup(regNo);
      if (res.status === "found") {
        setRegisteredData(res.data[0]);
      }
      Swal.close();
    } catch (err) {
      Swal.close();
    }
  };

  // Compress image if over 2MB
  const compressImage = (file, maxSizeMB = 2, minSizeMB = 1) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Scale down if needed
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with high quality and reduce if needed
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob((blob) => {
              if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
                quality -= 0.1;
                tryCompress();
              } else {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              }
            }, 'image/jpeg', quality);
          };
          tryCompress();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    let fileToUpload = file;

    // Auto-compress if over 2MB
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        title: "Compressing...",
        text: "Optimizing image size",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      fileToUpload = await compressImage(file);
    }

    Swal.fire({
      title: "Uploading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", "nexus_event");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/drsasl2kt/image/upload",
        { method: "POST", body: formData }
      );

      const data = await response.json();
      setPhotoUrl(data.secure_url);
      
      Swal.fire({
        icon: "success",
        title: "Uploaded",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Failed", "Please try again.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!pickupName || !relation || !phone || !photoUrl) {
      return Swal.fire("Incomplete", "Please fill all details and upload a photo.", "warning");
    }

    if (phone.length !== 10) {
      return Swal.fire("Invalid", "Please enter a valid 10-digit phone number.", "warning");
    }

    Swal.fire({
      title: "Registering...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const regNo = localStorage.getItem("regNo");

    try {
      const res = await registerPickup({
        regNo,
        studentName: student.name,
        pickupName,
        relation,
        phone: `+91${phone}`,
        pickupPhoto: photoUrl,
      });

      if (res.status === "success") {
        // Show refined success animation
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Pickup registered successfully",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          // Auto-redirect to home page after success
          localStorage.clear();
          navigate("/");
        });

      } else {
        Swal.fire("Error", "Failed to register. Please try again.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Connection failed.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!student) return null;

  return (
    <div className="dashboard-container">
      <Header 
        title="Pickup Portal" 
        subtitle="Annual Day NEXUS '26" 
        onLogout={handleLogout} 
      />

      <main className="dashboard-main">
        {/* Student Info Card */}
        <div className="result-card">
          <h3 style={{ color: '#00bcd4', marginBottom: '15px', fontSize: '1rem' }}>
            🧑‍🎓 Student Information
          </h3>
          <div className="images-row">
            <div className="image-box">
              <img src={student.photo} alt="Student" />
              <p>Student Photo</p>
            </div>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <label>Name</label>
              <span>{student.name}</span>
            </div>
            <div className="detail-item">
              <label>Class</label>
              <span>{student.class} - {student.section}</span>
            </div>
            <div className="detail-item">
              <label>Reg No</label>
              <span>{localStorage.getItem("regNo")}</span>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <span className={`status-badge ${disabled ? 'status-approved' : 'status-registered'}`}>
                {disabled ? 'Registered' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Conditional: Show Details or Form */}
        {disabled && registeredData ? (
          /* DISPLAY MODE: Show existing pickup details */
          <div className="result-card" style={{ borderLeft: '4px solid #00c853' }}>
            <h3 style={{ color: '#00c853', marginBottom: '15px', fontSize: '1rem' }}>
              ✅ Pickup Person Details
            </h3>
            <div className="images-row">
              <div className="image-box">
                <img 
                  src={registeredData.pickupPhoto} 
                  alt="Pickup Person"
                  style={{ borderColor: '#00c853' }}
                />
                <p>Pickup Person</p>
              </div>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <label>Name</label>
                <span>{registeredData.pickupName}</span>
              </div>
              <div className="detail-item">
                <label>Relation</label>
                <span>{registeredData.relation}</span>
              </div>
              <div className="detail-item">
                <label>Phone</label>
                <span>{registeredData.phone}</span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge ${
                  registeredData.statusPickup === 'APPROVED' ? 'status-approved' : 
                  registeredData.statusPickup === 'PICKED' ? 'status-picked' : 'status-registered'
                }`}>
                  {registeredData.statusPickup}
                </span>
              </div>
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Approved By</label>
                <span>{registeredData.approvedBy || "Waiting for Faculty"}</span>
              </div>
            </div>
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              background: '#e8f5e9', 
              borderRadius: '8px', 
              fontSize: '0.8rem', 
              textAlign: 'center',
              color: '#2e7d32'
            }}>
              Show this screen to gate staff during pickup on 28-02-2026
            </div>
          </div>
        ) : (
          /* INPUT MODE: Registration Form */
          <div className="section">
            <h3 style={{ color: '#00bcd4' }}>👤 Register Pickup Person</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label">Pickup Person Name</label>
                <input 
                  placeholder="Enter full name" 
                  value={pickupName} 
                  onChange={(e) => setPickupName(e.target.value)} 
                />
              </div>

              <div>
                <label className="input-label">Relation to Student</label>
                <select 
                  value={relation} 
                  onChange={(e) => setRelation(e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', border: '1.5px solid #eef0f5', borderRadius: '10px', fontSize: '0.95rem', background: 'white' }}
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunty">Aunty</option>
                  <option value="Grandpa">Grandpa</option>
                  <option value="Grandma">Grandma</option>
                </select>
              </div>

              <div>
                <label className="input-label">Contact Number</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '12px', 
                    background: '#f0f0f0', 
                    borderRadius: '10px',
                    border: '1.5px solid #eef0f5',
                    fontSize: '0.95rem'
                  }}>
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="10-digit number" 
                    value={phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    maxLength={10}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Upload Profile Photo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e.target.files[0])} 
                  style={{ padding: '10px', background: '#f8f9fa' }} 
                />
              </div>

              {photoUrl && (
                <div style={{ textAlign: 'center', padding: '15px' }}>
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '12px', 
                      border: '3px solid #00c853', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <p style={{ color: '#00c853', fontSize: '0.8rem', marginTop: '8px' }}>
                    Photo uploaded ✓
                  </p>
                </div>
              )}

              <button className="success-btn" onClick={handleSubmit} style={{ width: '100%', padding: '14px' }}>
                Confirm Registration
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}