// src/pages/Process.js
// Clean Admissions Process editor (CMS) — no hidden helpers, no confusion.
// Backend must have:
//   GET  /api/process
//   PUT  /api/process
//
// IMPORTANT:
// - If your backend runs on localhost:3001, set API_BASE below to "http://localhost:3001".
// - If you deploy (Render), set it to your Render URL.

import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001"; // <-- change later for Render

const DEFAULT_DATA = {
  title: "Admissions Process",
  subtitle: "Steps to join our community",
  steps: [
    {
      title: "Inquiry & Information",
      description: "Start by learning about our school programs and curriculum.",
      bullets: [
        "Attend Open House sessions",
        "Review academic programs",
        "Contact admissions office",
        "Schedule campus tour",
      ],
    },
  ],
};

// Reads the response as TEXT first, then parses JSON.
// If the server returns HTML / text (like a 404 page), you will see it in the error.
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();

  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Expected JSON but got:\n${text.slice(0, 200)}\n\nURL: ${url}\nStatus: ${res.status}`
    );
  }

  if (!res.ok) {
    const msg = json && typeof json === "object" ? JSON.stringify(json) : String(text);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  return json;
}

export default function Process() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setMsg("");
    try {
      const json = await fetchJson(`${API_BASE}/api/process`, {
        credentials: "include",
      });

      setData({
        title: json?.title ?? "",
        subtitle: json?.subtitle ?? "",
        steps: Array.isArray(json?.steps) ? json.steps : [],
      });
    } catch (e) {
      console.error(e);
      setMsg(e.message || String(e));
      // keep whatever is on screen instead of blanking it
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField(key, value) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function addStep() {
    setData((d) => ({
      ...d,
      steps: [
        ...d.steps,
        { title: "", description: "", bullets: [""] },
      ],
    }));
  }

  function removeStep(i) {
    setData((d) => {
      const steps = d.steps.slice();
      steps.splice(i, 1);
      return { ...d, steps };
    });
  }

  function moveStep(i, dir) {
    setData((d) => {
      const steps = d.steps.slice();
      const j = i + dir;
      if (j < 0 || j >= steps.length) return d;
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...d, steps };
    });
  }

  function updateStep(i, patch) {
    setData((d) => {
      const steps = d.steps.slice();
      steps[i] = { ...steps[i], ...patch };
      return { ...d, steps };
    });
  }

  function addBullet(stepIndex) {
    setData((d) => {
      const steps = d.steps.slice();
      const st = { ...steps[stepIndex] };
      const bullets = Array.isArray(st.bullets) ? st.bullets.slice() : [];
      bullets.push("");
      st.bullets = bullets;
      steps[stepIndex] = st;
      return { ...d, steps };
    });
  }

  function updateBullet(stepIndex, bulletIndex, value) {
    setData((d) => {
      const steps = d.steps.slice();
      const st = { ...steps[stepIndex] };
      const bullets = Array.isArray(st.bullets) ? st.bullets.slice() : [];
      bullets[bulletIndex] = value;
      st.bullets = bullets;
      steps[stepIndex] = st;
      return { ...d, steps };
    });
  }

  function removeBullet(stepIndex, bulletIndex) {
    setData((d) => {
      const steps = d.steps.slice();
      const st = { ...steps[stepIndex] };
      const bullets = Array.isArray(st.bullets) ? st.bullets.slice() : [];
      bullets.splice(bulletIndex, 1);
      st.bullets = bullets;
      steps[stepIndex] = st;
      return { ...d, steps };
    });
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      // normalize payload
      const payload = {
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        steps: (Array.isArray(data.steps) ? data.steps : []).map((st) => ({
          title: st?.title ?? "",
          description: st?.description ?? "",
          bullets: Array.isArray(st?.bullets) ? st.bullets : [],
        })),
      };

      await fetchJson(`${API_BASE}/api/process`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      setMsg("Saved!");
    } catch (e) {
      console.error(e);
      setMsg(e.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h1 style={{ margin: 0 }}>Admissions Process</h1>
      <p style={{ marginTop: 6, color: "#555" }}>
        Editable CMS panel for the Admissions Process section.
      </p>

      {msg ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: msg.toLowerCase().includes("http") || msg.toLowerCase().includes("expected json")
              ? "#ffe9e9"
              : "#e9fff0",
            border: "1px solid #ddd",
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
        <h2 style={{ marginTop: 0 }}>Header</h2>

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Title</label>
        <input
          value={data.title}
          onChange={(e) => setField("title", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>Subtitle</label>
        <input
          value={data.subtitle}
          onChange={(e) => setField("subtitle", e.target.value)}
          disabled={loading || saving}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Steps</h2>
          <button onClick={addStep} disabled={loading || saving}>
            + Add Step
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : data.steps.length === 0 ? (
          <p style={{ color: "#666" }}>No steps yet.</p>
        ) : (
          data.steps.map((st, i) => (
            <div
              key={i}
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #eee",
                background: "#fafafa",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <h3 style={{ margin: 0 }}>Step #{i + 1}</h3>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => moveStep(i, -1)} disabled={loading || saving || i === 0}>
                    ↑
                  </button>
                  <button
                    onClick={() => moveStep(i, 1)}
                    disabled={loading || saving || i === data.steps.length - 1}
                  >
                    ↓
                  </button>
                  <button onClick={() => removeStep(i)} disabled={loading || saving}>
                    Remove
                  </button>
                </div>
              </div>

              <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>
                Step Title
              </label>
              <input
                value={st.title ?? ""}
                onChange={(e) => updateStep(i, { title: e.target.value })}
                disabled={loading || saving}
                style={{ width: "100%", padding: 10 }}
              />

              <label style={{ display: "block", fontWeight: 600, marginTop: 10 }}>
                Description
              </label>
              <textarea
                value={st.description ?? ""}
                onChange={(e) => updateStep(i, { description: e.target.value })}
                disabled={loading || saving}
                rows={3}
                style={{ width: "100%", padding: 10 }}
              />

              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
                <strong>Bullets</strong>
                <button onClick={() => addBullet(i)} disabled={loading || saving}>
                  + Add Bullet
                </button>
              </div>

              {(Array.isArray(st.bullets) ? st.bullets : []).map((b, bi) => (
                <div key={bi} style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <input
                    value={b ?? ""}
                    onChange={(e) => updateBullet(i, bi, e.target.value)}
                    disabled={loading || saving}
                    style={{ flex: 1, padding: 10 }}
                    placeholder={`Bullet ${bi + 1}`}
                  />
                  <button onClick={() => removeBullet(i, bi)} disabled={loading || saving}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <p style={{ marginTop: 16, color: "#666" }}>
        Tip: If you still see a JSON parse error, open{" "}
        <code>{`${API_BASE}/api/process`}</code> in your browser. It must show JSON.
      </p>
    </div>
  );
}
