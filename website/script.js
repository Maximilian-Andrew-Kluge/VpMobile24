/* ==========================================================================
   VpMobile24 — Website JS (vanilla, no dependencies)
   ========================================================================== */
(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Theme switcher (dark / light / system) ---------- */
  const THEME_KEY = "vpm24-theme";
  const root = document.documentElement;
  const themeBtn = $("#themeBtn");
  const order = ["dark", "light", "system"];

  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function applyTheme(mode) {
    const effective = mode === "system" ? (systemDark() ? "dark" : "light") : mode;
    root.setAttribute("data-theme", effective);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", effective === "dark" ? "#070B14" : "#F5F7FB");
    if (themeBtn) themeBtn.title = "Theme: " + mode + " (klicken zum Wechseln)";
  }
  let themeMode = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(themeMode);
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      themeMode = order[(order.indexOf(themeMode) + 1) % order.length];
      localStorage.setItem(THEME_KEY, themeMode);
      applyTheme(themeMode);
    });
  }
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (themeMode === "system") applyTheme("system");
    });
  }

  /* ---------- Nav: blur on scroll + scroll progress ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 12);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    const st = $("#scrollTop");
    if (st) st.classList.toggle("visible", y > 400);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  const scrollTopBtn = $("#scrollTop");
  if (scrollTopBtn) scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile drawer ---------- */
  const drawer = $("#drawer");
  const burger = $("#burger");
  function openDrawer() { if (drawer) { drawer.classList.add("open"); burger && burger.setAttribute("aria-expanded", "true"); } }
  function closeDrawer() { if (drawer) { drawer.classList.remove("open"); burger && burger.setAttribute("aria-expanded", "false"); } }
  if (burger) burger.addEventListener("click", openDrawer);
  if ($("#drawerClose")) $("#drawerClose").addEventListener("click", closeDrawer);
  $$(".drawer-links a").forEach(a => a.addEventListener("click", closeDrawer));

  /* ---------- Smooth scroll for in-page anchors ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });

  /* ---------- Active nav section highlight ---------- */
  const navLinks = $$(".nav-links a");
  const sections = $$("section[id], header[id]");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => obs.observe(s));
  }

  /* ---------- Scroll reveal ---------- */
  if ("IntersectionObserver" in window) {
    const rObs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(el => rObs.observe(el));
  } else {
    $$(".reveal").forEach(el => el.classList.add("in"));
  }

  /* ---------- Tabs (installation) ---------- */
  $$(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.tab;
      $$(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".tab-content").forEach(c => c.classList.remove("active"));
      const el = $("#tab-" + id);
      if (el) el.classList.add("active");
    });
  });

  /* ---------- Copy buttons (event delegation) ---------- */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  document.addEventListener("click", e => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    let text = btn.dataset.copy;
    if (btn.dataset.copyPre) {
      const pre = btn.parentElement.querySelector("pre code, .code-pre code");
      text = pre ? pre.textContent.trim() : "";
    }
    if (!text) return;
    copyToClipboard(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = "✓ Kopiert!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = orig; btn.classList.remove("copied"); }, 1800);
    }).catch(() => {});
  });

  /* ---------- Interactive demo ---------- */
  const DEMO = {
    0: { date: "Mo, 22. Sep", today: true, lessons: [
      { t: "08:00", s: "Mathematik", teach: "Müller", room: "201", type: "normal" },
      { t: "08:50", s: "Deutsch", teach: "Schmidt", room: "103", type: "normal" },
      { pause: "09:35 – 09:50" },
      { t: "09:50", s: "Englisch", teach: "Weber", room: "204", type: "normal" },
      { t: "10:40", s: "Physik", teach: "—", room: "—", type: "cancel" },
      { t: "11:30", s: "Sport", teach: "Koch", room: "Halle", type: "normal" }
    ]},
    1: { date: "Di, 23. Sep", lessons: [
      { t: "08:00", s: "Biologie", teach: "Grün", room: "Bio1", type: "normal" },
      { t: "08:50", s: "Mathematik", teach: "Müller", room: "201", type: "normal" },
      { pause: "09:35 – 09:50" },
      { t: "09:50", s: "Vertretung", teach: "Braun → Schulz", room: "108", type: "sub" },
      { t: "10:40", s: "Kunst", teach: "Rose", room: "Kunst", type: "normal" }
    ]},
    2: { date: "Mi, 24. Sep", lessons: [
      { t: "08:00", s: "Deutsch", teach: "Schmidt", room: "103", type: "normal" },
      { t: "08:50", s: "Englisch", teach: "Weber", room: "204", type: "normal" },
      { pause: "09:35 – 09:50" },
      { t: "09:50", s: "Musik", teach: "Demel", room: "Musik", type: "normal" },
      { t: "10:40", s: "Mathematik", teach: "Müller", room: "201", type: "normal" }
    ]},
    3: { date: "Do, 25. Sep", lessons: [
      { t: "08:00", s: "Physik", teach: "Weiss", room: "Lab1", type: "normal" },
      { t: "08:50", s: "Geschichte", teach: "Hartl", room: "203", type: "normal" },
      { pause: "09:35 – 09:50" },
      { t: "09:50", s: "Chemie", teach: "Fischer", room: "Lab3", type: "sub" },
      { t: "10:40", s: "Deutsch", teach: "Schmidt", room: "103", type: "normal" }
    ]},
    4: { date: "Fr, 26. Sep", lessons: [
      { t: "08:00", s: "Biologie", teach: "Grün", room: "Bio1", type: "normal" },
      { t: "08:50", s: "Informatik", teach: "Klein", room: "PC1", type: "normal" },
      { pause: "09:35 – 09:50" },
      { t: "09:50", s: "Sport", teach: "Koch", room: "Halle", type: "normal" },
      { t: "10:40", s: "Kunst", teach: "—", room: "—", type: "cancel" }
    ]}
  };
  const DEMO_NEXT_NOTE = { s: "Projektwoche", teach: "Klassenleitung", room: "Aula", type: "normal", t: "ganztägig" };

  let demoDay = 0;
  let demoWeek = 0;
  const demoView = $("#demoView");
  const demoDate = $("#demoDate");
  const demoWeekLabel = $("#demoWeekLabel");

  function esc(str) { return String(str).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c])); }

  function renderDemo() {
    if (!demoView) return;
    const day = DEMO[demoDay];
    let lessons = day.lessons.slice();
    if (demoWeek === 1) {
      // Nächste Woche: leicht variieren, damit der Wechsel sichtbar ist
      lessons = [{ t: "08:00", ...DEMO_NEXT_NOTE }].concat(lessons.slice(1));
    }
    const title = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"][demoDay];
    let html = '<div class="demo-day-title">' + title +
      (day.today && demoWeek === 0 ? ' <span class="badge-today">Heute</span>' : "") + "</div>";
    lessons.forEach(l => {
      if (l.pause) { html += '<div class="demo-pause-row">Pause · ' + esc(l.pause) + "</div>"; return; }
      const label = l.type === "cancel" ? "Ausfall" : l.type === "sub" ? "Vertretung" : "Unterricht";
      html +=
        '<div class="demo-lesson type-' + l.type + '" tabindex="0">' +
          '<span class="dl-time">' + esc(l.t) + "</span>" +
          "<div><div class=\"dl-subj\">" + esc(l.s) + "</div>" +
          '<div class="dl-meta">' + (l.teach && l.teach !== "—" ? "👤 " + esc(l.teach) + " · " : "") +
          (l.room && l.room !== "—" ? "🚪 " + esc(l.room) : "") + "</div></div>" +
          '<span class="dl-status" aria-hidden="true"></span>' +
          '<span class="dl-tip"><b>' + esc(l.s) + "</b> · " + label +
          (l.teach && l.teach !== "—" ? "<br>👤 " + esc(l.teach) : "") +
          (l.room && l.room !== "—" ? " · 🚪 " + esc(l.room) : "") +
          "<br>🕐 " + esc(l.t) + "</span>" +
        "</div>";
    });
    demoView.innerHTML = html;
    if (demoDate) demoDate.textContent = day.date;
    if (demoWeekLabel) demoWeekLabel.textContent = "Klasse 10b · " + (demoWeek === 0 ? "Diese Woche" : "Nächste Woche");
  }

  $$(".demo-day").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".demo-day").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      demoDay = Number(btn.dataset.day) || 0;
      renderDemo();
    });
  });
  function setWeek(w) {
    demoWeek = w;
    const cur = $("#demoWeekCur"), next = $("#demoWeekNext");
    if (cur) cur.classList.toggle("active", w === 0);
    if (next) next.classList.toggle("active", w === 1);
    renderDemo();
  }
  if ($("#demoWeekCur")) $("#demoWeekCur").addEventListener("click", () => setWeek(0));
  if ($("#demoWeekNext")) $("#demoWeekNext").addEventListener("click", () => setWeek(1));
  const demoReload = $("#demoReload");
  if (demoReload) {
    demoReload.addEventListener("click", () => {
      demoReload.classList.add("spinning");
      setTimeout(() => { demoReload.classList.remove("spinning"); renderDemo(); }, 550);
    });
  }
  renderDemo();

  /* ---------- Documentation search ---------- */
  const SEARCH_INDEX = [
    { title: "Installation via HACS", sec: "Installation", href: "#installation" },
    { title: "Manuelle Installation", sec: "Installation", href: "#installation" },
    { title: "Card einrichten & YAML", sec: "Lovelace Card", href: "#card" },
    { title: "Card-Konfiguration & Optionen", sec: "Lovelace Card", href: "#card" },
    { title: "Sensoren & Entity-IDs", sec: "Sensoren", href: "#sensors" },
    { title: "sensor.vpmobile24_week_table", sec: "Sensoren", href: "#sensors" },
    { title: "Ferienerkennung nach Bundesland", sec: "Features", href: "#features" },
    { title: "Mehrere Klassen einrichten", sec: "Troubleshooting", href: "#troubleshooting" },
    { title: "Aktueller Unterricht", sec: "Features", href: "#features" },
    { title: "Vertretungen & Ausfälle", sec: "Features", href: "#features" },
    { title: "Lehrermodus einrichten", sec: "Troubleshooting", href: "#troubleshooting" },
    { title: "Nullte Stunde (Stunde 0)", sec: "Troubleshooting", href: "#troubleshooting" },
    { title: "Oberstufenkurse (z.B. la1)", sec: "Troubleshooting", href: "#troubleshooting" },
    { title: "Card wird nicht angezeigt", sec: "Troubleshooting", href: "#troubleshooting" },
    { title: "404-Fehler bei der Ressource", sec: "Troubleshooting", href: "#troubleshooting" },
    { title: "Pausenzeiten werden nicht übernommen", sec: "Troubleshooting", href: "#troubleshooting" },
    { title: "Ist VpMobile24 kostenlos?", sec: "FAQ", href: "#faq" },
    { title: "Welche Sprachen werden unterstützt?", sec: "FAQ", href: "#faq" },
    { title: "Brauche ich YAML?", sec: "FAQ", href: "#faq" },
    { title: "XML-Daten für Bug-Reports", sec: "Hilfe", href: "https://github.com/Maximilian-Andrew-Kluge/VpMobile24/blob/main/docs/xml-tutorial.md" },
    { title: "GitHub Repository", sec: "Community", href: "https://github.com/Maximilian-Andrew-Kluge/VpMobile24" },
    { title: "Discord Community", sec: "Community", href: "https://discord.gg/57uvCeRw43" }
  ];
  const overlay = $("#searchOverlay");
  const searchInput = $("#searchInput");
  const searchResults = $("#searchResults");
  let selIdx = 0;

  function openSearch() {
    if (!overlay) return;
    overlay.classList.add("open");
    renderResults("");
    setTimeout(() => searchInput && searchInput.focus(), 30);
  }
  function closeSearch() { if (overlay) overlay.classList.remove("open"); if (searchInput) searchInput.value = ""; }
  function renderResults(q) {
    if (!searchResults) return;
    const query = q.trim().toLowerCase();
    const matches = query
      ? SEARCH_INDEX.filter(i => (i.title + " " + i.sec).toLowerCase().includes(query))
      : SEARCH_INDEX.slice(0, 8);
    selIdx = 0;
    if (!matches.length) { searchResults.innerHTML = '<div class="search-empty">Keine Ergebnisse für „' + esc(q) + "“</div>"; return; }
    searchResults.innerHTML = matches.map((m, i) => {
      const ext = m.href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
      return '<a class="search-result' + (i === 0 ? " sel" : "") + '" href="' + m.href + '"' + ext + '>' +
        '<div class="sr-title">' + esc(m.title) + "</div><div class=\"sr-sec\">" + esc(m.sec) + "</div></a>";
    }).join("");
    $$(".search-result", searchResults).forEach(a => a.addEventListener("click", closeSearch));
  }
  if ($("#searchBtn")) $("#searchBtn").addEventListener("click", openSearch);
  if (searchInput) searchInput.addEventListener("input", e => renderResults(e.target.value));
  if (overlay) overlay.addEventListener("click", e => { if (e.target === overlay) closeSearch(); });

  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName) || (document.activeElement && document.activeElement.isContentEditable);
    if (e.key === "/" && !typing && overlay && !overlay.classList.contains("open")) { e.preventDefault(); openSearch(); return; }
    if (!overlay || !overlay.classList.contains("open")) return;
    if (e.key === "Escape") { closeSearch(); return; }
    const results = $$(".search-result", searchResults);
    if (!results.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      results[selIdx] && results[selIdx].classList.remove("sel");
      selIdx = e.key === "ArrowDown" ? (selIdx + 1) % results.length : (selIdx - 1 + results.length) % results.length;
      results[selIdx].classList.add("sel");
      results[selIdx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[selIdx] && results[selIdx].click();
    }
  });

  /* ---------- GitHub release versions (progressive enhancement) ---------- */
  (function loadVersions() {
    fetch("https://api.github.com/repos/Maximilian-Andrew-Kluge/VpMobile24/releases?per_page=10")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(releases => {
        if (!Array.isArray(releases) || !releases.length) return;
        let stable = null, beta = null;
        for (const rel of releases) {
          if (!stable && !rel.prerelease) stable = rel;
          if (!beta && rel.prerelease) beta = rel;
          if (stable && beta) break;
        }
        const newest = stable || releases[0];
        const av = $("#announceVersion"), al = $("#announceLink");
        if (newest && av) av.textContent = "VpMobile24 " + (newest.tag_name || newest.name);
        if (newest && al) al.href = newest.html_url;
        if (stable) $$(".gh-version-stable").forEach(el => el.textContent = stable.tag_name);
        if (beta && stable && beta.tag_name !== stable.tag_name) {
          $$(".gh-version-beta").forEach(el => el.textContent = beta.tag_name);
          $$(".version-beta-block").forEach(el => { el.style.display = "inline-flex"; });
        }
      })
      .catch(() => { /* keep static fallback */ });
  })();

})();
