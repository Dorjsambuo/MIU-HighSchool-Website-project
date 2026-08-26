// ============================================================
// BILINGUAL HELPER
// ============================================================
function currentLang() {
  return localStorage.getItem("lang") || "mn";
}

// Bilingual { en, mn } объектоос тухайн хэлний утгыг авна.
// Хуучин (single string) өгөгдөл байвал шууд буцаана - fallback.
function pick(field) {
  if (field && typeof field === "object") {
    return field[currentLang()] || field.en || field.mn || "";
  }
  return field || "";
}

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

/* =========================================================
   BANNER
   ========================================================= */

async function loadBanner() {
  try {
    const API_BASE = "http://localhost:3001";

    const res = await fetch(`${API_BASE}/api/banner`);
    const data = await res.json();

    const header = document.querySelector(".page-header");

    if (!header || !data.imageUrl) return;

    // If backend returns "/uploads/xxx.jpg", make it absolute
    const imgUrl = data.imageUrl.startsWith("http")
      ? data.imageUrl
      : `${API_BASE}${data.imageUrl}`;

    // Cache-bust so replacing the same filename updates immediately
    header.style.backgroundImage = `url("${imgUrl}?v=${Date.now()}")`;
  } catch (err) {
    console.error("Banner failed to load", err);
  }
}

document.addEventListener("DOMContentLoaded", loadBanner);

/* =========================================================
   VICE PRINCIPAL
   ========================================================= */

