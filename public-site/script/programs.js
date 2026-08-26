document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 120,
            behavior: "smooth",
          });
        }
      }
    });
  });

  updateBreadcrumb();

  function updateBreadcrumb() {
    const breadcrumbLinks = document.querySelector(".breadcrumb-links");
    if (!breadcrumbLinks) return;

    const currentPage = window.location.pathname.split("/").pop();
    let pageName = "Home";

    switch (currentPage) {
      case "programs.html":
        pageName = "Programs";
        break;
      case "admissions.html":
        pageName = "Admissions";
        break;
      case "information.html":
        pageName = "Information";
        break;
      case "contact.html":
        pageName = "Contact";
        break;
      default:
        pageName = "Home";
    }

    breadcrumbLinks.innerHTML = `
      <a href="index.html">Home</a>
      ${currentPage !== "index.html" ? "<span>›</span>" : ""}
      ${currentPage !== "index.html" ? `<span>${pageName}</span>` : ""}
    `;
  }

  document.querySelectorAll(".news-toggle").forEach((button) => {
    button.addEventListener("click", function () {
      const newsCard = this.closest(".news-card");
      newsCard.classList.toggle("expanded");
      this.textContent = newsCard.classList.contains("expanded")
        ? "Show Less"
        : "Learn More";
    });
  });
});

const API_BASE = "http://localhost:3001";

// Зургийн замын формат засах туслах функц
function getImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  let cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  if (!cleanPath.startsWith("/uploads/")) {
    cleanPath = `/uploads${cleanPath}`;
  }
  return `${API_BASE}${cleanPath}`;
}

async function loadBanner() {
  try {
    const res = await fetch(`${API_BASE}/api/banner`);
    const data = await res.json();

    const header = document.querySelector(".page-header");
    if (!header || !data.imageUrl) return;

    const imgUrl = getImageUrl(data.imageUrl);
    header.style.backgroundImage = `url("${imgUrl}?v=${Date.now()}")`;
  } catch (err) {
    console.error("Banner failed to load", err);
  }
}

document.addEventListener("DOMContentLoaded", loadBanner);

// Month state
let current = new Date(2026, 8, 1);
let eventsByDate = {};

function pad2(n) {
  return String(n).padStart(2, "0");
}
function isoDate(y, mIndex, d) {
  return `${y}-${pad2(mIndex + 1)}-${pad2(d)}`;
}

function mondayIndex(jsDay) {
  return (jsDay + 6) % 7;
}

async function loadCalendar() {
  try {
    const res = await fetch(`${API_BASE}/api/calendar`);
    const data = await res.json();
    eventsByDate = data?.events || {};
  } catch (e) {
    console.error("Failed to load calendar:", e);
    eventsByDate = {};
  }
}

function renderCalendar() {
  const monthTitle = document.getElementById("current-month");
  const calendarDays = document.getElementById("calendar-days");
  const explanationTitle = document.getElementById("month-explanation-title");
  const explanationList = document.getElementById("explanation-list");

  if (!calendarDays || !explanationList) return;

  const year = current.getFullYear();
  const month = current.getMonth();

  const monthName = current.toLocaleString("en-US", { month: "long" });
  if (monthTitle) monthTitle.textContent = `${monthName} ${year}`;
  if (explanationTitle)
    explanationTitle.textContent = `${monthName} Important Dates`;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = mondayIndex(new Date(year, month, 1).getDay());

  let calendarHTML = "";

  for (let i = 0; i < firstDow; i++) calendarHTML += '<div class="day"></div>';

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = isoDate(year, month, day);
    const ev = eventsByDate[iso];

    let dayClass = "day";
    let dotHTML = "";

    if (ev) {
      dayClass += ` ${ev.type || "event"}`;
      dotHTML = '<div class="event-dot"></div>';
    }

    calendarHTML += `
        <div class="${dayClass}" data-iso="${iso}">
          <span>${day}</span>
          ${dotHTML}
        </div>
      `;
  }

  calendarDays.innerHTML = calendarHTML;

  const monthKey = `${year}-${pad2(month + 1)}-`;
  const monthEvents = Object.entries(eventsByDate)
    .filter(([iso]) => iso.startsWith(monthKey))
    .sort(([a], [b]) => a.localeCompare(b));

  let explanationHTML = "";
  if (monthEvents.length === 0) {
    explanationHTML =
      '<li class="explanation-item"><div class="event-desc">No scheduled events for this month</div></li>';
  } else {
    for (const [iso, ev] of monthEvents) {
      const dayNum = Number(iso.slice(-2));
      explanationHTML += `
          <li class="explanation-item">
            <div class="event-date">${monthName} ${dayNum}</div>
            <div class="event-desc">${ev.fullDesc || ev.title || ""}</div>
          </li>
        `;
    }
  }
  explanationList.innerHTML = explanationHTML;

  document.querySelectorAll(".day[data-iso]").forEach((el) => {
    el.addEventListener("click", () => {
      const iso = el.getAttribute("data-iso");
      const dayNum = Number(iso.slice(-2));
      highlightEventInList(monthName, dayNum);
    });
  });
}

