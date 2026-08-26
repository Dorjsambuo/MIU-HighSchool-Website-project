async function loadLang(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error("lang file not found");
    const dict = await res.json();

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    localStorage.setItem("site-lang", lang);

    // ➕ НЭМСЭН МӨР: dynamic (MongoDB-с ирдэг) content-ийг дахин ачаална
    if (Array.isArray(window.onLangChange)) {
      window.onLangChange.forEach((fn) => fn());
    }

    const toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.classList.remove("mn", "en");
      toggle.classList.add(lang);
    }
  } catch (err) {
    console.error("Хэл ачаалахад алдаа гарлаа:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("site-lang") || "mn";
  const toggle = document.getElementById("lang-toggle");

  if (toggle) {
    // 1. Анх ачаалагдах үед гулсах анимацийг түр зогсооно
    const slider = toggle.querySelector(".lang-slider");
    if (slider) slider.style.transition = "none";

    // 2. Хэлийг шууд тохируулна
    toggle.classList.remove("mn", "en");
    toggle.classList.add(saved);

    // 3. Товчлуурыг байранд нь оруулсны дараа transition-ийг буцааж идэвхжүүлнэ
    setTimeout(() => {
      if (slider) slider.style.transition = "";
    }, 50);

    // 4. Дарах үйлдэл
    toggle.addEventListener("click", () => {
      const current = localStorage.getItem("site-lang") || "mn";
      const next = current === "mn" ? "en" : "mn";
      loadLang(next);
    });
  }

  loadLang(saved);
});
