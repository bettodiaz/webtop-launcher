import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [apps, setApps] = useState<any[]>([]);

  const loadApps = async () => {
    const res = await axios.get("API_BASE/api/applications");
    setApps(res.data);
  };

  useEffect(() => { loadApps(); }, []);

  return (
    <div>
      <h2>Applications</h2>
      <ul>
        {apps.map((a) => (
          <li key={a.id}>{a.name} - {a.description}</li>
        ))}
      </ul>
    </div>
  );
}
