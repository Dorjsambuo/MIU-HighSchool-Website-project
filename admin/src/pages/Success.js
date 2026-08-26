import { useEffect, useState } from "react";
const API = "http://localhost:3001";

export default function Success() {
  const [data, setData] = useState({
    subtitle: "",
    graduates: "",
    awards: "",
    community: ""
  });

  useEffect(() => {
    fetch(`${API}/api/success`)
      .then(res => res.json())
      .then(setData);
  }, []);

  const save = async () => {
    await fetch(`${API}/api/success`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    alert("Saved");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Our Success</h2>

      <label>Subtitle</label>
      <input
        value={data.subtitle}
        onChange={e => setData({ ...data, subtitle: e.target.value })}
      />

      <label>Graduation Number</label>
      <input
        value={data.graduates}
        onChange={e => setData({ ...data, graduates: e.target.value })}
      />

      <label>Award Text</label>
      <textarea
        value={data.awards}
        onChange={e => setData({ ...data, awards: e.target.value })}
      />

      <label>Community Impact</label>
      <textarea
        value={data.community}
        onChange={e => setData({ ...data, community: e.target.value })}
      />

      <button onClick={save}>Save</button>
    </div>
  );
}
