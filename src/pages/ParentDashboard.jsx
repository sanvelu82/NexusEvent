import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerPickup } from "../services/api";
import Header from "../components/Header";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [pickupName, setPickupName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("studentData");

    if (!data) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(data);
    setStudent(parsed);

    if (parsed.registered === "YES") {
      setDisabled(true);
      Swal.fire({
        icon: "info",
        title: "Already Registered",
        text: "Pickup is already registered for this student.",
        confirmButtonColor: "#007bff",
      });
    }
  }, [navigate]);

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Max size 2MB check
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Image must be less than 2MB", "error");
      return;
    }

    // Show Loading Animation for Upload
    Swal.fire({
      title: "Uploading Photo...",
      text: "Please wait while we process the image.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nexus_event");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/drsasl2kt/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setPhotoUrl(data.secure_url);
      
      Swal.fire({
        icon: "success",
        title: "Photo Uploaded",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      Swal.fire("Upload Failed", "Failed to upload image. Please try again.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!pickupName || !relation || !phone || !photoUrl) {
      return Swal.fire("Incomplete Info", "Please fill all details and upload a photo.", "warning");
    }

    const regNo = localStorage.getItem("regNo");

    // Show Loading for Registration
    Swal.fire({
      title: "Registering Pickup...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await registerPickup({
        regNo,
        studentName: student.name,
        pickupName,
        relation,
        phone,
        pickupPhoto: photoUrl,
      });

      if (res.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Pickup Registered Successfully ✅",
          confirmButtonColor: "#28a745",
        });
        setDisabled(true);
      } else if (res.status === "already_registered") {
        Swal.fire("Warning", "Pickup is already registered.", "warning");
        setDisabled(true);
      } else {
        Swal.fire("Error", "Something went wrong. Please try again.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Connection failed.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentData");
    localStorage.removeItem("regNo");
    localStorage.removeItem("parentLogged");
    navigate("/");
  };

  if (!student) return null;

  return (
    <div className="mobile-container">
      <Header 
        title="Pickup Registration" 
        subtitle="Annual Day NEXUS '26" 
        onLogout={handleLogout} 
      />

      <main>
        {/* Student Information Section */}
        <div className="section">
          <h3>🧑‍🎓 Student Details</h3>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <img
              src={student.photo}
              alt="Student"
              style={{ 
                width: "100px", 
                height: "100px", 
                borderRadius: "12px", 
                objectFit: "cover", 
                border: "3px solid #4a90e2" 
              }}
            />
            <div style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Class:</strong> {student.class} - {student.section}</p>
              <p><strong>Pickup Date:</strong> 28-02-2026</p>
            </div>
          </div>
        </div>

        {/* Pickup Form Section */}
        <div className="section">
          <h3>👤 Pickup Person Details</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Name of Pickup Person</label>
            <input
              placeholder="Enter full name"
              value={pickupName}
              disabled={disabled}
              onChange={(e) => setPickupName(e.target.value)}
            />

            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Relationship</label>
            <input
              placeholder="Father / Mother / Brother etc."
              value={relation}
              disabled={disabled}
              onChange={(e) => setRelation(e.target.value)}
            />

            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter 10 digit number"
              value={phone}
              disabled={disabled}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>Pickup Person Photo</label>
            {/* Removed capture="environment" to allow Gallery/File Manager upload */}
            <input
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={(e) => handleImageUpload(e.target.files[0])}
              style={{ padding: "8px" }}
            />

            {photoUrl && (
              <div style={{ textAlign: "center", margin: "10px 0" }}>
                <img
                  src={photoUrl}
                  alt="Pickup Preview"
                  style={{ 
                    width: "120px", 
                    height: "120px", 
                    borderRadius: "50%", 
                    border: "4px solid #28a745", 
                    objectFit: "cover" 
                  }}
                />
                <p style={{ color: "#28a745", fontSize: "0.8rem", fontWeight: "bold" }}>Photo Ready ✅</p>
              </div>
            )}

            {!disabled && (
              <button 
                className="success-btn" 
                onClick={handleSubmit}
                style={{ marginTop: "10px", padding: "15px" }}
              >
                Register Pickup
              </button>
            )}
            
            {disabled && (
              <div style={{ textAlign: "center", padding: "10px", background: "#f8f9fa", borderRadius: "8px" }}>
                <p style={{ color: "#28a745", fontWeight: "bold" }}>✅ Registration Complete</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}