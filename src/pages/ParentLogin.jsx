import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentLogin } from "../services/api";

export default function ParentLogin() {
  const [regNo, setRegNo] = useState("");
  const [dob, setDob] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await studentLogin(regNo, dob);

    if (res.status === "success") {
      localStorage.setItem("studentData", JSON.stringify(res));
      localStorage.setItem("regNo", regNo);
      navigate("/parent");
    } else {
      setMessage("Invalid login");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Parent Login</h2>

      <input
        placeholder="Register No"
        value={regNo}
        onChange={(e) => setRegNo(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="DOB (DD-MM-YYYY)"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>

      <p>{message}</p>
    </div>
  );
}
