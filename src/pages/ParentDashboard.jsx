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

    // If student is already marked as registered, fetch their pickup details immediately
    if (parsed.registered === "YES") {
      setDisabled(true);
      fetchExistingRegistration(regNo);
    }
  }, [navigate]);

  const fetchExistingRegistration = async (regNo) => {
    Swal.fire({
      title: "Loading Registration...",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await searchPickup(regNo);
      if (res.status === "found") {
        // Take the first matching record for this specific student
        setRegisteredData(res.data[0]);
        Swal.close();
      } else {
        Swal.fire("Error", "Could not find registration details.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed.", "error");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Image must be less than 2MB", "error");
      return;
    }

    Swal.fire({
      title: "Uploading Photo...",
      text: "Connecting to secure storage.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();
    formData.append("file", file);
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
        title: "Photo Uploaded",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Upload Failed", "Please try again.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!pickupName || !relation || !phone || !photoUrl) {
      return Swal.fire("Incomplete Info", "Please fill all details and upload a photo.", "warning");
    }

    Swal.fire({
      title: "Registering Pickup...",
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
        phone,
        pickupPhoto: photoUrl,
      });

      if (res.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Registration Success",
          text: "Pickup Details Registered Successfully ✅",
        });
        
        // Refresh to show the details view
        const updatedStudent = { ...student, registered: "YES" };
        localStorage.setItem("studentData", JSON.stringify(updatedStudent));
        setStudent(updatedStudent);
        setDisabled(true);
        fetchExistingRegistration(regNo);

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
    <div className="mobile-container">
      <Header 
        title="Pickup Portal" 
        subtitle="Annual Day NEXUS '26" 
        onLogout={handleLogout} 
      />

      <main>
        {/* Section 1: Student Identity */}
        <div className="section">
          <h3 style={{ color: '#4a90e2' }}>🧑‍🎓 Student Info</h3>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <img
              src={student.photo}
              alt="Student"
              style={{ width: "90px", height: "90px", borderRadius: "12px", border: "3px solid #4a90e2", objectFit: "cover" }}
            />
            <div style={{ fontSize: "0.9rem" }}>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Class:</strong> {student.class} - {student.section}</p>
              <p><strong>Reg No:</strong> {localStorage.getItem("regNo")}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Conditional Rendering - Details or Form */}
        {disabled && registeredData ? (
          /* DISPLAY MODE: Show existing pickup details */
          <div className="section" style={{ borderLeft: "6px solid #28a745" }}>
            <h3 style={{ color: "#28a745" }}>✅ Pickup Confirmed</h3>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img
                src={registeredData.pickupPhoto}
                alt="Pickup Person"
                style={{ width: "150px", height: "150px", borderRadius: "50%", border: "4px solid #28a745", objectFit: "cover", padding: "3px" }}
              />
            </div>
            <div className="info-list">
              <p><strong>Pickup Person:</strong> {registeredData.pickupName}</p>
              <p><strong>Relationship:</strong> {registeredData.relation}</p>
              <p><strong>Phone:</strong> {registeredData.phone}</p>
              <p><strong>Status:</strong> <span style={{ color: "#007bff", fontWeight: "bold" }}>{registeredData.statusPickup}</span></p>
              <p><strong>Approved By:</strong> {registeredData.approvedBy || "Waiting for Faculty"}</p>
            </div>
            <div style={{ marginTop: "15px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", fontSize: "0.8rem", textAlign: "center" }}>
              Please show this screen to the gate staff during pickup on 28-02-2026.
            </div>
          </div>
        ) : (
          /* INPUT MODE: Show registration form */
          <div className="section">
            <h3>👤 Register Pickup Person</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="input-label">Pickup Person Name</label>
                <input placeholder="Enter full name" value={pickupName} onChange={(e) => setPickupName(e.target.value)} />
              </div>

              <div>
                <label className="input-label">Relation to Student</label>
                <input placeholder="e.g. Father, Mother, Uncle" value={relation} onChange={(e) => setRelation(e.target.value)} />
              </div>

              <div>
                <label className="input-label">Contact Number</label>
                <input type="tel" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div>
                <label className="input-label">Upload Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} style={{ padding: "8px" }} />
              </div>

              {photoUrl && (
                <div style={{ textAlign: "center" }}>
                  <img src={photoUrl} alt="Preview" style={{ width: "100px", height: "100px", borderRadius: "50%", border: "3px solid #28a745", objectFit: "cover" }} />
                  <p style={{ color: "#28a745", fontSize: "0.8rem" }}>Photo verified ✅</p>
                </div>
              )}

              <button className="success-btn" onClick={handleSubmit} style={{ marginTop: "10px", padding: "15px" }}>
                Confirm Registration
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}