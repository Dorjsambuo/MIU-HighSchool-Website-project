import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/login",
        { username, password },
        { withCredentials: true }
      );

      // SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // 🔥 IMPORTANT: navigate AFTER saving token
      navigate("/", { replace: true });
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Login</h2>

      <form onSubmit={login}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        <button type="submit">Login</button>
      </form>
      <a
        href="/home.html"
        style={{
          position: "fixed",
          top: "15px",
          right: "15px",
          padding: "8px 12px",
          border: "1px solid #ccc",
          textDecoration: "none",
          background: "#fff"
        }}
      >
        ← Back to Website
      </a>
    </div>
  );
}
