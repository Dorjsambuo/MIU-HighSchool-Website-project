// src/pages/Admission.js
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001";

const DEFAULT_DATA = {
  sectionTitle: "Online Admissions",
  sectionSubtitle: "Apply conveniently through our portal",

  leftTitle: "Apply Online",
  leftText:
    "Our online admissions portal makes it easy to apply from anywhere. Track your application status and submit documents electronically.",

  requirementsTitle: "Required Documents",
  requirementsItems: [
    "Completed application form",
    "Student's birth certificate",
    "Parent/guardian ID",
    "Teacher recommendations",
  ],

  cardTitle: "Start Application",
  cardText: "Begin your journey with Mongolian Itgel School today.",
  buttonText: "Apply Online",
  buttonUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSeYmx8V7M2LNLFUH08G06LKwdAtbhIq6DJngrFgp2TEosNdRg/viewform",

  helpText: "Need help? Contact admissions@mis.edu.mn",
};

async function fetchJson(url, options) {
  const res = await fetch(url, { credentials: "include", ...options });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Expected JSON but got:\n${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  return json;
}

export default function Admission() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const setField = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const json = await fetchJson(`${API_BASE}/api/application`);
      setData({
        ...DEFAULT_DATA,
        ...(json || {}),
        requirementsItems: Array.isArray(json?.requirementsItems)
          ? json.requirementsItems
          : [],
      });
    } catch (e) {
      console.error(e);
      setMsg(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        ...data,
        requirementsItems: Array.isArray(data.requirementsItems)
          ? data.requirementsItems.map((s) => String(s ?? ""))
          : [],
      };

      await fetchJson(`${API_BASE}/api/application`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setMsg("Saved!");
    } catch (e) {
      console.error(e);
      setMsg(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const addReq = () =>
    setData((d) => ({
      ...d,
      requirementsItems: [...(d.requirementsItems || []), ""],
    }));

  const updateReq = (i, v) =>
    setData((d) => {
      const items = [...(d.requirementsItems || [])];
      items[i] = v;
      return { ...d, requirementsItems: items };
    });

  const removeReq = (i) =>
    setData((d) => {
      const items = [...(d.requirementsItems || [])];
      items.splice(i, 1);
      return { ...d, requirementsItems: items };
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h1 style={{ margin: 0 }}>Online Admissions</h1>
      <p style={{ marginTop: 6, color: "#555" }}>
        Edit the “Online Admissions” section on Admissions page.
      </p>

      {msg ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
            background: msg.toLowerCase().includes("expected json")
              ? "#ffe9e9"
              : "#e9fff0",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={save} disabled={loading || saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={load} disabled={loading || saving}>
          Reload
        </button>
      </div>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Section Header</h2>

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Title</label>
        <input
          value={data.sectionTitle}
          onChange={(e) => setField("sectionTitle", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Subtitle</label>
        <input
          value={data.sectionSubtitle}
          onChange={(e) => setField("sectionSubtitle", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Left Column</h2>

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Left Title</label>
        <input
          value={data.leftTitle}
          onChange={(e) => setField("leftTitle", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Left Text</label>
        <textarea
          value={data.leftText}
          onChange={(e) => setField("leftText", e.target.value)}
          disabled={loading || saving}
          rows={3}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Requirements</h2>
          <button onClick={addReq} disabled={loading || saving}>
            + Add Item
          </button>
        </div>

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>
          Requirements Title
        </label>
        <input
          value={data.requirementsTitle}
          onChange={(e) => setField("requirementsTitle", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />

        {(data.requirementsItems || []).map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input
              value={item}
              onChange={(e) => updateReq(i, e.target.value)}
              disabled={loading || saving}
              style={{ flex: 1, padding: 10 }}
              placeholder={`Item ${i + 1}`}
            />
            <button onClick={() => removeReq(i)} disabled={loading || saving}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Right Card</h2>

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Card Title</label>
        <input
          value={data.cardTitle}
          onChange={(e) => setField("cardTitle", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Card Text</label>
        <textarea
          value={data.cardText}
          onChange={(e) => setField("cardText", e.target.value)}
          disabled={loading || saving}
          rows={3}
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Button Text</label>
        <input
          value={data.buttonText}
          onChange={(e) => setField("buttonText", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Button URL</label>
        <input
          value={data.buttonUrl}
          onChange={(e) => setField("buttonUrl", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Help Text</label>
        <input
          value={data.helpText}
          onChange={(e) => setField("helpText", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />
      </div>
    </div>
  );
}
