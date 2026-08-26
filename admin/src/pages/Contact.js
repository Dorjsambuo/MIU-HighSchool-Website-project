import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001"; // change when deployed

export default function Contact() {
  const [form, setForm] = useState({
    sectionTitle: "Contact Information",
    sectionSubtitle: "Get in touch with us",
    address: { org: "", line1: "", line2: "" },
    phones: { mainOffice: "", admissions: "" },
    emails: { general: "", admissions: "", registrar: "" },
    socials: { facebook: "#", instagram: "#", email: "" },
  });
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/contact`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setForm((prev) => ({ ...prev, ...(data || {}) }));
    } catch (e) {
      console.error(e);
      setMsg("Failed to load contact.");
    }
  }

  async function save() {
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMsg("Saved ✅");
    } catch (e) {
      console.error(e);
      setMsg("Failed to save contact.");
    }
  }

  useEffect(() => { load(); }, []);

  const set = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts.at(-1)] = value;
      return next;
    });
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Contact</h2>

      <div style={{ display: "grid", gap: 10 }}>
        <label>
          Section Title
          <input value={form.sectionTitle} onChange={(e)=>set("sectionTitle", e.target.value)}
            style={{ width:"100%", padding:10, marginTop:6 }} />
        </label>
        <label>
          Section Subtitle
          <input value={form.sectionSubtitle} onChange={(e)=>set("sectionSubtitle", e.target.value)}
            style={{ width:"100%", padding:10, marginTop:6 }} />
        </label>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <h3>Address</h3>
      <label>Organization
        <input value={form.address.org} onChange={(e)=>set("address.org", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>
      <label>Line 1
        <input value={form.address.line1} onChange={(e)=>set("address.line1", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>
      <label>Line 2
        <input value={form.address.line2} onChange={(e)=>set("address.line2", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>

      <h3>Phones</h3>
      <label>Main Office
        <input value={form.phones.mainOffice} onChange={(e)=>set("phones.mainOffice", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>
      <label>Admissions
        <input value={form.phones.admissions} onChange={(e)=>set("phones.admissions", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>

      <h3>Emails</h3>
      <label>General
        <input value={form.emails.general} onChange={(e)=>set("emails.general", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>
      <label>Admissions
        <input value={form.emails.admissions} onChange={(e)=>set("emails.admissions", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>
      <label>Registrar
        <input value={form.emails.registrar} onChange={(e)=>set("emails.registrar", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>

      <h3>Social Links</h3>
      <label>Facebook URL
        <input value={form.socials.facebook} onChange={(e)=>set("socials.facebook", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>
      <label>Instagram URL
        <input value={form.socials.instagram} onChange={(e)=>set("socials.instagram", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>
      <label>Email Link (e.g. mailto:info@...)
        <input value={form.socials.email} onChange={(e)=>set("socials.email", e.target.value)}
          style={{ width:"100%", padding:10, margin:"6px 0 10px" }} />
      </label>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={save}>Save</button>
        <button onClick={load}>Reload</button>
      </div>

      {msg ? <p style={{ marginTop: 10 }}>{msg}</p> : null}
    </div>
  );
}
