import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { staffLogin } from "../services/api";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("staffLogged") === "true") {
      navigate("/staff");
    }
  }, []);

  const handleLogin = async () => {
    const res = await staffLogin(username, password);

    if (res.status === "success") {
      localStorage.setItem("staffLogged", "true");
      localStorage.setItem("facultyName", res.faculty);
      navigate("/staff");
    } else {
      setMessage("Invalid Credentials");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Staff Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>

      <p>{message}</p>
    </div>
  );
}
