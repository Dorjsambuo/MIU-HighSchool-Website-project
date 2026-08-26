// Cafeteria.js
import { useEffect, useState } from "react";

const API = "http://localhost:3001";

export default function Cafeteria() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    heading: "",
    text: "",
    imageUrl: "" // can be "/uploads/xxx.jpg" or full "http://..."
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load existing cafeteria data
  useEffect(() => {
    fetch(`${API}/api/cafeteria`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cafeteria");
        return res.json();
      })
      .then((d) =>
        setData({
          title: d.title || "",
          subtitle: d.subtitle || "",
          heading: d.heading || "",
          text: d.text || "",
          imageUrl: d.imageUrl || ""
        })
      )
      .catch((err) => console.error(err));
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API}/api/cafeteria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Saved");
    } catch (e) {
      console.error(e);
      alert("Save failed (check backend).");
    } finally {
      setSaving(false);
    }
  };

  // Optional: upload image if your server has POST /api/upload (multer)
  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        body: form
      });

      if (!res.ok) throw new Error("Upload failed");

      const out = await res.json(); // expects { imageUrl: "/uploads/..." }
      if (!out.imageUrl) throw new Error("No imageUrl returned");

      setData((prev) => ({ ...prev, imageUrl: out.imageUrl }));
    } catch (err) {
      console.error(err);
      alert("Upload failed. Make sure server has POST /api/upload.");
    } finally {
      setUploading(false);
    }
  };

  const previewSrc =
    data.imageUrl && data.imageUrl.startsWith("http")
      ? data.imageUrl
      : data.imageUrl
      ? `${API}${data.imageUrl}`
      : "";

  return (
    <div style={{ padding: 30, maxWidth: 900 }}>
      <h2 style={{ marginBottom: 20 }}>Cafeteria</h2>

      {/* Image Upload */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
          Cafeteria Image (optional)
        </label>

        <input type="file" accept="image/*" onChange={onPickImage} />
        {uploading && <div style={{ marginTop: 8 }}>Uploading...</div>}

        {previewSrc ? (
          <div style={{ marginTop: 12 }}>
            <img
              src={previewSrc}
              alt="Cafeteria preview"
              style={{
                width: "100%",
                maxWidth: 520,
                borderRadius: 10,
                border: "1px solid #ddd"
              }}
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setData((p) => ({ ...p, imageUrl: "" }))}
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Text Fields */}
      <Field
        label="Section Title"
        value={data.title}
        onChange={(v) => setData((p) => ({ ...p, title: v }))}
        placeholder="School Cafeteria"
      />

      <Field
        label="Subtitle"
        value={data.subtitle}
        onChange={(v) => setData((p) => ({ ...p, subtitle: v }))}
        placeholder="Healthy and nutritious meals for our students"
      />

      <Field
        label="Heading"
        value={data.heading}
        onChange={(v) => setData((p) => ({ ...p, heading: v }))}
        placeholder="Nutrition-Focused Meals"
      />

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
          Description Text
        </label>
        <textarea
          rows={6}
          value={data.text}
          onChange={(e) => setData((p) => ({ ...p, text: e.target.value }))}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
          placeholder="Write the cafeteria description..."
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: "#c52233",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

// Small helper component
function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ccc"
        }}
      />
    </div>
  );
}
