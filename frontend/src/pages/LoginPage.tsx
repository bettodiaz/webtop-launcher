import React, { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("API_BASE/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div>
      <h1>Webtop Launcher</h1>
      <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p>{error}</p>}
    </div>
  );
}