async function loadVice() {
  try {
    const API = "http://localhost:3001";

    const res = await fetch(`${API}/api/vice`);
    const data = await res.json();

    if (!data) return;

    const img = document.getElementById("vice-img");
    const title = document.getElementById("vice-title");
    const p1 = document.getElementById("vice-p1");
    const p2 = document.getElementById("vice-p2");
    const sign = document.getElementById("vice-sign");

    if (img && data.imageUrl) {
      const src = data.imageUrl.startsWith("http")
        ? data.imageUrl
        : `${API}${data.imageUrl}`;

      // cache bust
      img.src = `${src}?v=${Date.now()}`;
    }

    if (title) {
      title.textContent = pick(data.title);
    }

    if (p1) {
      p1.textContent = pick(data.p1);
    }

    if (p2) {
      p2.textContent = pick(data.p2);
    }

    if (sign) {
      sign.innerHTML = pick(data.signatureHtml);
    }
  } catch (err) {
    console.error("Failed to load vice greeting:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadVice);

/* =========================================================
   MISSION & VISION
   ========================================================= */

async function loadMissionVision() {
  try {
    const API = "http://localhost:3001";

    const res = await fetch(`${API}/api/mission-vision`);

    if (!res.ok) {
      throw new Error("Failed to fetch mission/vision");
    }

    const data = await res.json();

    /* -----------------------------------------------------
       Existing Mission
       ----------------------------------------------------- */

    const missionEl = document.getElementById("mission-text");

    if (missionEl) {
      missionEl.textContent = pick(data.mission);
    }

    /* -----------------------------------------------------
       Existing Vision
       ----------------------------------------------------- */

    const visionEl = document.getElementById("vision-text");

    if (visionEl) {
      visionEl.textContent = pick(data.vision);
    }

    /* -----------------------------------------------------
       Dynamic Sections
       ----------------------------------------------------- */

    if (!Array.isArray(data.sections)) {
      console.warn("Mission/Vision sections is not an array");
      return;
    }

    /* -----------------------------------------------------
       Find existing Mission & Vision section
       ----------------------------------------------------- */

    if (!missionEl) {
      console.warn("mission-text element not found");
      return;
    }

    const missionSection = missionEl.closest("section");

    if (!missionSection) {
      console.warn("Mission & Vision section not found");
      return;
    }

    /* -----------------------------------------------------
       Remove previously generated dynamic sections
       ----------------------------------------------------- */

    const oldContainer = missionSection.querySelector(
      ".dynamic-mission-sections",
    );

    if (oldContainer) {
      oldContainer.remove();
    }

    /* -----------------------------------------------------
       Create dynamic section container
       ----------------------------------------------------- */

    const dynamicContainer = document.createElement("div");

    dynamicContainer.className = "dynamic-mission-sections";

    /* -----------------------------------------------------
       IMPORTANT

       MongoDB currently contains:

       0 → Our Mission
       1 → Our Vision
       2 → New section

       We already display Mission and Vision using the
       existing HTML above.

       Therefore only sections after the first two
       should become new cards.
       ----------------------------------------------------- */

    const dynamicSections = data.sections.slice(2);

    /* -----------------------------------------------------
       Create each new section
       ----------------------------------------------------- */

    dynamicSections.forEach((section) => {
      const card = document.createElement("div");

      card.className = "dynamic-mission-card";

      /* Title */

      const title = document.createElement("h3");

      title.textContent = section.title || "";

      /* Content */

      const content = document.createElement("p");

      content.textContent = pick(section.content);

      /* Add title and content to card */

      card.appendChild(title);
      card.appendChild(content);

      /* Add card to container */

      dynamicContainer.appendChild(card);
    });

    /* -----------------------------------------------------
       Only add container if there are new sections
       ----------------------------------------------------- */

    if (dynamicSections.length > 0) {
      missionSection.appendChild(dynamicContainer);
    }
  } catch (e) {
    console.error("Mission/Vision load failed:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadVice();
  loadMissionVision();
});

/* =========================================================
   SUCCESS
   ========================================================= */

async function loadSuccess() {
  try {
    const res = await fetch("http://localhost:3001/api/success");

    const data = await res.json();

    const subtitle = document.getElementById("success-subtitle");

    const graduates = document.getElementById("success-graduates");

    const awards = document.getElementById("success-awards");

    const community = document.getElementById("success-community");

    if (subtitle) {
      subtitle.textContent = pick(data.subtitle);
    }

    if (graduates) {
      graduates.textContent = pick(data.graduates);
    }

    if (awards) {
      awards.textContent = pick(data.awards);
    }

    if (community) {
      community.textContent = pick(data.community);
    }
  } catch (e) {
    console.error("Failed to load success section:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadVice();
  loadMissionVision();
  loadSuccess();
});

/* =========================================================
   CAFETERIA
   ========================================================= */

async function loadCafeteria() {
  try {
    const res = await fetch("http://localhost:3001/api/cafeteria");

    if (!res.ok) {
      throw new Error("Failed to fetch cafeteria");
    }

    const data = await res.json();

    /* -----------------------------------------------------
       Text content
       ----------------------------------------------------- */

    const title = document.getElementById("cafeteria-title");

    const subtitle = document.getElementById("cafeteria-subtitle");

    const heading = document.getElementById("cafeteria-heading");

    const text = document.getElementById("cafeteria-text");

    if (title) {
      title.textContent = pick(data.title);
    }

    if (subtitle) {
      subtitle.textContent = pick(data.subtitle);
    }

    if (heading) {
      heading.textContent = pick(data.heading);
    }

    if (text) {
      text.textContent = pick(data.text);
    }

    /* -----------------------------------------------------
       Image
       ----------------------------------------------------- */

    const img = document.getElementById("cafeteria-img");

    const placeholder = document.getElementById("cafeteria-placeholder");

    if (data.imageUrl) {
      if (img) {
        img.src = data.imageUrl.startsWith("http")
          ? data.imageUrl
          : `http://localhost:3001${data.imageUrl}`;

        img.style.display = "block";
      }

      if (placeholder) {
        placeholder.style.display = "none";
      }
    } else {
      if (img) {
        img.style.display = "none";
      }

      if (placeholder) {
        placeholder.style.display = "flex";
      }
    }
  } catch (e) {
    console.error("Cafeteria load failed:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadVice();
  loadMissionVision();
  loadSuccess();
  loadCafeteria();
});

/* =========================================================
   RE-RENDER ON LANGUAGE CHANGE
   (i18n.js-ийн window.onLangChange hook-той нэгддэг)
   ========================================================= */

window.onLangChange = window.onLangChange || [];
window.onLangChange.push(() => {
  loadVice();
  loadMissionVision();
  loadSuccess();
  loadCafeteria();
});
