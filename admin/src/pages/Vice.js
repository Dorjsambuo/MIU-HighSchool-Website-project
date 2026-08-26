import { useEffect, useState } from "react";

export default function Vice() {
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);

  const [title, setTitle] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [signatureHtml, setSignatureHtml] = useState("");

  const API = "http://localhost:3001";

  useEffect(() => {
    fetch(`${API}/api/vice`)
      .then((res) => res.json())
      .then((data) => {
        setImage(data.imageUrl || "");
        setTitle(data.title || "");
        setP1(data.p1 || "");
        setP2(data.p2 || "");
        setSignatureHtml(data.signatureHtml || "");
      });
  }, []);

  async function uploadImage() {
    if (!file) return image;

    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`${API}/api/upload`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    return data.imageUrl;
  }

  async function saveVice() {
    const imageUrl = await uploadImage();

    await fetch(`${API}/api/vice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl,
        title,
        p1,
        p2,
        signatureHtml,
      }),
    });

    alert("Vice greeting saved");
  }

  return (
    <div>
      <h2>Vice Greeting</h2>

      {image && <img src={image} style={{ maxWidth: "400px" }} />}

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea value={p1} onChange={(e) => setP1(e.target.value)} />
      <textarea value={p2} onChange={(e) => setP2(e.target.value)} />
      <textarea
        value={signatureHtml}
        onChange={(e) => setSignatureHtml(e.target.value)}
        placeholder="Use <br/> for line breaks"
      />

      <button onClick={saveVice}>Save</button>
    </div>
  );
}
