import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

const emptyItem = () => ({
  icon: "fas fa-star",
  title: "",
  description: "",
});

export default function SpecialPrograms() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    heading: "Special Programs",
    subheading: "Unique opportunities for specialized learning",
    items: [emptyItem(), emptyItem(), emptyItem()],
  });

  const canSave = useMemo(() => {
    if (!data.heading?.trim()) return false;
    if (!Array.isArray(data.items)) return false;
    if (data.items.length === 0) return false;
    return true;
  }, [data]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/special-programs`);
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const json = await res.json();

      // Expecting: { heading, subheading, items: [...] }
      setData({
        heading: json?.heading ?? "Special Programs",
        subheading: json?.subheading ?? "Unique opportunities for specialized learning",
        items: Array.isArray(json?.items) && json.items.length ? json.items : [emptyItem()],
      });
    } catch (e) {
      setError(e.message || "Failed to load special programs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(index, key, value) {
    setData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, items };
    });
  }

  function addItem() {
    setData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(index) {
    setData((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: items.length ? items : [emptyItem()] };
    });
  }

  async function save() {
    if (!canSave) {
      setError("Fill at least the section title, and keep at least 1 program card.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        heading: data.heading,
        subheading: data.subheading,
        items: data.items.map((it) => ({
          icon: it.icon || "fas fa-star",
          title: it.title || "",
          description: it.description || "",
        })),
      };

      const res = await fetch(`${API_BASE}/api/special-programs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Save failed (${res.status})`);
    } catch (e) {
      setError(e.message || "Failed to save special programs");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading Special Programs...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1000 }}>
      <h2 style={{ marginBottom: 6 }}>Special Programs</h2>
      <p style={{ marginTop: 0, color: "#666" }}>
        Edit the “Special Programs” section on Programs page.
      </p>

      {error ? (
        <div
          style={{
            background: "#ffe9e9",
            border: "1px solid #ffb3b3",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            color: "#7a0b0b",
          }}
        >
          {error}
        </div>
      ) : null}

      {/* Section header */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e6e6",
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Section Header</h3>

        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Title</label>
        <input
          value={data.heading}
          onChange={(e) => updateField("heading", e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          placeholder="Special Programs"
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 12, marginBottom: 6 }}>
          Subtitle
        </label>
        <input
          value={data.subheading}
          onChange={(e) => updateField("subheading", e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          placeholder="Unique opportunities for specialized learning"
        />
      </div>

      {/* Items */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e6e6",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Program Cards</h3>
          <button
            type="button"
            onClick={addItem}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#f7f7f7",
              cursor: "pointer",
            }}
          >
            + Add Card
          </button>
        </div>

        {data.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Card #{idx + 1}</h4>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #ffb3b3",
                  background: "#fff0f0",
                  cursor: "pointer",
                  color: "#8a0b0b",
                }}
              >
                Remove
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Icon class (Font Awesome)
                </label>
                <input
                  value={item.icon}
                  onChange={(e) => updateItem(idx, "icon", e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                  placeholder="fas fa-graduation-cap"
                />
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  Example: <code>fas fa-language</code>, <code>fas fa-laptop-code</code>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Title</label>
                <input
                  value={item.title}
                  onChange={(e) => updateItem(idx, "title", e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                  placeholder="College Prep"
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Description</label>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  minHeight: 90,
                }}
                placeholder="Comprehensive guidance for university applications and career planning."
              />
            </div>

            {/* Small preview */}
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: "#f7f7f7",
                border: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 28, color: "#c52233" }}>
                <i className={item.icon || "fas fa-star"} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{item.title || "Preview title"}</div>
                <div style={{ color: "#666" }}>{item.description || "Preview description"}</div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: saving ? "#aaa" : "#c52233",
              color: "white",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {saving ? "Saving..." : "Save Special Programs"}
          </button>

          <button
            type="button"
            onClick={load}
            disabled={saving}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#f7f7f7",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
