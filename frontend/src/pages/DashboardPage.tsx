import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);

  const loadSessions = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("API_BASE/api/session", {
      headers: { Authorization: "Bearer " + token },
    });
    setSessions(res.data);
  };

  useEffect(() => { loadSessions(); }, []);

  return (
    <div>
      <h2>Active Sessions</h2>
      <ul>
        {sessions.map((s) => (
          <li key={s.id}>{s.containerId} - {s.accessUrl}</li>
        ))}
      </ul>
    </div>
  );
}
