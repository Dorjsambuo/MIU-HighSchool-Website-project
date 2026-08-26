import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3001";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(y, mIndex, d) {
  // mIndex is 0-11
  return `${y}-${pad2(mIndex + 1)}-${pad2(d)}`;
}

// Monday-first calendar (Mon=0 ... Sun=6)
function mondayIndexOfJSDate(jsDay /* 0 Sun..6 Sat */) {
  return (jsDay + 6) % 7;
}

function monthLabel(date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function CalendarAdmin() {
  const [current, setCurrent] = useState(() => new Date(2025, 8, 1)); // Sep 2025
  const [events, setEvents] = useState({}); // { "YYYY-MM-DD": {type,title,fullDesc} }
  const [selectedISO, setSelectedISO] = useState(null);
  const [draft, setDraft] = useState({ type: "academic", title: "", fullDesc: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/calendar`);
        const data = await res.json();
        setEvents(data?.events || {});
      } catch (e) {
        console.error(e);
        setEvents({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // build month grid
  const year = current.getFullYear();
  const month = current.getMonth(); // 0-11

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDow = useMemo(() => mondayIndexOfJSDate(new Date(year, month, 1).getDay()), [year, month]);

  const monthDays = useMemo(() => {
    const cells = [];
    // leading blanks
    for (let i = 0; i < firstDow; i++) cells.push(null);
    // actual days
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // trailing blanks to keep full rows (optional)
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [firstDow, daysInMonth]);

  // open editor on day click
  function openDay(day) {
    const iso = toISODate(year, month, day);
    setSelectedISO(iso);

    if (events[iso]) {
      setDraft({
        type: events[iso].type || "academic",
        title: events[iso].title || "",
        fullDesc: events[iso].fullDesc || "",
      });
    } else {
      // default draft
      const monthName = current.toLocaleString("en-US", { month: "long" });
      setDraft({
        type: "academic",
        title: "",
        fullDesc: `${monthName} ${day}: `,
      });
    }
  }

  function removeSelectedEvent() {
    if (!selectedISO) return;
    const copy = { ...events };
    delete copy[selectedISO];
    setEvents(copy);
    setSelectedISO(null);
  }

  function saveSelectedEvent() {
    if (!selectedISO) return;

    // If title + fullDesc are empty, treat as remove
    const title = draft.title.trim();
    const fullDesc = draft.fullDesc.trim();

    const copy = { ...events };
    copy[selectedISO] = {
      type: draft.type || "academic",
      title,
      fullDesc: fullDesc || title,
    };
    setEvents(copy);
  }

  async function saveAllToBackend() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/calendar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Saved!");
    } catch (e) {
      console.error(e);
      alert("Save failed. Check backend + CORS.");
    } finally {
      setSaving(false);
    }
  }

  // events for this month (for preview list)
  const monthKey = `${year}-${pad2(month + 1)}-`;
  const monthEvents = Object.entries(events)
    .filter(([iso]) => iso.startsWith(monthKey))
    .sort(([a], [b]) => a.localeCompare(b));

  if (loading) return <div style={{ padding: 20 }}>Loading calendar...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))}>{"<"}</button>
        <h2 style={{ margin: 0, minWidth: 220, textAlign: "center" }}>{monthLabel(current)}</h2>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))}>{">"}</button>

        <div style={{ flex: 1 }} />
        <button onClick={saveAllToBackend} disabled={saving}>
          {saving ? "Saving..." : "Save Calendar"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Calendar */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 3px 15px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 10, fontWeight: 600 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} style={{ textAlign: "center" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {monthDays.map((day, idx) => {
              if (!day) return <div key={idx} style={{ height: 56 }} />;

              const iso = toISODate(year, month, day);
              const ev = events[iso];
              const isSelected = selectedISO === iso;

              // simple styling by type
              let border = "1px solid #eee";
              let bg = "#fff";
              if (ev?.type === "holiday") bg = "#ffebee";
              if (ev?.type === "academic") bg = "#e3f2fd";
              if (isSelected) border = "2px solid #c52233";

              return (
                <button
                  key={idx}
                  onClick={() => openDay(day)}
                  style={{
                    height: 56,
                    borderRadius: 10,
                    border,
                    background: bg,
                    position: "relative",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  title={ev ? ev.title : "No event"}
                >
                  {day}
                  {ev && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: "#c52233",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 3px 15px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0 }}>Edit Date</h3>

          {!selectedISO ? (
            <div style={{ color: "#666" }}>Click a date to add/edit an event.</div>
          ) : (
            <>
              <div style={{ marginBottom: 10, fontWeight: 700 }}>{selectedISO}</div>

              <label style={{ display: "block", marginBottom: 6 }}>Type</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
              >
                <option value="academic">Academic</option>
                <option value="holiday">Holiday</option>
                <option value="event">Event</option>
              </select>

              <label style={{ display: "block", marginBottom: 6 }}>Title (short)</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Mid-term Exams"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
              />

              <label style={{ display: "block", marginBottom: 6 }}>Full description (bottom list)</label>
              <textarea
                value={draft.fullDesc}
                onChange={(e) => setDraft((d) => ({ ...d, fullDesc: e.target.value }))}
                rows={5}
                placeholder="e.g. October 27-31: Mid-term examinations for all grades"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveSelectedEvent} style={{ flex: 1 }}>
                  Apply
                </button>
                <button onClick={removeSelectedEvent} style={{ flex: 1, background: "#ffecec" }}>
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview list */}
      <div style={{ marginTop: 18, background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 3px 15px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>{current.toLocaleString("en-US", { month: "long" })} Important Dates</h3>

        {monthEvents.length === 0 ? (
          <div style={{ color: "#666" }}>No scheduled events for this month</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {monthEvents.map(([iso, ev]) => (
              <li key={iso} style={{ marginBottom: 8 }}>
                <strong>{iso}</strong> — {ev.fullDesc || ev.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
