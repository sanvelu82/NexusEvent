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
  const [registeredDetails, setRegisteredDetails] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("studentData");
    const regNo = localStorage.getItem("regNo");

    if (!data) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(data);
    setStudent(parsed);

    if (parsed.registered === "YES") {
      setDisabled(true);
      fetchPickupDetails(regNo);
    }
  }, [navigate]);

  const fetchPickupDetails = async (regNo) => {
    Swal.fire({
      title: "Loading Details...",
      didOpen: () => Swal.showLoading(),
    });

    const res = await searchPickup(regNo);
    if (res.status === "found") {
      setRegisteredDetails(res);
      Swal.close();
    } else {
      Swal.fire("Error", "Could not load registration details.", "error");
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
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nexus_event");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/drsasl2kt/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setPhotoUrl(data.secure_url);
      Swal.fire({ icon: "success", title: "Photo Uploaded", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Upload Failed", "Please try again.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!pickupName || !relation || !phone || !photoUrl) {
      return Swal.fire("Incomplete Info", "Please fill all details.", "warning");
    }

    Swal.fire({ title: "Registering...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const regNo = localStorage.getItem("regNo");
    const res = await registerPickup({
      regNo,
      studentName: student.name,
      pickupName,
      relation,
      phone,
      pickupPhoto: photoUrl,
    });

    if (res.status === "success") {
      Swal.fire("Success", "Pickup Registered ✅", "success");
      setDisabled(true);
      fetchPickupDetails(regNo);
    } else {
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!student) return null;

  return (
    <div className="mobile-container">
      <Header title="Pickup Portal" subtitle="Annual Day NEXUS '26" onLogout={handleLogout} />
      <main>
        <div className="section">
          <h3>🧑‍🎓 Student Details</h3>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <img src={student.photo} style={{ width: "100px", borderRadius: "12px", border: "3px solid #4a90e2" }} />
            <div style={{ fontSize: "0.9rem" }}>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Class:</strong> {student.class} - {student.section}</p>
              <p><strong>Pickup Date:</strong> 28-02-2026</p>
            </div>
          </div>
        </div>

        {disabled && registeredDetails ? (
          <div className="section" style={{ borderLeft: "6px solid #28a745" }}>
            <h3>✅ Registration Confirmed</h3>
            <center>
              <img src={registeredDetails.pickupPhoto} style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "4px solid #28a745", marginBottom: "15px" }} />
            </center>
            <p><strong>Pickup Person:</strong> {registeredDetails.pickupName}</p>
            <p><strong>Relation:</strong> {registeredDetails.relation}</p>
            <p><strong>Phone:</strong> {registeredDetails.phone}</p>
            <p><strong>Status:</strong> <span style={{ color: "#28a745", fontWeight: "bold" }}>{registeredDetails.statusPickup}</span></p>
            <p><strong>Approved By:</strong> {registeredDetails.approvedBy || "Pending"}</p>
          </div>
        ) : (
          <div className="section">
            <h3>👤 Pickup Person Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input placeholder="Pickup Person Name" value={pickupName} onChange={(e) => setPickupName(e.target.value)} />
              <input placeholder="Relation" value={relation} onChange={(e) => setRelation(e.target.value)} />
              <input type="tel" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
              {photoUrl && <img src={photoUrl} style={{ width: "120px", borderRadius: "50%", margin: "0 auto", display: "block", border: "3px solid #28a745" }} />}
              <button className="success-btn" onClick={handleSubmit}>Register Pickup</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}