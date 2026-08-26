// News.js (React admin) — upload ONLY (no paste URL)
import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

const DEFAULT_NEWS = {
  sectionTitle: "School News",
  sectionSubtitle: "Latest updates from our school",
  items: [
    {
      title: "Science Fair Winners",
      date: "October 15, 2025",
      excerpt:
        "Our students achieved remarkable success at the annual science fair, winning multiple awards for innovative projects.",
      moreText:
        '"Renewable Energy Solutions for Rural Mongolia," was developed by 11th-grade students and received special recognition from the Ministry of Education.',
      imageUrl: "",
    },
    {
      title: "New Library Opening",
      date: "September 28, 2025",
      excerpt: "We are excited to announce the opening of our new library.",
      moreText:
        "The new library features state-of-the-art facilities including quiet study areas, group collaboration spaces, and a digital media center.",
      imageUrl: "",
    },
    {
      title: "Sports Tournament Success",
      date: "August 20, 2025",
      excerpt:
        "Our school basketball team won the regional championship tournament.",
      moreText:
        "The school's basketball team demonstrated exceptional skill and determination throughout the regional tournament.",
      imageUrl: "",
    },
  ],
};

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Expected JSON but got: ${text.slice(0, 140)}`);
  }
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

// Upload helper (backend must support POST /api/upload)
// If your backend expects field name "image" instead of "file", change here.
async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: fd,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Upload expected JSON but got: ${text.slice(0, 140)}`);
  }

  if (!res.ok) throw new Error(json?.error || `Upload failed (${res.status})`);

  let imageUrl = json?.imageUrl || json?.url || json?.path;
  if (!imageUrl) throw new Error("Upload succeeded but no imageUrl returned");

  // If backend returns "/assets/uploads/..", make it absolute for preview.
  if (!String(imageUrl).startsWith("http")) imageUrl = `${API_BASE}${imageUrl}`;
  return imageUrl;
}

export default function News() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const update = (fn) => setData((prev) => fn(structuredClone(prev)));

  useEffect(() => {
    (async () => {
      try {
        const doc = await fetchJson(`${API_BASE}/api/news`);
        setData(doc || DEFAULT_NEWS);
      } catch (e) {
        setError(e.message || "Failed to load");
        setData(DEFAULT_NEWS);
      }
    })();
  }, []);

  const addItem = () =>
    update((d) => {
      d.items.push({
        title: "New news title",
        date: "Month Day, Year",
        excerpt: "Short description...",
        moreText: "Long text...",
        imageUrl: "",
      });
      return d;
    });

  const removeItem = (idx) =>
    update((d) => {
      d.items.splice(idx, 1);
      return d;
    });

  const onPickImage = async (idx, file) => {
    if (!file) return;
    setUploadingIndex(idx);
    setError("");
    try {
      const url = await uploadImage(file);
      update((d) => {
        d.items[idx].imageUrl = url;
        return d;
      });
    } catch (e) {
      setError(e.message || "Image upload failed");
    } finally {
      setUploadingIndex(null);
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    try {
      const clean = {
        sectionTitle: String(data?.sectionTitle ?? ""),
        sectionSubtitle: String(data?.sectionSubtitle ?? ""),
        items: Array.isArray(data?.items)
          ? data.items.map((n) => ({
              title: String(n?.title ?? ""),
              date: String(n?.date ?? ""),
              excerpt: String(n?.excerpt ?? ""),
              moreText: String(n?.moreText ?? ""),
              imageUrl: String(n?.imageUrl ?? ""),
            }))
          : [],
      };

      await fetchJson(`${API_BASE}/api/news`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clean),
      });

      alert("Saved ✅");
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16, maxWidth: 1100 }}>
      <h2 style={{ marginTop: 0 }}>School News (CMS)</h2>

      {error && (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
        <label style={{ fontWeight: 600 }}>
          Section Title
          <input
            value={data.sectionTitle || ""}
            onChange={(e) =>
              update((d) => ((d.sectionTitle = e.target.value), d))
            }
            style={input()}
          />
        </label>
        <label style={{ fontWeight: 600 }}>
          Section Subtitle
          <input
            value={data.sectionSubtitle || ""}
            onChange={(e) =>
              update((d) => ((d.sectionSubtitle = e.target.value), d))
            }
            style={input()}
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>News Items</h3>
        <button
          type="button"
          onClick={addItem}
          className="btn-outline-red"
          style={btn()}
        >
          + Add News
        </button>
      </div>

      {data.items.map((n, idx) => (
        <div key={idx} style={box()}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <strong>Item #{idx + 1}</strong>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              style={btnDanger()}
            >
              Delete
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 260px",
              gap: 10,
              marginTop: 10,
            }}
          >
            <input
              placeholder="Title"
              value={n.title || ""}
              onChange={(e) =>
                update((d) => ((d.items[idx].title = e.target.value), d))
              }
              style={input()}
            />
            <input
              placeholder="Date (e.g. October 15, 2025)"
              value={n.date || ""}
              onChange={(e) =>
                update((d) => ((d.items[idx].date = e.target.value), d))
              }
              style={input()}
            />
          </div>

          {/* Upload only */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Upload Image</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickImage(idx, e.target.files?.[0])}
              disabled={uploadingIndex === idx}
            />
            {uploadingIndex === idx && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                Uploading…
              </div>
            )}
          </div>

          {n.imageUrl ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Preview</div>
              <img
                src={n.imageUrl}
                alt=""
                style={{
                  width: "100%",
                  maxWidth: 420,
                  borderRadius: 10,
                  border: "1px solid #eee",
                }}
              />
            </div>
          ) : null}

          <textarea
            placeholder="Excerpt (short text)"
            value={n.excerpt || ""}
            onChange={(e) =>
              update((d) => ((d.items[idx].excerpt = e.target.value), d))
            }
            style={{ ...input(), marginTop: 10, minHeight: 90 }}
          />

          <textarea
            placeholder="More text (shows when Learn More clicked)"
            value={n.moreText || ""}
            onChange={(e) =>
              update((d) => ((d.items[idx].moreText = e.target.value), d))
            }
            style={{ ...input(), marginTop: 10, minHeight: 110 }}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        style={btnPrimary(saving)}
      >
        {saving ? "Saving..." : "Save News"}
      </button>
    </div>
  );
}

function input() {
  return {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    width: "100%",
  };
}
function box() {
  return {
    border: "1px solid #e6e6e6",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    background: "#fff",
  };
}
function btn() {
  return {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #b30000",
    background: "#fff",
    cursor: "pointer",
    color: "#b30000",
    fontWeight: 700,
  };
}
function btnDanger() {
  return {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ffb3b3",
    background: "#fff0f0",
    cursor: "pointer",
    color: "#8a0b0b",
  };
}
function btnPrimary(disabled) {
  return {
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid #111",
    background: disabled ? "#eee" : "#111",
    color: disabled ? "#666" : "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    marginTop: 16,
  };
}
