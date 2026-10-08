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
  function openDrawer() {
    if (drawer) {
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      burger && burger.setAttribute("aria-expanded", "true");
      setTimeout(() => {
        const focusable = drawer.querySelector('a[href], button:not([disabled]), [tabindex="0"]');
        if (focusable) focusable.focus();
      }, 50);
    }
  }
  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      burger && burger.setAttribute("aria-expanded", "false");
      burger && burger.focus();
    }
  }
  if (burger) burger.addEventListener("click", openDrawer);
  if ($("#drawerClose")) $("#drawerClose").addEventListener("click", closeDrawer);
  $$(".drawer-links a").forEach(a => a.addEventListener("click", closeDrawer));

  // Drawer Escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("open")) {
      closeDrawer();
    }
  });

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

  /* ---------- Interactive demo (echte HA-Wochentabelle) ---------- */
  function esc(str) { return String(str).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c])); }

  // Zeitraster + Pausen wie in der echten Card
  let DEMO_SLOTS = [
    { p: 1, time: "08:00–08:45" },
    { p: 2, time: "08:50–09:35" },
    { pause: "Pause · 10:10 – 10:30" },
    { p: 3, time: "10:00–10:45" },
    { p: 4, time: "10:45–11:30" },
    { pause: "Pause · 12:15 – 12:45" },
    { p: 5, time: "12:15–13:00" },
    { p: 6, time: "13:05–13:50" },
    { p: 7, time: "14:00–14:45" },
    { p: 8, time: "14:35–15:20" }
  ];
  // l = {s:Fach, teach:Lehrer, room:Raum, type:n|s|c, note:Zusatz}
  // Typ: n=normal, s=Vertretung, c=Ausfall, "" = leer
  function L(s, teach, room, type, note) { return { s: s, teach: teach || "", room: room || "", type: type || "n", note: note || "" }; }
  const EMPTY = { s: "", type: "" };

  // Wochendaten: DEMO[week][period][dayIndex] — Reihenfolge MO DI MI DO FR
  const DEMO_WEEKS = {
    0: { // Aktuelle Woche (KW 39)
      1: [L("PH","","B12"), L("P:gw","","GW1"), L("EN","","204"), L("DE","Petschlies","103","c","Frau Petschlies fällt aus"), L("FR","Weder","St.3","s","Frau Weder verlegt nach St.3")],
      2: [L("PH","","B12"), L("P:gw","","GW1"), L("EN","","204"), L("DE","Petschlies","103","c","Frau Petschlies fällt aus"), L("FR","Weder","St.4","s","Frau Weder verlegt nach St.4")],
      3: [L("DE","","103"), L("MA","","201"), L("ETH","","108"), L("SPO:m","Kaumann","Halle","c","Herr Kaumann fällt aus"), L("FR","","St.3")],
      4: [L("DE","","103"), L("MA","","201"), L("ETH","","108"), L("SPO:w","Furmanzack","Halle","c","Frau Furmanzack fällt aus"), L("FR","","St.3")],
      5: [L("MA","","201"), L("INF","","PC1"), L("GEO","","205"), L("BIO","Gommlich","Bio1","c","Frau Gommlich fällt aus"), L("CH","","Lab3")],
      6: [L("MA","","201"), L("KU","","Kunst"), L("FREI","","","s"), L("BIO","Gommlich","Bio1","c","Frau Gommlich fällt aus"), L("CH","","Lab3")],
      7: [L("Frsol","","A1"), L("EN","","204"), L("G/R/W","","202"), EMPTY, EMPTY],
      8: [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
    },
    1: { // Nächste Woche (KW 40) — leicht anders, keine Ausfälle
      1: [L("PH","","B12"), L("P:gw","","GW1"), L("EN","","204"), L("DE","Petschlies","103"), L("FR","Weder","St.2")],
      2: [L("PH","","B12"), L("P:gw","","GW1"), L("EN","","204"), L("DE","Petschlies","103"), L("FR","Weder","St.2")],
      3: [L("DE","","103"), L("MA","","201"), L("ETH","","108"), L("SPO:m","Kaumann","Halle"), L("FR","","St.3")],
      4: [L("DE","","103"), L("MA","","201"), L("ETH","","108"), L("SPO:w","Furmanzack","Halle"), L("FR","","St.3")],
      5: [L("MA","","201"), L("INF","","PC1"), L("GEO","","205"), L("BIO","Gommlich","Bio1"), L("CH","","Lab3")],
      6: [L("MA","","201"), L("KU","","Kunst"), L("EN","Weber","204","s","Herr Weber vertritt"), L("BIO","Gommlich","Bio1"), L("CH","","Lab3")],
      7: [L("Frsol","","A1"), L("EN","","204"), L("G/R/W","","202"), EMPTY, EMPTY],
      8: [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
    }
  };
  const DAY_SHORT = ["MO", "DI", "MI", "DO", "FR"];
  const DAY_FULL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
  // Mutable arrays filled by initDemoDates below
  var DAY_DATE = [[], []];
  var TODAY_IDX = -1;
  var KW_LABEL = ["", ""];

  // ---------- Dynamic demo dates ----------
  function getISOWeek(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
  (function initDemoDates() {
    var today = new Date();
    var rawDow = today.getDay(); // 0=Sun,1=Mon,...,6=Sat
    var dow = rawDow === 0 ? 6 : rawDow - 1; // 0=Mon,...,4=Fri,5=Sat,6=Sun
    var monday = new Date(today);
    monday.setDate(today.getDate() - dow);

    var kw0 = getISOWeek(monday);
    var nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    var kw1 = getISOWeek(nextMonday);

    var MONTHS_SHORT = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
    var datesW0 = [], datesW1 = [];
    for (var i = 0; i < 5; i++) {
      var d0 = new Date(monday); d0.setDate(monday.getDate() + i);
      var d1 = new Date(nextMonday); d1.setDate(nextMonday.getDate() + i);
      datesW0.push(String(d0.getDate()).padStart(2, "0"));
      datesW1.push(String(d1.getDate()).padStart(2, "0"));
    }

    DAY_DATE[0] = datesW0;
    DAY_DATE[1] = datesW1;

    // todayIdx: 0=Mon...4=Fri; weekend = -1 (no highlight)
    var todayIdx = (rawDow >= 1 && rawDow <= 5) ? rawDow - 1 : -1;
    TODAY_IDX = todayIdx;
    window.__demoTodayIdx = todayIdx;

    KW_LABEL[0] = "KW " + kw0 + " · Aktuell";
    KW_LABEL[1] = "KW " + kw1 + " · Nächste Woche";

    // Update hero mockup chip
    var chip = document.querySelector(".mk-chip");
    if (chip && rawDow >= 1 && rawDow <= 5) {
      var DAY_ABBR = ["Mo","Di","Mi","Do","Fr"];
      var chipDay = new Date(monday); chipDay.setDate(monday.getDate() + (rawDow - 1));
      chip.textContent = DAY_ABBR[rawDow - 1] + ", " + chipDay.getDate() + ". " + MONTHS_SHORT[chipDay.getMonth()];
    }
  })();
  const CUR_PERIOD = -1;   // keine aktuelle Stunde in der Referenz hervorgehoben
  // Tages-Info-Pills pro Wochentag (wie im Referenzbild)
  const DAY_INFO = [
    ["Jg8 – Englandfahrt", "Jg8 – Englandfahrt", "Instrumentalunterricht", "Heute pädagogischer Tag", "Jg8 – Englandfahrt"],
    ["", "", "", "", ""]
  ];

  let demoWeek = 0;
  const demoView = $("#demoView");
  const demoWeekLabel = $("#demoWeekLabel");
  const demoAusfall = $("#demoAusfall");

  const CLS = { n: "dc-n", s: "dc-s", c: "dc-c", "": "dc-empty" };
  const LABEL = { n: "Unterricht", s: "Vertretung", c: "Ausfall" };

  function cellHtml(cell, dayIdx, slot, isToday, isNow) {
    if (!cell || cell.type === "") return '<td class="dc-cell-td' + (isToday ? " is-today-col" : "") + '"><div class="dc-cell dc-empty"></div></td>';
    let cls = CLS[cell.type] || "dc-n";
    const now = isNow && cell.type !== "c";
    if (now) cls = "dc-now";
    const subj = esc(cell.s);
    // Tooltip
    let tip = "<b>" + subj + "</b> · " + (now ? "Jetzt" : (LABEL[cell.type] || "Unterricht"));
    if (cell.teach) tip += "<br>" + esc(cell.teach);
    if (cell.room && cell.type !== "c") tip += (cell.teach ? " · " : "<br>") + esc(cell.room);
    tip += "<br>" + esc(slot.time) + " · " + esc(DAY_FULL[dayIdx]);
    if (cell.note) tip += "<br><em>" + esc(cell.note) + "</em>";
    // Cell body: subject + status dot; cancel shows teacher note
    const dot = '<span class="dc-dot"></span>';
    let inner;
    if (cell.type === "c") {
      inner = '<span class="dc-subj">' + subj + "</span>" +
        '<small class="dc-note">' + esc(cell.note || "fällt aus") + "</small>";
    } else {
      inner = '<span class="dc-subj">' + subj + "</span>" +
        (cell.note ? '<small class="dc-note">' + esc(cell.note) + "</small>" : "");
    }
    return '<td class="dc-cell-td' + (isToday ? " is-today-col" : "") + '">' +
      '<div class="dc-cell ' + cls + '" tabindex="0">' + dot + inner +
      '<span class="dc-tip">' + tip + "</span></div></td>";
  }

  function renderDemo() {
    if (!demoView) return;
    const week = DEMO_WEEKS[demoWeek];
    const todayIdx = demoWeek === 0 ? (window.__demoTodayIdx !== undefined ? window.__demoTodayIdx : TODAY_IDX) : -1;

    // Kopfzeile (Wochentage)
    let head = '<tr class="dc-days-row"><th class="dc-num-h"></th>';
    DAY_SHORT.forEach((d, i) => {
      const today = i === todayIdx;
      const inner = '<span class="dc-day-name">' + d + '</span><span class="dc-day-date">' + DAY_DATE[demoWeek][i] + "</span>";
      head += '<th class="dc-day-h' + (today ? " dc-today-h" : "") + '">' +
        (today ? '<span class="dc-today-box">' + inner + "</span>" : inner) + "</th>";
    });
    head += "</tr>";

    // Info-Pills-Zeile (Tages-Infos)
    const infoIcon = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>';
    head += '<tr class="dc-info-row"><th class="dc-info-h">' +
      '<span class="dc-info-marker">' + infoIcon + '</span></th>';
    DAY_SHORT.forEach((d, i) => {
      const txt = (DAY_INFO[demoWeek] && DAY_INFO[demoWeek][i]) || "";
      head += '<th class="dc-info-cell">' +
        (txt ? '<span class="dc-info-pill" title="' + esc(txt) + '">' + infoIcon + '<span class="dc-info-txt">' + esc(txt) + '</span></span>' : '') +
        "</th>";
    });
    head += "</tr>";

    // Zeilen
    let body = "";
    DEMO_SLOTS.forEach(slot => {
      if (slot.pause) { body += '<tr class="dc-pause"><td colspan="6">' + esc(slot.pause) + "</td></tr>"; return; }
      const row = week[slot.p] || [];
      body += '<tr><td class="dc-num"><b>' + slot.p + "</b><span>" + esc(slot.time) + "</span></td>";
      for (let i = 0; i < 5; i++) {
        const isToday = i === todayIdx;
        const isNow = demoWeek === 0 && isToday && slot.p === CUR_PERIOD;
        body += cellHtml(row[i], i, slot, isToday, isNow);
      }
      body += "</tr>";
    });

    demoView.innerHTML =
      '<div class="dc-table-wrap"><table class="dc-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>" +
      '<div class="dc-legend">' +
        '<span><i style="background:#4F7CFF"></i>Heute</span>' +
        '<span><i style="background:#F59E0B"></i>Vertretung</span>' +
        '<span><i style="background:#EF4444"></i>Ausfall</span>' +
        '<span><i style="background:#4F7CFF"></i>Jetzt</span>' +
      "</div>";

    if (demoWeekLabel) demoWeekLabel.textContent = KW_LABEL[demoWeek];
    if (demoAusfall) demoAusfall.style.display = demoWeek === 0 ? "" : "none";
  }

  function setWeek(w) {
    demoWeek = w;
    const toggle = $("#demoWeekToggle");
    if (toggle) {
      toggle.dataset.week = String(w);
      toggle.innerHTML = w === 0
        ? 'Nächste Woche <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8.6 16.6 13.2 12 8.6 7.4 10 6l6 6-6 6z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M15.4 7.4 10.8 12l4.6 4.6L14 18l-6-6 6-6z"/></svg> Aktuelle Woche';
      toggle.classList.toggle("dc-btn-green", w === 1);
      toggle.classList.toggle("dc-btn-primary", w === 0);
    }
    renderDemo();
  }
  const demoWeekToggle = $("#demoWeekToggle");
  if (demoWeekToggle) demoWeekToggle.addEventListener("click", () => setWeek(demoWeek === 0 ? 1 : 0));
  const demoReload = $("#demoReload");
  if (demoReload) {
    demoReload.addEventListener("click", () => {
      demoReload.classList.add("spinning");
      setTimeout(() => { demoReload.classList.remove("spinning"); renderDemo(); }, 550);
    });
  }
  renderDemo();

  /* ---------- Card Creator ---------- */
  // Themes (bg + tile_bg) exakt aus der echten Card
  // Next-Gen Theme-System — identisch zur echten Card (bg/card/primary +
  // fixe Statusfarbe je Dark/Light für die Vorschau-Punkte).
  const CC_THEMES = [
    // Dark
    { v: "navy",        name: "Navy Dark",   category: "Dark",  kw: "Navy · Blau · Neutral",     bg: "#0B0F19", card: "#111827", tile: "#1A2233", primary: "#4F7CFF", status: "#22C55E", light: false },
    { v: "graphite",    name: "Graphite",    category: "Dark",  kw: "Grau · Schwarz · Minimal",  bg: "#090A0C", card: "#121416", tile: "#202328", primary: "#E5E7EB", status: "#22C55E", light: false },
    { v: "ocean_blue",  name: "Ocean Blue",  category: "Dark",  kw: "Blau · Navy · Technisch",   bg: "#07111F", card: "#0D1A2B", tile: "#172E47", primary: "#3B82F6", status: "#22C55E", light: false },
    { v: "deep_purple", name: "Deep Purple", category: "Dark",  kw: "Violett · Dunkel · Elegant",bg: "#0F0B18", card: "#171222", tile: "#291F3B", primary: "#8B5CF6", status: "#22C55E", light: false },
    { v: "forest_green",name: "Forest Green",category: "Dark",  kw: "Grün · Natur · Ruhig",      bg: "#07130D", card: "#0D1E16", tile: "#193428", primary: "#22C55E", status: "#22C55E", light: false },
    { v: "ruby",        name: "Ruby",        category: "Dark",  kw: "Rot · Dunkel · Elegant",    bg: "#13090B", card: "#211013", tile: "#341A1F", primary: "#EF4444", status: "#22C55E", light: false },
    { v: "sunset",      name: "Sunset",      category: "Dark",  kw: "Orange · Warm · Modern",    bg: "#140D08", card: "#21160D", tile: "#352317", primary: "#F97316", status: "#22C55E", light: false },
    { v: "deep_teal",   name: "Deep Teal",   category: "Dark",  kw: "Türkis · Kühl · Technisch", bg: "#061315", card: "#0C1F22", tile: "#17373B", primary: "#14B8A6", status: "#22C55E", light: false },
    { v: "dark_rose",   name: "Dark Rose",   category: "Dark",  kw: "Rosé · Dunkel · Elegant",   bg: "#140B11", card: "#21121A", tile: "#351D29", primary: "#EC4899", status: "#22C55E", light: false },
    // Light
    { v: "light",       name: "Light",       category: "Light", kw: "Weiß · Grau · Blau",        bg: "#F4F6FA", card: "#FFFFFF", tile: "#F8FAFC", primary: "#4169E1", status: "#16A34A", light: true },
    { v: "sky_blue",    name: "Sky Blue",    category: "Light", kw: "Blau · Frisch · Hell",      bg: "#F1F7FF", card: "#FFFFFF", tile: "#F5F9FF", primary: "#2563EB", status: "#16A34A", light: true },
    { v: "fresh_green", name: "Fresh Green", category: "Light", kw: "Grün · Natur · Hell",       bg: "#F1FAF4", card: "#FFFFFF", tile: "#F6FBF8", primary: "#16A34A", status: "#16A34A", light: true },
    { v: "soft_purple", name: "Soft Purple", category: "Light", kw: "Violett · Elegant · Hell",  bg: "#F7F4FC", card: "#FFFFFF", tile: "#FAF8FD", primary: "#7C3AED", status: "#16A34A", light: true },
    { v: "soft_rose",   name: "Soft Rose",   category: "Light", kw: "Rosé · Warm · Hell",        bg: "#FFF5F8", card: "#FFFFFF", tile: "#FFF9FB", primary: "#DB2777", status: "#16A34A", light: true },
    { v: "warm_orange", name: "Warm Orange", category: "Light", kw: "Orange · Warm · Hell",      bg: "#FFF8F1", card: "#FFFFFF", tile: "#FFFAF6", primary: "#EA580C", status: "#16A34A", light: true }
  ];
  const CC_THEME_MAP = {};
  CC_THEMES.forEach(t => CC_THEME_MAP[t.v] = t);

  // Konfig-State pro Typ (Defaults = echte getStubConfig-Werte)
  const CC = {
    type: "week",
    week: {
      entity: "sensor.vpmobile24_week_table",
      title: "Stundenplan",
      class_name: "09f",
      theme: "navy",
      show_header: true,
      show_time: true,
      highlight_today: true,
      use_custom_times: false
    },
    current: {
      entity: "sensor.vpmobile24_aktueller_unterricht",
      next_entity: "sensor.vpmobile24_naechste_stunde",
      week_entity: "sensor.vpmobile24_wochentabelle",
      title: "",
      theme: "navy",
      show_progress: true,
      show_countdown: true,
      show_next: true,
      show_teacher: true,
      show_room: true,
      show_day_info: true
    },
    multi: {
      entities: ["sensor.vpmobile24_09f_week_table", "sensor.vpmobile24_07a_week_table"],
      title: "Stundenplan Übersicht",
      theme: "navy",
      columns: "auto",
      show_week_nav: true,
      show_legend: true
    }
  };

  const ccForm = $("#ccForm");
  const ccYaml = $("#ccYaml");
  const demoCard = $("#demoCard");
  const demoTitle = $("#demoTitle");
  const demoClass = $("#demoClass");
  const demoActions = $("#demoActions");

  function ccText(id, label, val, hint) {
    return '<label class="cc-field"><span class="cc-lbl">' + esc(label) + '</span>' +
      '<input class="cc-input" type="text" data-cc="' + id + '" value="' + esc(val) + '">' +
      (hint ? '<span class="cc-hint">' + esc(hint) + '</span>' : '') + '</label>';
  }
  function ccTextarea(id, label, val, hint) {
    return '<label class="cc-field"><span class="cc-lbl">' + esc(label) + '</span>' +
      '<textarea class="cc-input cc-area" rows="3" data-cc="' + id + '">' + esc(val) + '</textarea>' +
      (hint ? '<span class="cc-hint">' + esc(hint) + '</span>' : '') + '</label>';
  }
  function ccSelect(id, label, val, opts) {
    let o = "";
    opts.forEach(op => { o += '<option value="' + esc(op.v) + '"' + (op.v === val ? " selected" : "") + '>' + esc(op.l) + '</option>'; });
    return '<label class="cc-field"><span class="cc-lbl">' + esc(label) + '</span>' +
      '<select class="cc-input" data-cc="' + id + '">' + o + '</select></label>';
  }
  function ccToggle(id, label, val) {
    return '<label class="cc-toggle"><input type="checkbox" data-cc="' + id + '"' + (val ? " checked" : "") + '>' +
      '<span class="cc-toggle-track"><span class="cc-toggle-thumb"></span></span>' +
      '<span class="cc-toggle-lbl">' + esc(label) + '</span></label>';
  }

  // Visueller Theme-Selector: Karten mit Farbvorschau-Punkten + aktivem Zustand.
  function ccThemeCard(t, active) {
    const dot = (c) => '<span class="cc-th-dot" style="background:' + c + '"></span>';
    const check = '<svg class="cc-th-check" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
    return '<button type="button" class="cc-th' + (active ? " cc-th-active" : "") + '" role="radio" aria-checked="' + (active ? "true" : "false") + '" data-cc-theme="' + esc(t.v) + '">' +
      '<span class="cc-th-preview" style="background:' + t.bg + '">' +
        '<span class="cc-th-bar" style="background:' + t.card + '"></span>' +
        '<span class="cc-th-dots">' + dot(t.primary) + dot(t.tile) + dot(t.status) + '</span>' +
      '</span>' +
      '<span class="cc-th-body"><span class="cc-th-name">' + esc(t.name) + '</span>' +
      '<span class="cc-th-kw">' + esc(t.kw) + '</span></span>' +
      (active ? check : '') + '</button>';
  }
  function ccThemePicker(val) {
    const groups = [["Dark Themes", false], ["Light Themes", true]];
    let h = '<div class="cc-field"><span class="cc-lbl">Theme</span><div class="cc-themes" role="radiogroup" aria-label="Theme">';
    groups.forEach(([label, isLight]) => {
      h += '<div class="cc-th-group">' + esc(label) + '</div><div class="cc-th-grid">';
      CC_THEMES.filter(t => t.light === isLight).forEach(t => { h += ccThemeCard(t, t.v === val); });
      h += '</div>';
    });
    h += '</div></div>';
    return h;
  }

  function renderCcForm() {
    if (!ccForm) return;
    const c = CC[CC.type];
    let h = "";
    if (CC.type === "week") {
      h += ccText("entity", "Entity (Wochentabelle)", c.entity, "z.B. sensor.vpmobile24_week_table");
      h += ccText("title", "Titel", c.title);
      h += ccText("class_name", "Klasse (optional)", c.class_name, "Überschreibt den Klassennamen aus dem Sensor");
      h += ccThemePicker(c.theme);
      h += '<div class="cc-toggles">';
      h += ccToggle("show_header", "Header anzeigen", c.show_header);
      h += ccToggle("show_time", "Zeiten anzeigen", c.show_time);
      h += ccToggle("highlight_today", "Heute hervorheben", c.highlight_today);
      h += ccToggle("use_custom_times", "Eigene Zeiten", c.use_custom_times);
      h += '</div>';
    } else if (CC.type === "current") {
      h += ccText("entity", "Entity (Aktuelle Stunde)", c.entity, "z.B. sensor.vpmobile24_aktueller_unterricht");
      h += ccText("next_entity", "Entity (Nächste Stunde)", c.next_entity);
      h += ccText("week_entity", "Entity (Wochentabelle)", c.week_entity);
      h += ccText("title", "Titel (optional)", c.title);
      h += ccThemePicker(c.theme);
      h += '<div class="cc-toggles">';
      h += ccToggle("show_progress", "Fortschritt", c.show_progress);
      h += ccToggle("show_countdown", "Countdown", c.show_countdown);
      h += ccToggle("show_next", "Nächste Stunde", c.show_next);
      h += ccToggle("show_teacher", "Lehrer", c.show_teacher);
      h += ccToggle("show_room", "Raum", c.show_room);
      h += ccToggle("show_day_info", "Tages-Info", c.show_day_info);
      h += '</div>';
    } else {
      h += ccTextarea("entities", "Entities (eine pro Zeile)", c.entities.join("\n"), "Je Klasse eine Wochentabellen-Entity");
      h += ccText("title", "Titel", c.title);
      h += ccThemePicker(c.theme);
      h += ccSelect("columns", "Spalten", c.columns, [
        { v: "auto", l: "Automatisch" }, { v: "1", l: "1 Spalte" },
        { v: "2", l: "2 Spalten" }, { v: "3", l: "3 Spalten" }
      ]);
      h += '<div class="cc-toggles">';
      h += ccToggle("show_week_nav", "Wochen-Navigation", c.show_week_nav);
      h += ccToggle("show_legend", "Legende", c.show_legend);
      h += '</div>';
    }
    ccForm.innerHTML = h;

    // Events binden (Text/Select/Toggle)
    ccForm.querySelectorAll("[data-cc]").forEach(el => {
      const key = el.dataset.cc;
      const evt = (el.type === "checkbox" || el.tagName === "SELECT") ? "change" : "input";
      el.addEventListener(evt, () => {
        const cur = CC[CC.type];
        if (el.type === "checkbox") cur[key] = el.checked;
        else if (key === "entities") cur[key] = el.value.split("\n").map(s => s.trim()).filter(Boolean);
        else cur[key] = el.value;
        applyCc();
      });
    });

    // Theme-Karten (visueller Selector)
    ccForm.querySelectorAll("[data-cc-theme]").forEach(btn => {
      btn.addEventListener("click", () => {
        CC[CC.type].theme = btn.dataset.ccTheme;
        // aktiven Zustand ohne Full-Rerender umschalten (behält Fokus/Scroll)
        ccForm.querySelectorAll("[data-cc-theme]").forEach(b => {
          const on = b === btn;
          b.classList.toggle("cc-th-active", on);
          b.setAttribute("aria-checked", on ? "true" : "false");
          const chk = b.querySelector(".cc-th-check");
          if (on && !chk) {
            b.insertAdjacentHTML("beforeend", '<svg class="cc-th-check" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>');
          } else if (!on && chk) { chk.remove(); }
        });
        applyCc();
      });
    });
  }

  // YAML-Erzeugung
  function yamlStr(v) {
    if (v === "") return '""';
    if (/^[\w./:-]+$/.test(v)) return v;
    return '"' + String(v).replace(/"/g, '\\"') + '"';
  }
  function buildYaml() {
    const c = CC[CC.type];
    let y = "";
    if (CC.type === "week") {
      y += "type: custom:vpmobile24-card\n";
      y += "entity: " + yamlStr(c.entity) + "\n";
      y += "theme: " + yamlStr(c.theme) + "\n";
      if (!c.show_header) y += "show_header: false\n";
      if (!c.show_time) y += "show_time: false\n";
      if (!c.highlight_today) y += "highlight_today: false\n";
      if (c.use_custom_times) y += "use_custom_times: true\n";
      if (c.title || c.class_name) {
        y += "header_settings:\n";
        if (c.title) y += "  title: " + yamlStr(c.title) + "\n";
        if (c.class_name) y += "  class_name: " + yamlStr(c.class_name) + "\n";
      }
    } else if (CC.type === "current") {
      y += "type: custom:vpmobile24-current-card\n";
      y += "entity: " + yamlStr(c.entity) + "\n";
      if (c.next_entity) y += "next_entity: " + yamlStr(c.next_entity) + "\n";
      if (c.week_entity) y += "week_entity: " + yamlStr(c.week_entity) + "\n";
      if (c.title) y += "title: " + yamlStr(c.title) + "\n";
      y += "theme: " + yamlStr(c.theme) + "\n";
      [["show_progress", c.show_progress], ["show_countdown", c.show_countdown],
       ["show_next", c.show_next], ["show_teacher", c.show_teacher],
       ["show_room", c.show_room], ["show_day_info", c.show_day_info]].forEach(([k, v]) => {
        if (!v) y += k + ": false\n";
      });
    } else {
      y += "type: custom:vpmobile24-multi-card\n";
      if (c.title) y += "title: " + yamlStr(c.title) + "\n";
      y += "theme: " + yamlStr(c.theme) + "\n";
      if (c.columns && c.columns !== "auto") y += "columns: " + yamlStr(c.columns) + "\n";
      if (!c.show_week_nav) y += "show_week_nav: false\n";
      if (!c.show_legend) y += "show_legend: false\n";
      y += "entities:\n";
      (c.entities.length ? c.entities : ["sensor.beispiel_week_table"]).forEach(e => {
        y += "  - " + yamlStr(e) + "\n";
      });
    }
    return y.trimEnd();
  }

  // Vorschau an Konfig anpassen
  function applyCc() {
    const c = CC[CC.type];
    const th = CC_THEME_MAP[c.theme] || CC_THEME_MAP.navy;
    if (demoCard) {
      demoCard.style.background = th.bg;
      demoCard.style.setProperty("--dc-primary", th.primary);
      demoCard.classList.toggle("dc-light", !!th.light);
    }
    // Titel / Klasse / Header
    if (CC.type === "week") {
      if (demoTitle) demoTitle.textContent = c.title || "Stundenplan";
      if (demoClass) { demoClass.textContent = "Klasse " + (c.class_name || "09f"); demoClass.style.display = ""; }
      if (demoActions) demoActions.style.display = "";
      if (demoCard) demoCard.classList.toggle("dc-no-header", !c.show_header);
    } else if (CC.type === "current") {
      if (demoTitle) demoTitle.textContent = c.title || "Aktueller Unterricht";
      if (demoClass) demoClass.style.display = "none";
      if (demoActions) demoActions.style.display = "none";
      if (demoCard) demoCard.classList.remove("dc-no-header");
    } else {
      if (demoTitle) demoTitle.textContent = c.title || "Stundenplan Übersicht";
      if (demoClass) { demoClass.textContent = (c.entities.length || 2) + " Klassen"; demoClass.style.display = ""; }
      if (demoActions) demoActions.style.display = c.show_week_nav ? "" : "none";
      if (demoCard) demoCard.classList.remove("dc-no-header");
    }
    // Legende (nur relevant für Wochen-/Multi-Vorschau)
    const legend = demoView && demoView.querySelector(".dc-legend");
    if (legend) legend.style.display = (CC.type === "multi" && !c.show_legend) ? "none" : "";
    // Zeiten-Spalte ausblenden bei show_time=false (Wochenplan)
    if (demoCard) demoCard.classList.toggle("dc-no-time", CC.type === "week" && !c.show_time);
    // YAML aktualisieren
    if (ccYaml) ccYaml.textContent = buildYaml();
  }

  // Typ-Umschalter
  $$(".cc-type").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".cc-type").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      CC.type = btn.dataset.ccType;
      renderCcForm();
      applyCc();
    });
  });

  // Copy-Button
  const ccCopy = $("#ccCopy");
  if (ccCopy) {
    ccCopy.addEventListener("click", () => {
      const text = buildYaml();
      const done = () => { ccCopy.textContent = "Kopiert!"; ccCopy.classList.add("copied"); setTimeout(() => { ccCopy.textContent = "Kopieren"; ccCopy.classList.remove("copied"); }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
      } else { fallbackCopy(text, done); }
    });
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta); if (cb) cb();
  }

  if (ccForm) { renderCcForm(); applyCc(); }

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

  /* ===== Demo Config: Themes, Schedule Editor, Theme Preview ===== */

  const DEMO_THEMES = [
    { v: "demo-default",  name: "VpMobile24 Blue",     bg: "#111827", primary: "#4F7CFF", success: "#22C55E", warning: "#F59E0B", danger: "#EF4444", txt: "#F8FAFC",  txt2: "#94A3B8" },
    { v: "demo-ha-dark",  name: "Home Assistant Dark",  bg: "#1c1c1c", primary: "#03a9f4", success: "#4caf50", warning: "#ff9800", danger: "#f44336", txt: "#ffffff",  txt2: "#b0bec5" },
    { v: "demo-ha-light", name: "Home Assistant Light", bg: "#fafafa", primary: "#03a9f4", success: "#4caf50", warning: "#ff9800", danger: "#f44336", txt: "#212121",  txt2: "#757575" },
    { v: "demo-midnight", name: "Midnight",             bg: "#0a0a0a", primary: "#8B5CF6", success: "#22C55E", warning: "#F59E0B", danger: "#EF4444", txt: "#e2e8f0",  txt2: "#64748B" },
    { v: "demo-ocean",    name: "Ocean",                bg: "#071520", primary: "#0ea5e9", success: "#06b6d4", warning: "#f59e0b", danger: "#ef4444", txt: "#e0f2fe",  txt2: "#7dd3fc" },
    { v: "demo-green",    name: "Forest Green",         bg: "#071309", primary: "#22c55e", success: "#22c55e", warning: "#eab308", danger: "#ef4444", txt: "#f0fdf4",  txt2: "#86efac" },
    { v: "demo-contrast", name: "High Contrast",        bg: "#000000", primary: "#ffffff", success: "#00ff00", warning: "#ffff00", danger: "#ff0000", txt: "#ffffff",  txt2: "#cccccc" }
  ];

  const DEFAULT_SCHEDULE = [
    { type: "lesson", period: 0, start: "07:50", end: "08:35" },
    { type: "lesson", period: 1, start: "08:40", end: "09:25" },
    { type: "lesson", period: 2, start: "09:30", end: "10:15" },
    { type: "break",  label: "Pause", start: "10:15", end: "10:35" },
    { type: "lesson", period: 3, start: "10:35", end: "11:20" },
    { type: "lesson", period: 4, start: "11:25", end: "12:10" },
    { type: "break",  label: "Mittagspause", start: "12:10", end: "12:50" },
    { type: "lesson", period: 5, start: "12:50", end: "13:35" },
    { type: "lesson", period: 6, start: "13:40", end: "14:25" },
    { type: "lesson", period: 7, start: "14:30", end: "15:15" },
    { type: "lesson", period: 8, start: "15:20", end: "16:05" }
  ];
  let SCHEDULE = DEFAULT_SCHEDULE.map(function(x) { return Object.assign({}, x); });

  function scheduleToSlots() {
    return SCHEDULE.map(function(item) {
      if (item.type === "break") {
        return { pause: (item.label || "Pause") + " \u00b7 " + item.start + " \u2013 " + item.end };
      }
      return { p: item.period, time: item.start + "\u2013" + item.end };
    });
  }

  function loadSchedule() {
    try {
      var raw = localStorage.getItem("vpm24-schedule");
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return DEFAULT_SCHEDULE.map(function(x) { return Object.assign({}, x); });
  }

  function saveSchedule() {
    try { localStorage.setItem("vpm24-schedule", JSON.stringify(SCHEDULE)); } catch(e) {}
  }

  function resetSchedule() {
    SCHEDULE = DEFAULT_SCHEDULE.map(function(x) { return Object.assign({}, x); });
    DEMO_SLOTS = scheduleToSlots();
    renderScheduleEditor();
    renderDemo();
    saveSchedule();
  }

  function validateSchedule() {
    var errors = [];
    var timeRe = /^\d{2}:\d{2}$/;
    var usedPeriods = {};

    SCHEDULE.forEach(function(item, idx) {
      if (!item.start || !timeRe.test(item.start)) {
        errors.push({ idx: idx, field: "start", message: "Stunde " + (idx+1) + ": Bitte gib eine g\u00fcltige Uhrzeit im Format HH:MM ein (Startzeit)." });
      }
      if (!item.end || !timeRe.test(item.end)) {
        errors.push({ idx: idx, field: "end", message: "Stunde " + (idx+1) + ": Bitte gib eine g\u00fcltige Uhrzeit im Format HH:MM ein (Endzeit)." });
      }
      if (item.start && item.end && timeRe.test(item.start) && timeRe.test(item.end)) {
        if (item.end <= item.start) {
          errors.push({ idx: idx, field: "end", message: "Stunde " + (idx+1) + ": Die Endzeit muss nach der Startzeit liegen." });
        }
      }
      if (item.type === "lesson") {
        if (item.period === undefined || item.period === null || item.period === "") {
          errors.push({ idx: idx, field: "period", message: "Stunde " + (idx+1) + ": Periodennummer fehlt." });
        } else {
          var pk = String(item.period);
          if (usedPeriods[pk]) {
            errors.push({ idx: idx, field: "period", message: "Periodennummer " + item.period + " ist doppelt vorhanden." });
          }
          usedPeriods[pk] = true;
        }
      }
    });

    for (var i = 1; i < SCHEDULE.length; i++) {
      var prev = SCHEDULE[i-1];
      var curr = SCHEDULE[i];
      if (prev.end && curr.start && /^\d{2}:\d{2}$/.test(prev.end) && /^\d{2}:\d{2}$/.test(curr.start)) {
        if (curr.start < prev.end) {
          errors.push({ idx: i, field: "start", message: "Diese Zeit \u00fcberschneidet sich mit dem vorherigen Eintrag." });
        }
      }
    }

    if (SCHEDULE.length > 12) {
      errors.push({ idx: -1, field: "global", message: "Maximal 12 Eintr\u00e4ge erlaubt. Bitte l\u00f6sche einen Eintrag." });
    }

    return errors;
  }

  function _esc(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function renderScheduleEditor() {
    var container = document.getElementById("scheduleEditorRows");
    if (!container) return;
    var errors = validateSchedule();
    var errorMap = {};
    errors.forEach(function(e) {
      if (!errorMap[e.idx]) errorMap[e.idx] = [];
      errorMap[e.idx].push(e);
    });

    var html = "";
    SCHEDULE.forEach(function(item, idx) {
      var isBreak = item.type === "break";
      var rowErrors = errorMap[idx] || [];
      var hasError = rowErrors.length > 0;
      var startInvalid = rowErrors.some(function(e) { return e.field === "start"; });
      var endInvalid = rowErrors.some(function(e) { return e.field === "end"; });
      var rowClass = "schedule-row" + (isBreak ? " is-break" : "") + (hasError ? " has-error" : "");

      var labelHtml;
      if (isBreak) {
        labelHtml = '<input class="sr-label-input" type="text" aria-label="Pausenbezeichnung" value="' + _esc(item.label || "Pause") + '" data-sr-idx="' + idx + '" data-sr-field="label" />';
      } else {
        labelHtml = '<div class="sr-label">Stunde ' + item.period + '</div>';
      }

      var startErrMsg = rowErrors.filter(function(e) { return e.field === "start"; }).map(function(e) { return e.message; }).join(" ");
      var endErrMsg = rowErrors.filter(function(e) { return e.field === "end"; }).map(function(e) { return e.message; }).join(" ");

      var canUp = idx > 0;
      var canDown = idx < SCHEDULE.length - 1;

      html += '<div class="' + rowClass + '">';
      html += '<div>' + labelHtml + '</div>';
      html += '<div class="sr-time-group">';
      html += '  <div class="sr-time-label">Beginn</div>';
      html += '  <input class="sr-time-input' + (startInvalid ? " invalid" : "") + '" type="text" placeholder="HH:MM" maxlength="5"';
      html += '    aria-label="Startzeit" value="' + _esc(item.start || "") + '"';
      html += '    data-sr-idx="' + idx + '" data-sr-field="start" />';
      if (startErrMsg) html += '  <div class="sr-error" role="alert">' + _esc(startErrMsg) + '</div>';
      html += '</div>';
      html += '<div class="sr-time-group">';
      html += '  <div class="sr-time-label">Ende</div>';
      html += '  <input class="sr-time-input' + (endInvalid ? " invalid" : "") + '" type="text" placeholder="HH:MM" maxlength="5"';
      html += '    aria-label="Endzeit" value="' + _esc(item.end || "") + '"';
      html += '    data-sr-idx="' + idx + '" data-sr-field="end" />';
      if (endErrMsg) html += '  <div class="sr-error" role="alert">' + _esc(endErrMsg) + '</div>';
      html += '</div>';
      html += '<div class="sr-actions">';
      html += '  <button class="sr-btn" data-sr-action="up" data-sr-idx="' + idx + '" aria-label="Nach oben" ' + (!canUp ? "disabled" : "") + '>\u2191</button>';
      html += '  <button class="sr-btn" data-sr-action="down" data-sr-idx="' + idx + '" aria-label="Nach unten" ' + (!canDown ? "disabled" : "") + '>\u2193</button>';
      html += '  <button class="sr-btn sr-del" data-sr-action="del" data-sr-idx="' + idx + '" aria-label="L\u00f6schen">\uD83D\uDDD1</button>';
      html += '</div>';
      html += '</div>';
    });

    container.innerHTML = html;

    container.querySelectorAll("[data-sr-idx]").forEach(function(el) {
      var idx2 = parseInt(el.getAttribute("data-sr-idx"), 10);
      var field = el.getAttribute("data-sr-field");
      var action = el.getAttribute("data-sr-action");

      if (action === "up") {
        el.addEventListener("click", function() { moveRow(idx2, -1); });
      } else if (action === "down") {
        el.addEventListener("click", function() { moveRow(idx2, 1); });
      } else if (action === "del") {
        el.addEventListener("click", function() { deleteRow(idx2); });
      } else if (field) {
        el.addEventListener("input", function() {
          if (field === "start" || field === "end") {
            SCHEDULE[idx2][field] = el.value;
          } else if (field === "label") {
            SCHEDULE[idx2].label = el.value;
          }
          applyScheduleChange();
        });
      }
    });
  }

  function addLesson() {
    var maxPeriod = -1;
    SCHEDULE.forEach(function(item) {
      if (item.type === "lesson" && typeof item.period === "number" && item.period > maxPeriod) {
        maxPeriod = item.period;
      }
    });
    SCHEDULE.push({ type: "lesson", period: maxPeriod + 1, start: "", end: "" });
    DEMO_SLOTS = scheduleToSlots();
    renderScheduleEditor();
    renderDemo();
    saveSchedule();
  }

  function addBreak() {
    SCHEDULE.push({ type: "break", label: "Pause", start: "", end: "" });
    DEMO_SLOTS = scheduleToSlots();
    renderScheduleEditor();
    renderDemo();
    saveSchedule();
  }

  function moveRow(idx, dir) {
    var target = idx + dir;
    if (target < 0 || target >= SCHEDULE.length) return;
    var tmp = SCHEDULE[idx];
    SCHEDULE[idx] = SCHEDULE[target];
    SCHEDULE[target] = tmp;
    DEMO_SLOTS = scheduleToSlots();
    renderScheduleEditor();
    renderDemo();
    saveSchedule();
  }

  function deleteRow(idx) {
    SCHEDULE.splice(idx, 1);
    DEMO_SLOTS = scheduleToSlots();
    renderScheduleEditor();
    renderDemo();
    saveSchedule();
  }

  var _scheduleDebounce = null;
  function applyScheduleChange() {
    clearTimeout(_scheduleDebounce);
    _scheduleDebounce = setTimeout(function() {
      var errors = validateSchedule();
      // Fehler inline aktualisieren – KEIN innerHTML-Rebuild (würde Fokus zerstören)
      _updateScheduleErrorsInPlace(errors);
      var valDiv = document.getElementById("scheduleValidation");
      if (errors.length === 0) {
        DEMO_SLOTS = scheduleToSlots();
        renderDemo();
        saveSchedule();
        if (valDiv) valDiv.classList.remove("visible");
      } else {
        if (valDiv) {
          valDiv.textContent = errors.map(function(e) { return e.message; }).join(" \u00b7 ");
          valDiv.classList.add("visible");
        }
      }
    }, 300);
  }

  // Aktualisiert nur Fehler-Klassen und Fehlermeldungen, ohne den Fokus zu zerstören
  function _updateScheduleErrorsInPlace(errors) {
    var container = document.getElementById("scheduleEditorRows");
    if (!container) return;
    var errorMap = {};
    errors.forEach(function(e) {
      if (e.idx >= 0) {
        if (!errorMap[e.idx]) errorMap[e.idx] = [];
        errorMap[e.idx].push(e);
      }
    });
    var rows = container.querySelectorAll(".schedule-row");
    rows.forEach(function(row, idx) {
      var rowErrors = errorMap[idx] || [];
      var hasError = rowErrors.length > 0;
      row.classList.toggle("has-error", hasError);
      // Start-Input
      var startInput = row.querySelector('[data-sr-field="start"]');
      if (startInput) {
        var startErr = rowErrors.filter(function(e) { return e.field === "start"; });
        startInput.classList.toggle("invalid", startErr.length > 0);
        var startErrEl = startInput.parentElement.querySelector(".sr-error");
        if (startErr.length > 0) {
          if (!startErrEl) {
            startErrEl = document.createElement("div");
            startErrEl.className = "sr-error";
            startErrEl.setAttribute("role", "alert");
            startInput.parentElement.appendChild(startErrEl);
          }
          startErrEl.textContent = startErr.map(function(e) { return e.message; }).join(" ");
        } else if (startErrEl) {
          startErrEl.remove();
        }
      }
      // End-Input
      var endInput = row.querySelector('[data-sr-field="end"]');
      if (endInput) {
        var endErr = rowErrors.filter(function(e) { return e.field === "end"; });
        endInput.classList.toggle("invalid", endErr.length > 0);
        var endErrEl = endInput.parentElement.querySelector(".sr-error");
        if (endErr.length > 0) {
          if (!endErrEl) {
            endErrEl = document.createElement("div");
            endErrEl.className = "sr-error";
            endErrEl.setAttribute("role", "alert");
            endInput.parentElement.appendChild(endErrEl);
          }
          endErrEl.textContent = endErr.map(function(e) { return e.message; }).join(" ");
        } else if (endErrEl) {
          endErrEl.remove();
        }
      }
    });
  }

  function applyDemoTheme(themeId) {
    var t = null;
    for (var i = 0; i < DEMO_THEMES.length; i++) {
      if (DEMO_THEMES[i].v === themeId) { t = DEMO_THEMES[i]; break; }
    }
    if (!t) t = DEMO_THEMES[0];
    // Demo-Karte direkt stylen
    var dc = document.getElementById("demoCard");
    if (dc) {
      dc.style.background = t.bg;
      dc.style.setProperty("--dc-primary", t.primary);
      dc.style.setProperty("--dc-success", t.success);
      dc.style.setProperty("--dc-warning", t.warning);
      dc.style.setProperty("--dc-error", t.danger);
      dc.style.setProperty("--dc-txt", t.txt);
      dc.style.setProperty("--dc-txt2", t.txt2);
      dc.style.setProperty("--dc-border", t.bg === "#000000" ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.07)");
    }
    // Accent-only: Akzent- und Statusfarben auf :root setzen (Dark/Light-Toggle bleibt erhalten)
    var root = document.documentElement;
    root.style.setProperty("--accent", t.primary);
    root.style.setProperty("--accent-2", t.primary);
    root.style.setProperty("--success", t.success);
    root.style.setProperty("--warning", t.warning);
    root.style.setProperty("--danger", t.danger);
    try { localStorage.setItem("vpm24-demo-theme", themeId); } catch(e) {}
    renderThemePreview(t);
    renderDemoThemeGrid(themeId);
  }

  function renderDemoThemeGrid(activeId) {
    var grid = document.getElementById("demoThemeGrid");
    if (!grid) return;
    var html = "";
    DEMO_THEMES.forEach(function(t) {
      var isActive = t.v === activeId;
      var check = isActive ? '<svg class="cc-th-check" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>' : '';
      html += '<button class="cc-th' + (isActive ? " cc-th-active" : "") + '"';
      html += ' data-dt="' + t.v + '"';
      html += ' role="radio" aria-checked="' + (isActive ? "true" : "false") + '"';
      html += ' aria-label="' + _esc(t.name) + '">';
      // Farbvorschau mit inline styles statt CSS-Variablen
      html += '<span class="cc-th-preview" style="background:' + t.bg + '">';
      html += '<span class="cc-th-bar" style="background:' + t.primary + '40"></span>';
      html += '<span class="cc-th-dots">';
      html += '<span class="cc-th-dot" style="background:' + t.primary + '"></span>';
      html += '<span class="cc-th-dot" style="background:' + t.success + '"></span>';
      html += '<span class="cc-th-dot" style="background:' + t.danger + '"></span>';
      html += '</span></span>';
      html += '<span class="cc-th-body"><span class="cc-th-name">' + _esc(t.name) + '</span></span>';
      html += check;
      html += '</button>';
    });
    grid.innerHTML = html;
    grid.querySelectorAll(".cc-th").forEach(function(btn) {
      btn.addEventListener("click", function() {
        applyDemoTheme(btn.getAttribute("data-dt"));
      });
    });
  }

  function renderThemePreview(t) {
    var card = document.getElementById("themePreviewCard");
    if (!card) return;
    var txtColor = t.txt || "#fff";
    var txt2Color = t.txt2 || "#94a3b8";
    card.style.background = t.bg;
    card.style.color = txtColor;
    var html = '';
    html += '<div class="tpc-head" style="background:' + t.bg + ';">';
    html += '  <div class="tpc-head-ico" style="background:' + t.primary + '20;">&#x1F4C5;</div>';
    html += '  <div>';
    html += '    <div class="tpc-title" style="color:' + txtColor + ';">Stundenplan \u00b7 Klasse 10b</div>';
    html += '    <div class="tpc-sub" style="color:' + txt2Color + ';">Heute \u00b7 aktuelle Stunde</div>';
    html += '  </div>';
    html += '</div>';
    html += '<div class="tpc-table" style="background:' + t.bg + ';">';
    html += '<div class="tpc-row"><div class="tpc-num" style="color:' + txt2Color + ';">1</div>';
    html += '<div class="tpc-cell" style="background:' + t.success + '20; color:' + t.success + '; border:1px solid ' + t.success + '40;">Mathe \u25b6</div>';
    html += '<div class="tpc-cell" style="background:' + t.primary + '20; color:' + t.primary + '; border:1px solid ' + t.primary + '40;">Deutsch</div>';
    html += '<div class="tpc-cell" style="background:' + t.primary + '20; color:' + t.primary + '; border:1px solid ' + t.primary + '40;">Physik</div>';
    html += '</div>';
    html += '<div class="tpc-row"><div class="tpc-pause" style="color:' + txt2Color + ';">\u2014 Pause \u00b7 09:25 \u2013 09:40 \u2014</div></div>';
    html += '<div class="tpc-row"><div class="tpc-num" style="color:' + txt2Color + ';">2</div>';
    html += '<div class="tpc-cell" style="background:' + t.warning + '20; color:' + t.warning + '; border:1px solid ' + t.warning + '40;">Englisch \u2194</div>';
    html += '<div class="tpc-cell" style="background:' + t.danger + '20; color:' + t.danger + '; border:1px solid ' + t.danger + '40;">Bio \u2715</div>';
    html += '<div class="tpc-cell" style="background:' + t.primary + '20; color:' + t.primary + '; border:1px solid ' + t.primary + '40;">Sport</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="tpc-legend">';
    html += '<span><i style="background:' + t.success + ';"></i><span style="color:' + txt2Color + ';">Jetzt</span></span>';
    html += '<span><i style="background:' + t.warning + ';"></i><span style="color:' + txt2Color + ';">Vertretung</span></span>';
    html += '<span><i style="background:' + t.danger + ';"></i><span style="color:' + txt2Color + ';">Ausfall</span></span>';
    html += '<span><i style="background:' + t.primary + ';"></i><span style="color:' + txt2Color + ';">Normal</span></span>';
    html += '</div>';
    card.innerHTML = html;
  }

  // Tab switching for demo config section
  document.querySelectorAll(".demo-cfg-tab").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".demo-cfg-tab").forEach(function(b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".demo-cfg-panel").forEach(function(p) {
        p.classList.remove("active");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      var panel = document.getElementById("cfg-" + btn.getAttribute("data-cfg-tab"));
      if (panel) panel.classList.add("active");
      if (btn.getAttribute("data-cfg-tab") === "schedule") renderScheduleEditor();
    });
  });

  // === Demo Config Init ===
  SCHEDULE = loadSchedule();
  DEMO_SLOTS = scheduleToSlots();
  var _savedDemoTheme = (function() { try { return localStorage.getItem("vpm24-demo-theme") || "demo-default"; } catch(e) { return "demo-default"; } })();
  renderDemoThemeGrid(_savedDemoTheme);
  applyDemoTheme(_savedDemoTheme);
  renderDemo();

  document.getElementById("addLessonBtn") && document.getElementById("addLessonBtn").addEventListener("click", addLesson);
  document.getElementById("addBreakBtn") && document.getElementById("addBreakBtn").addEventListener("click", addBreak);
  document.getElementById("loadDefaultsBtn") && document.getElementById("loadDefaultsBtn").addEventListener("click", function() {
    SCHEDULE = DEFAULT_SCHEDULE.map(function(x) { return Object.assign({}, x); });
    DEMO_SLOTS = scheduleToSlots();
    renderScheduleEditor();
    renderDemo();
    saveSchedule();
  });
  document.getElementById("demoConfigReset") && document.getElementById("demoConfigReset").addEventListener("click", function() {
    resetSchedule();
    try { localStorage.removeItem("vpm24-demo-theme"); } catch(e) {}
    // Accent-Farben auf :root zurücksetzen
    var root = document.documentElement;
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-2");
    root.style.removeProperty("--success");
    root.style.removeProperty("--warning");
    root.style.removeProperty("--danger");
    applyDemoTheme("demo-default");
  });

})();
