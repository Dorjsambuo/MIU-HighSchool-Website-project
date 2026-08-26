import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001"; // change when deployed

export default function Questions() {
  const [sectionTitle, setSectionTitle] = useState("Frequently Asked Questions");
  const [sectionSubtitle, setSectionSubtitle] = useState("Find answers to common questions");
  const [items, setItems] = useState([{ question: "", answer: "" }]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/faq`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setSectionTitle(data.sectionTitle || "Frequently Asked Questions");
      setSectionSubtitle(data.sectionSubtitle || "Find answers to common questions");
      setItems(Array.isArray(data.items) && data.items.length ? data.items : [{ question: "", answer: "" }]);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load FAQ.");
    }
  }

  async function save() {
    setMsg("");
    try {
      const payload = {
        sectionTitle,
        sectionSubtitle,
        items: items
          .map((x) => ({
            question: String(x.question || "").trim(),
            answer: String(x.answer || "").trim(),
          }))
          .filter((x) => x.question || x.answer),
      };

      const res = await fetch(`${API_BASE}/api/faq`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMsg("Saved ✅");
    } catch (e) {
      console.error(e);
      setMsg("Failed to save FAQ.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateItem(i, patch) {
    setItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  function addItem() {
    setItems((prev) => [...prev, { question: "", answer: "" }]);
  }

  function removeItem(i) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>FAQ (Questions)</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <label>
          Title
          <input
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          Subtitle
          <input
            value={sectionSubtitle}
            onChange={(e) => setSectionSubtitle(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Questions</h3>

        {items.map((x, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <label style={{ display: "block", marginBottom: 8 }}>
              Question
              <input
                value={x.question}
                onChange={(e) => updateItem(i, { question: e.target.value })}
                style={{ width: "100%", padding: 10, marginTop: 6 }}
              />
            </label>

            <label style={{ display: "block" }}>
              Answer
              <textarea
                value={x.answer}
                onChange={(e) => updateItem(i, { answer: e.target.value })}
                rows={4}
                style={{ width: "100%", padding: 10, marginTop: 6 }}
              />
            </label>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => removeItem(i)} disabled={items.length === 1}>
                Remove
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={addItem}>Add Question</button>
          <button onClick={save}>Save</button>
          <button onClick={load}>Reload</button>
        </div>

        {msg ? <p style={{ marginTop: 10 }}>{msg}</p> : null}
      </div>
    </div>
  );
}
