import { useEffect, useState } from "react";

const API = "http://localhost:3001";

export default function Mission() {
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Backend-ээс мэдээлэл авах
  useEffect(() => {
    fetch(`${API}/api/mission-vision`)
      .then((res) => res.json())
      .then((data) => {
        // Хэрэв шинэ sections бүтэц байгаа бол
        if (Array.isArray(data.sections)) {
          setSections(data.sections);
        } else {
          // Хуучин mission + vision data-г шинэ бүтэц рүү хөрвүүлнэ
          setSections([
            {
              id: 1,
              title: "Our Mission",
              content: data.mission || "",
            },
            {
              id: 2,
              title: "Our Vision",
              content: data.vision || "",
            },
          ]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load Mission & Vision:", error);
        setLoading(false);
      });
  }, []);

  // Шинэ container нэмэх
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: "New Section",
      content: "",
    };

    setSections((prev) => [...prev, newSection]);
  };

  // Title өөрчлөх
  const updateTitle = (id, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, title: value } : section,
      ),
    );
  };

  // Content өөрчлөх
  const updateContent = (id, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, content: value } : section,
      ),
    );
  };

  // Container устгах
  const deleteSection = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this section?",
    );

    if (!confirmed) return;

    setSections((prev) => prev.filter((section) => section.id !== id));
  };

  // Бүх мэдээллийг хадгалах
  const save = async () => {
    try {
      setSaving(true);

      const response = await fetch(`${API}/api/mission-vision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections,
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      alert("Mission & Vision saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save Mission & Vision");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h2 style={styles.heading}>Mission & Vision</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.heading}>Mission & Vision</h2>

        <button type="button" onClick={addSection} style={styles.addButton}>
          + Add Section
        </button>
      </div>

      {/* Container-ууд */}
      <div style={styles.grid}>
        {sections.map((section) => (
          <div key={section.id} style={styles.card}>
            {/* Title */}
            <label style={styles.label}>Title</label>

            <input
              type="text"
              value={section.title}
              onChange={(e) => updateTitle(section.id, e.target.value)}
              style={styles.input}
            />

            {/* Content */}
            <label style={styles.label}>Content</label>

            <textarea
              value={section.content}
              onChange={(e) => updateContent(section.id, e.target.value)}
              rows={7}
              style={styles.textarea}
              placeholder="Write your content here..."
            />

            {/* Buttons */}
            <button
              type="button"
              onClick={() => deleteSection(section.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={styles.saveArea}>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? "Saving..." : "Save All"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    background: "#f5f6f8",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  heading: {
    margin: 0,
    color: "#c8102e",
    fontSize: "32px",
  },

  addButton: {
    border: "none",
    background: "#c8102e",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "25px",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "10px",
    fontWeight: "600",
    color: "#333",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    marginBottom: "10px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    resize: "vertical",
    minHeight: "150px",
  },

  deleteButton: {
    marginTop: "15px",
    background: "#333",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  saveArea: {
    marginTop: "30px",
    paddingBottom: "30px",
  },

  saveButton: {
    background: "#c8102e",
    color: "#fff",
    border: "none",
    padding: "13px 30px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
