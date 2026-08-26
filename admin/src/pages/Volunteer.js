import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

const emptyItem = () => ({
  title: "",
  description: "",
  time: "",
  grades: "",
  imageUrl: "",
});

export default function Volunteer() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    heading: "Volunteer Programs",
    subheading: "Make a difference in your community",
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
      const res = await fetch(`${API_BASE}/api/volunteer`);
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const json = await res.json();

      setData({
        heading: json?.heading ?? "Volunteer Programs",
        subheading: json?.subheading ?? "Make a difference in your community",
        items: Array.isArray(json?.items) && json.items.length ? json.items : [emptyItem()],
      });
    } catch (e) {
      setError(e.message || "Failed to load volunteer");
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

  async function uploadImage(file, index) {
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Upload failed (${res.status})`);
      }

      if (!json?.imageUrl) throw new Error("Upload succeeded but imageUrl missing");
      updateItem(index, "imageUrl", json.imageUrl);
    } catch (e) {
      setError(e.message || "Image upload failed");
    }
  }

  async function save() {
    if (!canSave) {
      setError("Fill at least the section title, and keep at least 1 volunteer card.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        heading: data.heading,
        subheading: data.subheading,
        items: data.items.map((it) => ({
          title: it.title || "",
          description: it.description || "",
          time: it.time || "",
          grades: it.grades || "",
          imageUrl: it.imageUrl || "",
        })),
      };

      const res = await fetch(`${API_BASE}/api/volunteer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Save failed (${res.status})`);
    } catch (e) {
      setError(e.message || "Failed to save volunteer");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading Volunteer...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000 }}>
      <h2 style={{ marginBottom: 6 }}>Volunteer</h2>
      <p style={{ marginTop: 0, color: "#666" }}>
        Edit the “Volunteer Programs” section on Programs page.
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

        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Title
        </label>
        <input
          value={data.heading}
          onChange={(e) => updateField("heading", e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          placeholder="Volunteer Programs"
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: 12, marginBottom: 6 }}>
          Subtitle
        </label>
        <input
          value={data.subheading}
          onChange={(e) => updateField("subheading", e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          placeholder="Make a difference in your community"
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
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Activity Cards</h3>
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
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Title</label>
                <input
                  value={item.title}
                  onChange={(e) => updateItem(idx, "title", e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                  placeholder="Tutoring Program"
                />
              </div>

              
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, idx);
                  }}
                />
                {item.imageUrl ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Preview:</div>
                    <img
                      src={item.imageUrl}
                      alt=""
                      style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }}
                    />
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6, wordBreak: "break-all" }}>
                      {item.imageUrl}
                    </div>
                  </div>
                ) : null}
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
                placeholder="Help elementary school students with reading and math skills. Training provided for all volunteers."
              />
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
            {saving ? "Saving..." : "Save Activities"}
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
