import { useEffect, useState } from "react";

function Banners() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [status, setStatus] = useState("");

  // Load existing banner
  useEffect(() => {
    fetch("http://localhost:3001/api/banner")
      .then(res => res.json())
      .then(data => {
        setImageUrl(data.imageUrl || "");
      });
  }, []);

  async function saveBanner(e) {
    e.preventDefault();
    let finalImageUrl = imageUrl;

    // Upload new image if selected
    if (newImage) {
      const formData = new FormData();
      formData.append("image", newImage);

      const uploadRes = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadRes.json();
      finalImageUrl = uploadData.imageUrl;
    }

    await fetch("http://localhost:3001/api/banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: finalImageUrl
      })
    });

    setImageUrl(finalImageUrl);
    setNewImage(null);
    setStatus("Saved successfully ✅");
  }

  async function deleteBanner() {
    await fetch("http://localhost:3001/api/banner", {
      method: "DELETE"
    });
    setImageUrl("");
    setNewImage(null);
    setStatus("Banner deleted 🗑️");
  }

  return (
    <div style={{ padding: 40 }}>   
      <h2>Home Banner</h2>

      <form onSubmit={saveBanner}>

        {imageUrl && (
          <div style={{ marginBottom: "10px" }}>
            <img
              src={`http://localhost:3001${imageUrl}`}
              alt="Banner"
              style={{ width: "100%", maxHeight: "800px", objectFit: "cover" }}
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={e => setNewImage(e.target.files[0])}
        />

        <div style={{ marginTop: "15px" }}>
          <button type="submit">Save Changes</button>
          <button
            type="button"
            onClick={deleteBanner}
            style={{ marginLeft: "10px", background: "#b00020", color: "white" }}
          >
            Delete Banner
          </button>
        </div>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}

export default Banners;
