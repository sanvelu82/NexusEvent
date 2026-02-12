import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPickup, approvePickup, markPicked } from "../services/api";

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [regNo, setRegNo] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [tick, setTick] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("staffLogged") !== "true") {
      navigate("/staff-login");
    }
  }, []);

  const handleSearch = async () => {
    const res = await searchPickup(regNo);

    if (res.status === "found") {
      setResult(res);
      setMessage("");
    } else {
      setResult(null);
      setMessage("No registration found.");
    }
  };

  const handleApprove = async () => {
    const facultyName = localStorage.getItem("facultyName");

    const res = await approvePickup(regNo, facultyName);

    if (res.status === "approved") {
      setMessage("Pickup Approved ✅");
      handleSearch();
    }
  };

  const handleMarkPicked = async () => {
    const res = await markPicked(regNo);

    if (res.status === "picked") {
      setTick(true);

      setTimeout(() => {
        setTick(false);
        setResult(null);
        setRegNo("");
      }, 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("staffLogged");
    localStorage.removeItem("facultyName");
    navigate("/staff-login");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Staff Dashboard</h2>

      <button onClick={handleLogout}>Logout</button>

      <hr />

      <input
        placeholder="Enter Register Number"
        value={regNo}
        onChange={(e) => setRegNo(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

      <p>{message}</p>

      {tick && <div className="tick">✔</div>}


      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Pickup Details</h3>

          <p><strong>Pickup Name:</strong> {result.pickupName}</p>
          <p><strong>Relation:</strong> {result.relation}</p>
          <p><strong>Phone:</strong> {result.phone}</p>
          <p><strong>Status:</strong> {result.statusPickup}</p>
          <p><strong>Approved By:</strong> {result.approvedBy || "Not Approved"}</p>

          <img src={result.pickupPhoto} width="150" alt="Pickup Person" />

          <br /><br />

          {result.statusPickup === "REGISTERED" && (
            <button onClick={handleApprove}>Approve</button>
          )}

          {result.statusPickup === "APPROVED" && (
            <button onClick={handleMarkPicked}>Mark Picked</button>
          )}
        </div>
      )}
    </div>
  );
}