function highlightEventInList(monthName, dayNum) {
  document.querySelectorAll(".explanation-item").forEach((item) => {
    const dateEl = item.querySelector(".event-date");
    if (!dateEl) return;

    if (dateEl.textContent.trim() === `${monthName} ${dayNum}`) {
      item.style.backgroundColor = "#ffebee";
      item.style.padding = "15px";
      item.style.borderRadius = "5px";
      item.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        item.style.backgroundColor = "";
        item.style.padding = "";
        item.style.borderRadius = "";
      }, 2000);
    }
  });
}

const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    renderCalendar();
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    renderCalendar();
  });
}

(async function init() {
  await loadCalendar();
  renderCalendar();
})();

async function loadActivities() {
  try {
    const grid = document.getElementById("activities-grid");
    if (!grid) return;

    const res = await fetch(`${API_BASE}/api/activities`);
    const data = await res.json();

    const titleEl = document.getElementById("activities-title");
    const subtitleEl = document.getElementById("activities-subtitle");
    if (titleEl) titleEl.textContent = data.title || "";
    if (subtitleEl) subtitleEl.textContent = data.subtitle || "";

    grid.innerHTML = "";

    (data.items || []).forEach((item) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      const fullImgUrl = getImageUrl(item.imageUrl);

      card.innerHTML = `
        <div class="activity-image" style="background-image:url('${fullImgUrl}')"></div>
        <div class="activity-content">
          <h3>${item.title || ""}</h3>
          <p>${item.description || ""}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load activities:", err);
  }
}

async function loadSpecialPrograms() {
  const titleEl = document.getElementById("special-programs-title");
  const subtitleEl = document.getElementById("special-programs-subtitle");
  const gridEl = document.getElementById("special-programs-grid");

  if (!gridEl) return;

  try {
    const res = await fetch(`${API_BASE}/api/special-programs`);
    if (!res.ok)
      throw new Error(`Special Programs fetch failed (${res.status})`);
    const data = await res.json();

    if (titleEl) titleEl.textContent = data.title || "";
    if (subtitleEl) subtitleEl.textContent = data.subtitle || "";

    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) {
      gridEl.innerHTML =
        "<p style='text-align:center;'>No special programs yet.</p>";
      return;
    }

    gridEl.innerHTML = items
      .map(
        (it) => `
      <div class="program-card">
        <div class="program-icon">
          <i class="${it.icon || "fas fa-star"}"></i>
        </div>
        <h3 style="color:#0f2d56;">${it.title || ""}</h3>
        <p>${it.description || ""}</p>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Failed to load special programs:", e);
  }
}

async function loadVolunteer() {
  try {
    const titleEl = document.getElementById("volunteer-title");
    const subtitleEl = document.getElementById("volunteer-subtitle");
    const gridEl = document.getElementById("volunteer-grid");
    if (!gridEl) return;

    const res = await fetch(`${API_BASE}/api/volunteer`);
    const data = await res.json();

    if (titleEl) titleEl.textContent = data.title || "";
    if (subtitleEl) subtitleEl.textContent = data.subtitle || "";

    const items = Array.isArray(data.items) ? data.items : [];

    gridEl.innerHTML = items
      .map((it) => {
        const img = getImageUrl(it.imageUrl);

        return `
        <div class="volunteer-card">
          <div class="volunteer-image" style="background-image:url('${img}')"></div>
          <div class="volunteer-content">
            <h3>${it.title || ""}</h3>
            <p>${it.description || ""}</p>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (err) {
    console.error("Failed to load volunteer programs:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadActivities();
  loadSpecialPrograms();
  loadVolunteer();
});
