// src/pages/ArticleList.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    loadArticles();
  }, []);

  async function deleteArticle(id) {
  const token = localStorage.getItem("token");

  if (!window.confirm("Delete this article?")) return;

  await axios.delete(`http://localhost:3001/articles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  window.location.reload();
}


  async function loadArticles() {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:3001/articles", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setArticles(res.data);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Articles</h1>

      {articles.map((a) => (
        <div key={a.id} style={{ marginBottom: 30 }}>
          <h2>{a.title}</h2>
          <p>{a.content}</p>

          <button onClick={() => deleteArticle(a.id)}>
          Delete
          </button>

          {a.image && (
            <img
              src={`http://localhost:3001/uploads/${a.image}`}
              alt=""
              width="200"
            />
          )}
          <hr />
        </div>
      ))}
      <a
        href="/home.html"
        style={{
          position: "fixed",
          top: "15px",
          right: "15px",
          padding: "8px 12px",
          border: "1px solid #ccc",
          textDecoration: "none",
          background: "#fff"
        }}
      >
        ← Back to Website
      </a>
    </div>
  );
}
