import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPickup } from "../services/api";
import Header from "../components/Header";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [pickupName, setPickupName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    const data = localStorage.getItem("studentData");

    if (!data) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(data);
    setStudent(parsed);

    if (parsed.registered === "YES") {
      setMessage("Pickup already registered for this student.");
      setDisabled(true);
    }
  }, []);

  const handleImageUpload = async (file) => {
  if (!file) return;

  // Max size 2MB
  if (file.size > 2 * 1024 * 1024) {
    alert("Image must be less than 2MB");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "nexus_event"); // your preset

  try {
    setUploading(true);

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/drsasl2kt/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    setPhotoUrl(data.secure_url);

  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    setUploading(false);
  }
};


  const handleSubmit = async () => {
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
      setMessage("Pickup Registered Successfully ✅");
      setDisabled(true);
    } else if (res.status === "already_registered") {
      setMessage("Pickup already registered.");
      setDisabled(true);
    } else {
      setMessage("Something went wrong.");
    }
  };

  if (!student) return null;

  return (
  <>
    <Header title="Annual Day Pickup Registration" />

    <div className="section">
      <h3>Student Details</h3>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <img
          src={student.photo}
          width="120"
          style={{ borderRadius: "8px" }}
        />

        <div>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Class:</strong> {student.class}</p>
          <p><strong>Section:</strong> {student.section}</p>
          <p><strong>Pickup Date:</strong> 28-02-2026</p>
        </div>
      </div>
    </div>

    <div className="section">
      <h3>Pickup Person Details</h3>

      <input
        placeholder="Pickup Person Name"
        value={pickupName}
        onChange={(e) => setPickupName(e.target.value)}
      />

      <input
        placeholder="Relation"
        value={relation}
        onChange={(e) => setRelation(e.target.value)}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleImageUpload(e.target.files[0])}
      />

      {photoUrl && (
        <img
          src={photoUrl}
          width="120"
          style={{ borderRadius: "8px", marginBottom: "10px" }}
        />
      )}

      <button className="success-btn" onClick={handleSubmit}>
        Register Pickup
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  </>
);

}
