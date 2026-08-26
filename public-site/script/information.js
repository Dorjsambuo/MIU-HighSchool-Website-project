// script/information.js

const API_BASE = "http://localhost:3001"; // change later when deployed

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toAbsUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ---------------- Banner (optional) ---------------- */
async function loadBanner() {
  try {
    const header = document.querySelector(".page-header");
    if (!header) return;

    // If you have /api/banner already, keep this. If not, delete this function.
    const data = await fetchJson(`${API_BASE}/api/banner`);
    if (!data?.imageUrl) return;

    header.style.backgroundImage = `url("${toAbsUrl(data.imageUrl)}?v=${Date.now()}")`;
  } catch (e) {
    // silently ignore banner failures
    console.warn("Banner not loaded:", e.message);
  }
}

/* ---------------- News ---------------- */
async function loadNews() {
  const titleEl = document.getElementById("news-title");
  const subtitleEl = document.getElementById("news-subtitle");
  const gridEl = document.getElementById("news-grid");
  if (!gridEl) return;

  try {
    const raw = await fetchJson(`${API_BASE}/api/news`);

    // support both shapes
    const data = Array.isArray(raw)
      ? { sectionTitle: "News", sectionSubtitle: "", items: raw }
      : {
          sectionTitle: raw.sectionTitle || raw.title || "News",
          sectionSubtitle: raw.sectionSubtitle || raw.subtitle || "",
          items: Array.isArray(raw.items) ? raw.items : [],
        };

    if (titleEl) titleEl.textContent = data.sectionTitle || "";
    if (subtitleEl) subtitleEl.textContent = data.sectionSubtitle || "";

    if (!data.items.length) {
      gridEl.innerHTML = "<p>No news yet.</p>";
      return;
    }

    gridEl.innerHTML = data.items
      .map((n) => {
        const img = n.imageUrl ? toAbsUrl(n.imageUrl) : "";
        const title = escapeHtml(n.title || "");
        const date = escapeHtml(n.date || "");
        const excerpt = escapeHtml(n.excerpt || n.body || "");
        const more = escapeHtml(n.moreText || "");

        return `
          <div class="news-card">
            ${img ? `<img class="news-img" src="${img}" alt="">` : ""}
            <h3>${title}</h3>
            ${date ? `<small>${date}</small>` : ""}
            <p>${excerpt}</p>

            ${more ? `<div class="news-more"><p>${more}</p></div>` : ""}
            ${more ? `<a href="#" class="news-toggle">Learn More</a>` : ""}
          </div>
        `;
      })
      .join("");
  } catch (e) {
    console.error("loadNews failed:", e);
    gridEl.innerHTML = "<p>Failed to load news.</p>";
  }
}

/* ---------------- FAQ ---------------- */
async function loadFaq() {
  const titleEl = document.getElementById("faq-title");
  const subtitleEl = document.getElementById("faq-subtitle");
  const listEl = document.getElementById("faq-list");
  if (!listEl) return;

  try {
    const raw = await fetchJson(`${API_BASE}/api/faq`);

    const data = Array.isArray(raw)
      ? {
          sectionTitle: "Frequently Asked Questions",
          sectionSubtitle: "Find answers to common questions",
          items: raw,
        }
      : {
          sectionTitle: raw.sectionTitle || "Frequently Asked Questions",
          sectionSubtitle:
            raw.sectionSubtitle || "Find answers to common questions",
          items: Array.isArray(raw.items) ? raw.items : [],
        };

    if (titleEl) titleEl.textContent = data.sectionTitle;
    if (subtitleEl) subtitleEl.textContent = data.sectionSubtitle;

    if (!data.items.length) {
      listEl.innerHTML = "<p>No questions yet.</p>";
      return;
    }

    listEl.innerHTML = data.items
      .map(
        (x) => `
        <div class="faq-item">
          <div class="faq-question">
            <span>${escapeHtml(x.question)}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="faq-answer">
            <p>${escapeHtml(x.answer)}</p>
          </div>
        </div>
      `,
      )
      .join("");
  } catch (e) {
    console.error("loadFaq failed:", e);
    listEl.innerHTML = "<p>Failed to load FAQ.</p>";
  }
}

/* ---------------- Click handlers (works with dynamic content) ---------------- */
document.addEventListener("click", (e) => {
  // FAQ accordion
  const q = e.target.closest(".faq-question");
  if (q) {
    const item = q.closest(".faq-item");
    if (item) item.classList.toggle("active");
    return;
  }

  // News expand/collapse
  const btn = e.target.closest(".news-toggle");
  if (btn) {
    e.preventDefault();
    const card = btn.closest(".news-card");
    if (!card) return;
    card.classList.toggle("expanded");
    btn.textContent = card.classList.contains("expanded")
      ? "Show Less"
      : "Learn More";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadBanner(); // optional
  loadNews();
  loadFaq();
});
