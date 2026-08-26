import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

const DEFAULT_TUITION = {
  sectionTitle: "Tuition & Fees",
  sectionSubtitle: "Transparent pricing for quality education",
  cards: [
    {
      title: "Primary School",
      subtitle: "Grades 1-5",
      items: [
        { label: "Annual Tuition", amount: "3,600,000T" },
        { label: "Registration Fee", amount: "20,000T" },
        { label: "Technology Fee", amount: "20,000T" },
        { label: "Books & Materials", amount: "10,000T" },
      ],
    },
    {
      title: "Middle School",
      subtitle: "Grades 6-8",
      items: [
        { label: "Annual Tuition", amount: "3,600,000T" },
        { label: "Registration Fee", amount: "20,000T" },
        { label: "Technology Fee", amount: "20,000T" },
        { label: "Books & Materials", amount: "10,000T" },
      ],
    },
    {
      title: "High School",
      subtitle: "Grades 9-12",
      items: [
        { label: "Annual Tuition", amount: "3,600,000T" },
        { label: "Registration Fee", amount: "20,000T" },
        { label: "Technology Fee", amount: "20,000T" },
        { label: "Books & Materials", amount: "10,000T" },
      ],
    },
  ],
};

async function fetchTuition() {
  const res = await fetch(`${API_BASE}/api/tuition`);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Expected JSON but got: ${text.slice(0, 140)}`);
  }
  if (!res.ok) throw new Error(json?.error || `Load failed (${res.status})`);
  return json;
}

async function saveTuition(data) {
  const res = await fetch(`${API_BASE}/api/tuition`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Expected JSON but got: ${text.slice(0, 140)}`);
  }
  if (!res.ok) throw new Error(json?.error || `Save failed (${res.status})`);
  return json;
}

export default function Tuition() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (fn) => setData((prev) => fn(structuredClone(prev)));

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const doc = await fetchTuition();
        setData(doc || DEFAULT_TUITION);
      } catch (e) {
        setError(e.message || "Failed to load tuition");
        setData(DEFAULT_TUITION);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addCard = () =>
    update((d) => {
      d.cards.push({
        title: "New Level",
        subtitle: "Grades ?",
        items: [{ label: "Annual Tuition", amount: "0" }],
      });
      return d;
    });

  const deleteCard = (idx) =>
    update((d) => {
      d.cards.splice(idx, 1);
      if (d.cards.length === 0) d.cards = [];
      return d;
    });

  const addItem = (cardIdx) =>
    update((d) => {
      d.cards[cardIdx].items.push({ label: "New Fee", amount: "0" });
      return d;
    });

  const deleteItem = (cardIdx, itemIdx) =>
    update((d) => {
      d.cards[cardIdx].items.splice(itemIdx, 1);
      return d;
    });

  const onSave = async () => {
    setSaving(true);
    setError("");
    try {
      // sanitize shape (keep only what we use)
      const clean = {
        sectionTitle: String(data?.sectionTitle ?? ""),
        sectionSubtitle: String(data?.sectionSubtitle ?? ""),
        cards: Array.isArray(data?.cards)
          ? data.cards.map((c) => ({
              title: String(c?.title ?? ""),
              subtitle: String(c?.subtitle ?? ""),
              items: Array.isArray(c?.items)
                ? c.items.map((it) => ({
                    label: String(it?.label ?? ""),
                    amount: String(it?.amount ?? ""),
                  }))
                : [],
            }))
          : [],
      };

      await saveTuition(clean);
      alert("Saved ✅");
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!data) return <div style={{ padding: 16 }}>No data</div>;

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h2 style={{ marginTop: 0 }}>Tuition (CMS)</h2>

      {error && (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            color: "#7a0b0b",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>
          Section Title
          <input
            value={data.sectionTitle || ""}
            onChange={(e) =>
              update((d) => ((d.sectionTitle = e.target.value), d))
            }
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ fontWeight: 600 }}>
          Section Subtitle
          <input
            value={data.sectionSubtitle || ""}
            onChange={(e) =>
              update((d) => ((d.sectionSubtitle = e.target.value), d))
            }
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: "8px 0" }}>Cards</h3>
        <button type="button" onClick={addCard} style={btn()}>
          + Add Card
        </button>
      </div>

      {data.cards.map((card, cardIdx) => (
        <div key={cardIdx} style={cardBox()}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h4 style={{ margin: 0 }}>Card #{cardIdx + 1}</h4>
            <button type="button" onClick={() => deleteCard(cardIdx)} style={btnDanger()}>
              Delete Card
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <input
              placeholder="Card title (Primary School)"
              value={card.title || ""}
              onChange={(e) =>
                update((d) => ((d.cards[cardIdx].title = e.target.value), d))
              }
              style={input()}
            />
            <input
              placeholder="Card subtitle (Grades 1-5)"
              value={card.subtitle || ""}
              onChange={(e) =>
                update((d) => ((d.cards[cardIdx].subtitle = e.target.value), d))
              }
              style={input()}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Fee Items</strong>
              <button type="button" onClick={() => addItem(cardIdx)} style={btn()}>
                + Add Fee
              </button>
            </div>

            {(card.items || []).map((it, itemIdx) => (
              <div
                key={itemIdx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 220px 110px",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <input
                  placeholder="Label"
                  value={it.label || ""}
                  onChange={(e) =>
                    update((d) => ((d.cards[cardIdx].items[itemIdx].label = e.target.value), d))
                  }
                  style={input()}
                />
                <input
                  placeholder="Amount"
                  value={it.amount || ""}
                  onChange={(e) =>
                    update((d) => ((d.cards[cardIdx].items[itemIdx].amount = e.target.value), d))
                  }
                  style={input()}
                />
                <button
                  type="button"
                  onClick={() => deleteItem(cardIdx, itemIdx)}
                  style={btnDanger()}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={onSave} disabled={saving} style={btnPrimary(saving)}>
          {saving ? "Saving..." : "Save Tuition"}
        </button>
      </div>
    </div>
  );
}

function input() {
  return { padding: 10, borderRadius: 8, border: "1px solid #ccc", width: "100%" };
}
function cardBox() {
  return { border: "1px solid #e6e6e6", borderRadius: 10, padding: 12, marginTop: 12, background: "#fff" };
}
function btn() {
  return { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#f7f7f7", cursor: "pointer" };
}
function btnDanger() {
  return { padding: "10px 12px", borderRadius: 8, border: "1px solid #ffb3b3", background: "#fff0f0", cursor: "pointer", color: "#8a0b0b" };
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
  };
}
