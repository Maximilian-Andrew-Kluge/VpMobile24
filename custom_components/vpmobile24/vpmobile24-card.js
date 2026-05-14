// VpMobile24 Card v2.4.2
console.info('%c VpMobile24-CARD %c v2.4.2 ', 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

class VpMobile24Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { filter: [{ integration: "vpmobile24" }] } } },
        { name: "additional_info_entity", required: false, selector: { entity: { filter: [{ integration: "vpmobile24" }] } } },
        { name: "reload_entity", required: false, selector: { entity: { domain: "button" } } },
        { name: "show_header", default: true, selector: { boolean: {} } },
        { type: "expandable", name: "header_settings", title: "Header-Einstellungen", collapsed: false,
          schema: [
            { name: "title", default: "Stundenplan", selector: { text: { type: "text" } } },
            { name: "class_name", default: "5a", selector: { text: { type: "text" } } }
          ]
        },
        { name: "highlight_today", default: true, selector: { boolean: {} } },
        { name: "show_time", default: true, selector: { boolean: {} } },
        { name: "use_custom_times", default: false, selector: { boolean: {} } },
        { type: "expandable", name: "time_settings", title: "Uhrzeiten-Anpassung", collapsed: true,
          schema: [
            { name: "lesson_count", default: 8, selector: { number: { min: 1, max: 10, step: 1, mode: "box" } } },
            { name: "pause_count", default: 2, selector: { number: { min: 0, max: 5, step: 1, mode: "box" } } },
            { name: "time_1", default: "07:45-08:30", selector: { text: { type: "text" } } },
            { name: "time_2", default: "08:40-09:25", selector: { text: { type: "text" } } },
            { name: "time_3", default: "09:25-10:10", selector: { text: { type: "text" } } },
            { name: "time_4", default: "10:35-11:20", selector: { text: { type: "text" } } },
            { name: "time_5", default: "11:30-12:15", selector: { text: { type: "text" } } },
            { name: "time_6", default: "12:45-13:30", selector: { text: { type: "text" } } },
            { name: "time_7", default: "13:40-14:25", selector: { text: { type: "text" } } },
            { name: "time_8", default: "14:35-15:20", selector: { text: { type: "text" } } },
            { name: "time_9", default: "15:00-15:45", selector: { text: { type: "text" } } },
            { name: "time_10", default: "15:50-16:35", selector: { text: { type: "text" } } },
            { type: "grid", name: "pause_1_config", schema: [
              { name: "pause_1", default: "10:10-10:30", selector: { text: { type: "text" } } },
              { name: "pause_1_after", default: 3, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_2_config", schema: [
              { name: "pause_2", default: "12:15-12:45", selector: { text: { type: "text" } } },
              { name: "pause_2_after", default: 5, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_3_config", schema: [
              { name: "pause_3", default: "13:15-13:20", selector: { text: { type: "text" } } },
              { name: "pause_3_after", default: 6, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_4_config", schema: [
              { name: "pause_4", default: "14:55-15:00", selector: { text: { type: "text" } } },
              { name: "pause_4_after", default: 8, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_5_config", schema: [
              { name: "pause_5", default: "16:35-16:40", selector: { text: { type: "text" } } },
              { name: "pause_5_after", default: 10, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]}
          ]
        }
      ],
      computeLabel: (s) => ({
        entity:"Week Table Sensor", additional_info_entity:"Zusatzinfo Sensor",
        reload_entity:"Neu laden Button", title:"Titel", class_name:"Klassenname",
        show_time:"Uhrzeiten anzeigen", show_header:"Header anzeigen",
        highlight_today:"Heutigen Tag hervorheben", use_custom_times:"Eigene Uhrzeiten verwenden",
        lesson_count:"Anzahl der Stunden", pause_count:"Anzahl der Pausen",
        time_1:"1. Stunde", time_2:"2. Stunde", time_3:"3. Stunde", time_4:"4. Stunde",
        time_5:"5. Stunde", time_6:"6. Stunde", time_7:"7. Stunde", time_8:"8. Stunde",
        time_9:"9. Stunde", time_10:"10. Stunde",
        pause_1:"1. Pause - Zeit", pause_1_after:"1. Pause - Nach Stunde",
        pause_2:"2. Pause - Zeit", pause_2_after:"2. Pause - Nach Stunde",
        pause_3:"3. Pause - Zeit", pause_3_after:"3. Pause - Nach Stunde",
        pause_4:"4. Pause - Zeit", pause_4_after:"4. Pause - Nach Stunde",
        pause_5:"5. Pause - Zeit", pause_5_after:"5. Pause - Nach Stunde",
      })[s.name],
      computeHelper: (s) => ({
        entity:"Wähle den sensor.vpmobile24_week_table Sensor",
        additional_info_entity:"Zusatzinfo-Sensor für Ausrufezeichen-Anzeige",
        reload_entity:"Button-Entity zum manuellen Neuladen (z.B. button.vpmobile24_reload)",
        title:"Titel der Card", class_name:"Name der Klasse (z.B. 5a, 10b)",
        show_time:"Zeigt Uhrzeiten unter der Stundennummer an",
        show_header:"Zeigt den Header mit Titel und Klassenname",
        highlight_today:"Hebt die heutige Spalte blau hervor",
        use_custom_times:"Aktiviere um eigene Uhrzeiten einzutragen",
      })[s.name],
      computeVisible: () => true,
    };
  }

  static getStubConfig() {
    return { entity:'sensor.vpmobile24_week_table', show_header:true, show_time:true,
      highlight_today:true, use_custom_times:false,
      header_settings:{ title:'Stundenplan', class_name:'5a' } };
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error('Entity ist erforderlich');
    this._config = JSON.parse(JSON.stringify(config));
    this._popupOpen = false;
    this._popupData = null;
    this._infoPopupOpen = false;
    this._mobDayIdx = null; // reset to today on config change
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      const anyPopupOpen = this._popupOpen || this._infoPopupOpen;
      if (anyPopupOpen) {
        // Only update table content, keep popups alive
        this._updateTableOnly();
        // If info popup is open, refresh its content with latest data
        if (this._infoPopupOpen) {
          this._renderInfoPopupContent();
        }
      } else {
        this._render();
      }
    }
  }
  get hass() { return this._hass; }
  getCardSize() { return 6; }

  _handleReload() {
    if (!this._config.reload_entity) return;
    this._hass.callService('button', 'press', { entity_id: this._config.reload_entity });
  }

  _showInfoPopup() {
    if (!this._config.additional_info_entity) return;
    this._infoPopupOpen = true;
    this._renderInfoPopupContent();
  }

  _renderInfoPopupContent() {
    const popup   = this.shadowRoot.getElementById('info-popup');
    const overlay = this.shadowRoot.getElementById('info-popup-overlay');
    const content = this.shadowRoot.getElementById('info-popup-content');
    if (!popup || !overlay || !content) return;

    const wdKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const wdDE   = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    const todayIdx = new Date().getDay();
    const todayKey = wdKeys[todayIdx];
    const todayName = wdDE[todayIdx];

    const ent = this._hass && this._config.additional_info_entity
      ? this._hass.states[this._config.additional_info_entity]
      : null;

    // Try week_infos first (new sensor format), fall back to flat arrays
    const weekInfos = ent && ent.attributes && ent.attributes.week_infos;
    let allg  = [];
    let stund = [];

    if (weekInfos && weekInfos[todayKey]) {
      allg  = weekInfos[todayKey].allgemeine_infos  || [];
      stund = weekInfos[todayKey].stunden_infos     || [];
    } else if (ent && ent.attributes) {
      // Fallback: flat arrays (old sensor format) — filter by today's name
      const rawAllg  = ent.attributes.allgemeine_infos  || [];
      const rawStund = ent.attributes.stunden_infos     || [];
      const filterDay = (arr) => arr.filter(t => {
        const text = String(t);
        const hasDayRef = wdDE.some(d => text.includes(d));
        return !hasDayRef || text.includes(todayName);
      });
      allg  = filterDay(rawAllg);
      stund = filterDay(rawStund);
    }

    let html = '';

    if (allg.length > 0) {
      html += '<div class="vp-info-section">'
        + '<div class="vp-info-section-label">📢 Allgemeine Informationen</div>'
        + allg.map(t => '<div class="vp-info-entry"><span>' + t + '</span></div>').join('')
        + '</div>';
    }

    if (!html) {
      html = '<div class="vp-info-none">Keine Zusatzinformationen für ' + todayName + ' verfügbar.</div>';
    } else {
      html += '<div style="height:8px"></div>';
    }

    content.innerHTML = html;
    popup.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }

  _closeInfoPopup() {
    this._infoPopupOpen = false;
    const popup   = this.shadowRoot.getElementById('info-popup');
    const overlay = this.shadowRoot.getElementById('info-popup-overlay');
    if (popup)   popup.classList.add('hidden');
    if (overlay) overlay.classList.add('hidden');
  }

  _closePopup() {
    this._popupOpen = false;
    this._popupData = null;
    const popup   = this.shadowRoot.getElementById('popup');
    const overlay = this.shadowRoot.getElementById('popup-overlay');
    if (popup)   { popup.classList.add('hidden'); popup.classList.remove('vp-popup-ausfall'); const t = popup.querySelector('#popup-title'); if(t) t.style.display=''; }
    if (overlay) overlay.classList.add('hidden');
  }

  _showLessonDetail(lesson, dayName, slotPeriod, slotTime, isCancelled) {
    this._popupOpen = true;
    this._popupData = { lesson, dayName, slotPeriod, slotTime, isCancelled };
    this._renderPopupContent(lesson, dayName, slotPeriod, slotTime, isCancelled);
  }

  _renderPopupContent(lesson, dayName, slotPeriod, slotTime, isCancelled) {
    const popup   = this.shadowRoot.getElementById('popup');
    const overlay = this.shadowRoot.getElementById('popup-overlay');
    const title   = this.shadowRoot.getElementById('popup-title');
    const content = this.shadowRoot.getElementById('popup-content');
    if (!popup || !overlay || !title || !content) return;

    const fach   = (lesson && lesson.fach && lesson.fach !== '---' && lesson.fach !== '—') ? lesson.fach : '—';
    const lehrer = (lesson && lesson.lehrer)  || '';
    const raum   = (lesson && lesson.raum)    || '';
    const zeit   = (lesson && lesson.zeit)    || slotTime || '';
    const info   = (lesson && lesson.zusatzinfo) || '';
    // Determine type: cancelled, substitution, or normal
    const isActuallyCancelled = isCancelled || fach === '—';
    const isVertretung = !isActuallyCancelled && !!(lesson && lesson.ist_vertretung);

    // Title
    let badge = '';
    if (isActuallyCancelled) {
      badge = '<span class="vp-detail-badge vp-detail-cancelled">Ausfall</span>';
    } else if (isVertretung) {
      badge = '<span class="vp-detail-badge vp-detail-sub">Vertretung</span>';
    }
    title.innerHTML =
      '<span class="vp-detail-num">' + slotPeriod + '. Stunde</span>' +
      (isActuallyCancelled ? '<span class="vp-detail-fach" style="color:#94a3b8">—</span>' : '<span class="vp-detail-fach">' + fach + '</span>') +
      badge;

    // Rows
    let rows = '';
    // Show period + time as first row (no Tag row)
    rows += '<div class="vp-detail-row">'
      + '<span class="vp-detail-icon">🕐</span>'
      + '<span class="vp-detail-label">' + slotPeriod + '. Stunde</span>'
      + '<span class="vp-detail-val">' + (zeit || slotTime || '—') + '</span></div>';

    if (lehrer) rows += '<div class="vp-detail-row">'
      + '<span class="vp-detail-icon">👤</span>'
      + '<span class="vp-detail-label">Lehrer</span>'
      + '<span class="vp-detail-val">' + lehrer + '</span></div>';

    if (raum) rows += '<div class="vp-detail-row">'
      + '<span class="vp-detail-icon">🚪</span>'
      + '<span class="vp-detail-label">Raum</span>'
      + '<span class="vp-detail-val">' + raum + '</span></div>';

    if (info) rows += '<div class="vp-detail-row vp-detail-info-row">'
      + '<span class="vp-detail-icon">ℹ️</span>'
      + '<span class="vp-detail-label">Info</span>'
      + '<span class="vp-detail-val">' + info + '</span></div>';

    if (isActuallyCancelled) {
      // Ausfall: show big red message, no rows
      // Build ausfall popup: no title bar, no lines, just red glow + AUSFALL
      title.innerHTML = '';
      title.style.display = 'none';
      content.innerHTML = '<div class="vp-ausfall-block">AUSFALL</div>';
      popup.classList.add('vp-popup-ausfall');
      popup.classList.remove('hidden');
      overlay.classList.remove('hidden');
      return;
    }
    if (!lehrer && !raum && !info) {
      rows += '<div class="vp-detail-empty">Keine weiteren Details verfügbar.</div>';
    }

    content.innerHTML = rows;
    popup.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }

  // Update only table body without destroying popup
  _updateTableOnly() {
    if (!this._hass || !this._config) return;
    const entity = this._hass.states[this._config.entity];
    if (!entity) return;
    const weekTable = entity.attributes && entity.attributes.week_table;
    if (!weekTable) return;

    const showTime       = this._config.show_time !== false;
    const highlightToday = this._config.highlight_today !== false;
    const useCustomTimes = this._config.use_custom_times === true;
    const days    = ['Mo','Di','Mi','Do','Fr'];
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const dayFullNames = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'];
    const todayDow = new Date().getDay();
    const todayIdx = highlightToday && todayDow >= 1 && todayDow <= 5 ? todayDow - 1 : -1;
    const slots = this._buildTimeSlots(useCustomTimes);

    const tbody = this.shadowRoot.querySelector('.vp-table tbody');
    if (!tbody) { this._render(); return; }

    let bodyHtml = '';
    slots.forEach(slot => {
      if (slot.isPause) {
        bodyHtml += '<tr class="vp-pause-tr"><td colspan="6"><div class="vp-pause-cell">Pause ' + slot.time + '</div></td></tr>';
      } else {
        const numHtml = showTime
          ? '<div class="vp-snum">' + slot.period + '</div><div class="vp-stime">' + slot.time + '</div>'
          : '<div class="vp-snum">' + slot.period + '</div>';
        bodyHtml += '<tr><td class="vp-td-num">' + numHtml + '</td>';
        days.forEach((d, di) => {
          const lesson = (weekTable[dayKeys[di]] || {})[slot.lessonNumber];
          const isToday = di === todayIdx;
          let cls = 'vp-tile';
          let text = '';
          if (lesson && lesson.fach) {
            text = lesson.fach;
            if (lesson.ist_vertretung) cls += ' vp-sub';
            else if (isToday) cls += ' vp-today-tile';
            cls += ' vp-tile-clickable';
          } else {
            cls += isToday ? ' vp-today-tile vp-empty' : ' vp-empty';
          }
          const onclickAttr = (lesson && lesson.fach)
            ? 'onclick="this.getRootNode().host._showLessonDetail(' + JSON.stringify(lesson).replace(/"/g,'&quot;') + ',\'' + dayFullNames[di] + '\',' + slot.period + ',\'' + slot.time + '\')"'
            : '';
          bodyHtml += '<td class="' + (isToday ? 'vp-today-col' : '') + '"><div class="' + cls + '" ' + onclickAttr + '>' + text + '</div></td>';
        });
        bodyHtml += '</tr>';
      }
    });
    tbody.innerHTML = bodyHtml;
  }

  _switchMobDay(idx) {
    this._mobDayIdx = idx;  // persist selection across re-renders
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const dayFullNames = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'];
    const showTime = this._config.show_time !== false;
    const useCustomTimes = this._config.use_custom_times === true;
    const entity = this._hass && this._hass.states[this._config.entity];
    const weekTable = entity && entity.attributes && entity.attributes.week_table;
    if (!weekTable) return;

    const slots = this._buildTimeSlots(useCustomTimes);
    const sched = weekTable[dayKeys[idx]] || {};
    const dName = dayFullNames[idx];

    let rows = '';
    slots.forEach(slot => {
      if (slot.isPause) {
        rows += '<div class="vp-mob-pause-row"><span>Pause ' + slot.time + '</span></div>';
      } else {
        const lesson = sched[slot.lessonNumber];
        let rowCls = 'vp-mob-lesson';
        let subj = '';
        let isSub = false;
        if (lesson && lesson.fach) {
          subj = lesson.fach;
          isSub = !!lesson.ist_vertretung;
          if (isSub) rowCls += ' vp-mob-sub';
          rowCls += ' vp-mob-clickable';
        } else {
          rowCls += ' vp-mob-empty';
        }
        const onclickAttr = (lesson && lesson.fach)
          ? 'onclick="this.getRootNode().host._showLessonDetail(' + JSON.stringify(lesson).replace(/"/g,'&quot;') + ',\'' + dName + '\',' + slot.period + ',\'' + slot.time + '\')"'
          : '';
        const numPart = '<div class="vp-mob-left"><span class="vp-mob-num">' + slot.period + '</span>'
          + (showTime ? '<span class="vp-mob-time">' + slot.time + '</span>' : '') + '</div>';
        const subjPart = subj
          ? '<div class="vp-mob-subj' + (isSub ? ' vp-mob-subj-sub' : '') + '">' + subj + '</div>'
          : '<div class="vp-mob-subj vp-mob-subj-empty">—</div>';
        rows += '<div class="' + rowCls + '" ' + onclickAttr + '>' + numPart + subjPart + '</div>';
      }
    });

    const content = this.shadowRoot.getElementById('vp-mob-content');
    if (content) content.innerHTML = rows;

    this.shadowRoot.querySelectorAll('.vp-mob-tab').forEach((btn, i) => {
      btn.classList.toggle('vp-mob-tab-active', i === idx);
    });
  }

  _buildTimeSlots(useCustomTimes) {
    const ts = this._config.time_settings || {};
    const cfg = this._config;
    const defaults = {
      time_1:'07:45-08:30', time_2:'08:40-09:25', time_3:'09:25-10:10',
      time_4:'10:35-11:20', time_5:'11:30-12:15', time_6:'12:45-13:30',
      time_7:'13:40-14:25', time_8:'14:35-15:20', time_9:'15:00-15:45', time_10:'15:50-16:35',
      pause_1:'10:10-10:30', pause_1_after:3,
      pause_2:'12:15-12:45', pause_2_after:5,
    };

    // HA stores grid sub-schemas as nested objects: pause_1_config: { pause_1: "...", pause_1_after: 3 }
    // We need to read from both the nested config object AND the flat top-level keys
    const getPauseTime = (p) => {
      const nested = ts['pause_'+p+'_config'] || cfg['pause_'+p+'_config'] || {};
      return ts['pause_'+p] ?? nested['pause_'+p] ?? cfg['pause_'+p] ?? defaults['pause_'+p] ?? '';
    };
    const getPauseAfter = (p) => {
      const nested = ts['pause_'+p+'_config'] || cfg['pause_'+p+'_config'] || {};
      const val = ts['pause_'+p+'_after'] ?? nested['pause_'+p+'_after'] ?? cfg['pause_'+p+'_after'] ?? defaults['pause_'+p+'_after'];
      return val !== undefined ? Number(val) : p * 2;
    };

    const lessonCount = useCustomTimes ? Number(ts.lesson_count ?? cfg.lesson_count ?? 8) : 8;
    const pauseCount  = useCustomTimes ? Number(ts.pause_count  ?? cfg.pause_count  ?? 2) : 2;

    const slots = [];
    for (let i = 1; i <= lessonCount; i++) {
      const time = useCustomTimes
        ? (ts['time_'+i] ?? cfg['time_'+i] ?? defaults['time_'+i] ?? '')
        : (defaults['time_'+i] ?? '');
      slots.push({ period: i, time, lessonNumber: i });

      for (let p = 1; p <= pauseCount; p++) {
        const after = useCustomTimes ? getPauseAfter(p) : (defaults['pause_'+p+'_after'] ?? p*2);
        if (Number(after) === i) {
          const ptime = useCustomTimes ? getPauseTime(p) : (defaults['pause_'+p] ?? '');
          slots.push({ isPause: true, time: ptime });
        }
      }
    }
    return slots;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const entity = this._hass.states[this._config.entity];
    if (!entity) {
      this.shadowRoot.innerHTML = '<ha-card><div style="padding:20px;color:#ef4444">Entity nicht gefunden: ' + this._config.entity + '</div></ha-card>';
      return;
    }
    const weekTable = entity.attributes && entity.attributes.week_table;
    if (!weekTable) {
      this.shadowRoot.innerHTML = '<ha-card><div style="padding:20px;color:#94a3b8">Keine Wochendaten verfügbar</div></ha-card>';
      return;
    }

    const title         = (this._config.header_settings && this._config.header_settings.title)     || this._config.title     || 'Stundenplan';
    const className     = (this._config.header_settings && this._config.header_settings.class_name) || this._config.class_name || '5a';
    const showHeader    = this._config.show_header !== false;
    const showTime      = this._config.show_time !== false;
    const highlightToday = this._config.highlight_today !== false;
    const useCustomTimes = this._config.use_custom_times === true;

    const now = new Date();
    const wdn = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    const mon = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    const dateChip = wdn[now.getDay()] + ', ' + now.getDate() + '. ' + mon[now.getMonth()];

    const days    = ['Mo','Di','Mi','Do','Fr'];
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const todayDow = now.getDay();
    const todayIdx = highlightToday && todayDow >= 1 && todayDow <= 5 ? todayDow - 1 : -1;

    const slots = this._buildTimeSlots(useCustomTimes);

    // ── CURRENT LESSON (which slot is active right now on today) ──
    const nowMins = now.getHours() * 60 + now.getMinutes();
    let currentLessonNum = -1;
    if (todayIdx >= 0) {
      slots.forEach(slot => {
        if (!slot.isPause && slot.time) {
          const parts = slot.time.split('-');
          if (parts.length === 2) {
            const [sh, sm] = parts[0].split(':').map(Number);
            const [eh, em] = parts[1].split(':').map(Number);
            const start = sh * 60 + sm;
            const end   = eh * 60 + em;
            if (nowMins >= start && nowMins <= end) currentLessonNum = slot.lessonNumber;
          }
        }
      });
    }

    // ── INFO BUTTON & POPUP DATA ──
    let infoBtn = false;
    let infoBtnHasInfo = false;
    if (this._config.additional_info_entity) {
      infoBtn = true;
      const infoEnt = this._hass.states[this._config.additional_info_entity];
      if (infoEnt && infoEnt.attributes) {
        const allg  = infoEnt.attributes.allgemeine_infos  || [];
        const stund = infoEnt.attributes.stunden_infos     || [];
        infoBtnHasInfo = (allg.length + stund.length) > 0;
      }
    }

    // ── TABLE HTML ──
    // Calculate dates for each weekday column (Mon-Fri of current week)
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    const dayDates = days.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate(); // just the day number
    });

    let tableHtml = '<table class="vp-table"><thead><tr><th class="vp-th-num">#</th>';
    days.forEach((d, i) => {
      const dateNum = dayDates[i];
      if (i === todayIdx) {
        tableHtml += '<th><span class="vp-today-pill">' + d + '<span class="vp-today-date">' + dateNum + '</span></span></th>';
      } else {
        tableHtml += '<th><span class="vp-th-day">' + d + '</span><span class="vp-th-date">' + dateNum + '</span></th>';
      }
    });
    tableHtml += '</tr></thead><tbody>';

    slots.forEach(slot => {
      if (slot.isPause) {
        tableHtml += '<tr class="vp-pause-tr"><td colspan="6"><div class="vp-pause-cell">Pause ' + slot.time + '</div></td></tr>';
      } else {
        const numHtml = showTime
          ? '<div class="vp-snum">' + slot.period + '</div><div class="vp-stime">' + slot.time + '</div>'
          : '<div class="vp-snum">' + slot.period + '</div>';
        tableHtml += '<tr><td class="vp-td-num">' + numHtml + '</td>';
        const dayFullNames = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'];
        days.forEach((d, di) => {
          const lesson = (weekTable[dayKeys[di]] || {})[slot.lessonNumber];
          const isToday = di === todayIdx;
          let cls = 'vp-tile';
          let text = '';
          // Detect cancellation: fach is "---", "—", empty, or null
          const rawFach = lesson ? lesson.fach : undefined;
          const isCancelled = lesson && (
            rawFach === undefined || rawFach === null ||
            rawFach === "---" || rawFach === "\u2014" || rawFach === "\u2013" ||
            rawFach === "" || rawFach === "-" || rawFach === "\u00a0" ||
            (typeof rawFach === "string" && rawFach.trim() === "") ||
            (typeof rawFach === "string" && /^[-\u2014\u2013\s]+$/.test(rawFach))
          );
          const isVertretung = lesson && lesson.ist_vertretung && !isCancelled;
          if (lesson && lesson.fach && !isCancelled) {
            text = lesson.fach;
            const isCurrent = isToday && slot.lessonNumber === currentLessonNum;
            if (isCurrent) cls += ' vp-current'; // green always wins over red
            else if (isVertretung) cls += ' vp-sub';
            else if (isToday) cls += ' vp-today-tile';
            cls += ' vp-tile-clickable';
          } else if (isCancelled) {
            text = '—';
            cls += ' vp-cancelled vp-tile-clickable';
          } else {
            cls += isToday ? ' vp-today-tile vp-empty' : ' vp-empty';
          }
          const onclickAttr = (lesson && (lesson.fach || isCancelled))
            ? 'onclick="this.getRootNode().host._showLessonDetail(' + JSON.stringify(lesson).replace(/"/g, '&quot;') + ',\'' + dayFullNames[di] + '\',' + slot.period + ',\'' + slot.time + '\',' + isCancelled + ')"'
            : '';
          tableHtml += '<td class="' + (isToday ? 'vp-today-col' : '') + '"><div class="' + cls + '" ' + onclickAttr + '>' + text + '</div></td>';
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table>';

    // ── MOBILE HTML – compact single-column ──
    // Persist selected tab across re-renders; default to today
    if (this._mobDayIdx === undefined || this._mobDayIdx === null) {
      this._mobDayIdx = (todayIdx >= 0) ? todayIdx : 0;
    }
    const mobDayIdx = this._mobDayIdx;
    const mobDayKey = dayKeys[mobDayIdx];
    const mobDayName = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'][mobDayIdx];
    const mobDaySchedule = weekTable[mobDayKey] || {};

    // Day selector tabs
    let mobTabs = '<div class="vp-mob-tabs">';
    days.forEach((d, i) => {
      const active = i === mobDayIdx ? ' vp-mob-tab-active' : '';
      const dn = dayDates[i];
      mobTabs += '<button class="vp-mob-tab' + active + '" onclick="this.getRootNode().host._switchMobDay(' + i + ')"><span class="vp-mob-tab-day">' + d + '</span><span class="vp-mob-tab-date">' + dn + '</span></button>';
    });
    mobTabs += '</div>';

    // Build rows for a given day
    const dayFullNames = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'];
    const buildMobRows = (dayKey, dayIdx) => {
      const sched = weekTable[dayKey] || {};
      const dName = dayFullNames[dayIdx] || dayKey;
      let rows = '';
      slots.forEach(slot => {
        if (slot.isPause) {
          rows += '<div class="vp-mob-pause-row"><span>Pause ' + slot.time + '</span></div>';
        } else {
          const lesson = sched[slot.lessonNumber];
          let rowCls = 'vp-mob-lesson';
          let subj = '';
          let isSub = false;
          if (lesson && lesson.fach) {
            subj = lesson.fach;
            isSub = !!lesson.ist_vertretung;
            if (isSub) rowCls += ' vp-mob-sub';
            rowCls += ' vp-mob-clickable';
          } else {
            rowCls += ' vp-mob-empty';
          }
          const onclickAttr = (lesson && lesson.fach)
            ? 'onclick="this.getRootNode().host._showLessonDetail(' + JSON.stringify(lesson).replace(/"/g, '&quot;') + ',\'' + dName + '\',' + slot.period + ',\'' + slot.time + '\')"'
            : '';
          const numPart = '<div class="vp-mob-left"><span class="vp-mob-num">' + slot.period + '</span>'
            + (showTime ? '<span class="vp-mob-time">' + slot.time + '</span>' : '') + '</div>';
          const subjPart = subj
            ? '<div class="vp-mob-subj' + (isSub ? ' vp-mob-subj-sub' : '') + '">' + subj + '</div>'
            : '<div class="vp-mob-subj vp-mob-subj-empty">—</div>';
          rows += '<div class="' + rowCls + '" ' + onclickAttr + '>' + numPart + subjPart + '</div>';
        }
      });
      return rows;
    };

    let mobileHtml = mobTabs + '<div id="vp-mob-content">' + buildMobRows(mobDayKey, mobDayIdx) + '</div>';

    this.shadowRoot.innerHTML = `
<style>
:host { display: block; }
ha-card {
  background: #0f1729 !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 6px 32px rgba(0,0,0,0.55) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0 !important;
}
/* HEADER */
.vp-hdr {
  display: ${showHeader ? 'flex' : 'none'};
  align-items: center; gap: 10px;
  padding: 12px 14px 10px; background: #0f1729;
  flex-wrap: nowrap; min-width: 0;
}
.vp-hdr-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.vp-hdr-row1 { display: flex; align-items: center; gap: 7px; flex-wrap: nowrap; min-width: 0; }
.vp-hdr-icon {
  width: 42px; height: 42px; flex-shrink: 0;
  background: linear-gradient(135deg,#3b82f6,#1d4ed8);
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 1.3em;
  box-shadow: 0 3px 10px rgba(29,78,216,0.45);
}
.vp-hdr-body { flex: 1; min-width: 0; }
.vp-hdr-top { display: flex; align-items: center; gap: 6px; }
.vp-hdr-title {
  font-size: 1.15em; font-weight: 700; color: #fff;
  line-height: 1.2; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.vp-hdr-sub { font-size: 0.8em; color: #94a3b8; white-space: nowrap; }
.vp-hdr-sep { color: #334155; font-size: 0.9em; flex-shrink: 0; }
.vp-hdr-spacer { flex: 1; min-width: 8px; }
@media (max-width: 600px) {
  .vp-hdr { flex-wrap: wrap; gap: 6px; }
  .vp-hdr-spacer { display: none; }
  .vp-hdr-title { font-size: 1.05em; }
}
.vp-hdr-actions {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: auto;
}
/* Unified pill style */
.vp-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 20px; padding: 5px 11px;
  font-size: 0.76em; font-weight: 500;
  color: #94a3b8; white-space: nowrap;
  cursor: default; font-family: inherit;
  transition: all .2s; line-height: 1.3;
}
.vp-pill-btn { cursor: pointer; }
.vp-pill-btn:hover { background: rgba(255,255,255,0.13); color: #fff; border-color: rgba(255,255,255,0.25); }
.vp-pill-info {
  background: rgba(245,158,11,0.1);
  border-color: rgba(245,158,11,0.3);
  color: #fcd34d; cursor: pointer; padding: 5px 9px;
}
.vp-pill-info:hover { background: rgba(245,158,11,0.2); border-color: #fcd34d; }
.vp-pill-info.has-info { animation: vp-pulse 2.5s ease-in-out infinite; }
@keyframes vp-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50%      { box-shadow: 0 0 0 5px rgba(245,158,11,0); }
}
/* On mobile: stack header vertically */
@media (max-width: 600px) {
  .vp-hdr { flex-wrap: wrap; align-items: flex-start; }
  .vp-hdr-body { flex: 1 1 calc(100% - 54px); }
  .vp-hdr-actions { width: 100%; margin-left: 54px; margin-top: 2px; }
}
/* TABLE */
.vp-table { width: 100%; border-collapse: separate; border-spacing: 0; padding: 0 12px 12px; }
.vp-table th {
  padding: 8px 4px; text-align: center; color: #475569;
  font-size: 0.78em; font-weight: 600; text-transform: uppercase;
  letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,0.07);
  background: #0f1729; line-height: 1.2;
}
.vp-th-day { display: block; }
.vp-th-date { display: block; font-size: 0.85em; color: #334155; font-weight: 500; text-transform: none; letter-spacing: 0; }
.vp-th-num { width: 56px; min-width: 56px; }
.vp-table td { padding: 3px 3px; text-align: center; vertical-align: middle; background: #0f1729; height: 52px; }
.vp-td-num { width: 56px; min-width: 56px; padding: 4px 6px; }
.vp-snum  { font-size: .88em; font-weight: 600; color: #94a3b8; line-height: 1.3; }
.vp-stime { font-size: .68em; color: #475569; margin-top: 1px; white-space: nowrap; }
/* TILES – all same height */
.vp-tile {
  background: #1a2a50; border-radius: 8px; padding: 0 5px;
  font-size: .88em; font-weight: 500; color: #e2e8f0;
  height: 46px; min-height: 46px;
  display: flex; align-items: center;
  justify-content: center; transition: background .15s;
}
.vp-tile.vp-empty { background: rgba(255,255,255,0.03); color: #475569; }
.vp-today-col .vp-tile {
  background: #1a2a50; border-radius: 8px; padding: 0 5px;
  font-size: .88em; font-weight: 500; color: #e2e8f0;
  height: 46px; min-height: 46px;
  display: flex; align-items: center;
  justify-content: center; transition: background .15s;
}
.vp-today-col .vp-tile.vp-empty { background: rgba(37,99,235,.2); color: rgba(255,255,255,.3); }
.vp-tile.vp-sub { background: #7f1d1d !important; color: #fca5a5 !important; font-weight: 600; }
/* Cancelled lesson */
.vp-tile.vp-cancelled { background: rgba(100,116,139,0.15) !important; color: #64748b !important; font-size: 1.1em; }
.vp-today-col .vp-tile.vp-cancelled { background: #991b1b !important; color: #fca5a5 !important; }
.vp-today-pill {
  background: #2563eb; color: #fff; border-radius: 8px;
  padding: 4px 10px; font-weight: 700; font-size: .82em;
  text-transform: uppercase; letter-spacing: .5px; display: inline-flex;
  flex-direction: column; align-items: center; gap: 1px;
}
.vp-today-date { font-size: 0.85em; font-weight: 500; opacity: 0.85; text-transform: none; letter-spacing: 0; }
.vp-table td { padding: 3px 3px; text-align: center; vertical-align: middle; background: #0f1729; height: 52px; }
.vp-td-num { width: 56px; min-width: 56px; padding: 4px 6px; }
.vp-snum  { font-size: .88em; font-weight: 600; color: #94a3b8; line-height: 1.3; }
.vp-stime { font-size: .68em; color: #475569; margin-top: 1px; white-space: nowrap; }
/* TILES */
.vp-tile {
  background: #1a2a50; border-radius: 8px; padding: 0 5px;
  font-size: .88em; font-weight: 500; color: #e2e8f0;
  height: 46px; min-height: 46px;
  display: flex; align-items: center;
  justify-content: center; transition: background .15s;
}
.vp-tile.vp-empty { background: rgba(255,255,255,0.03); color: #475569; }
.vp-today-col .vp-tile {
  background: #1a2a50; border-radius: 8px; padding: 0 5px;
  font-size: .88em; font-weight: 500; color: #e2e8f0;
  height: 46px; min-height: 46px;
  display: flex; align-items: center;
  justify-content: center; transition: background .15s;
}
.vp-today-col .vp-tile.vp-empty { background: rgba(37,99,235,.2); color: rgba(255,255,255,.3); }
.vp-tile.vp-sub { background: #7f1d1d !important; color: #fca5a5 !important; font-weight: 600; }
.vp-th-info { display: inline-flex; align-items: center; margin-left: 5px; vertical-align: middle; }
.vp-today-pill {
  background: #2563eb; color: #fff; border-radius: 8px;
  padding: 5px 12px; font-weight: 700; font-size: .82em;
  text-transform: uppercase; letter-spacing: .5px; display: inline-block;
}
/* PAUSE */
.vp-pause-tr td { padding: 2px 0; background: #0f1729; }
.vp-pause-cell {
  text-align: center; color: #93c5fd; font-size: .82em;
  padding: 9px 0; font-style: italic; font-weight: 500;
  background: rgba(37,99,235,0.1);
  border-top: 2px solid rgba(37,99,235,0.35);
  border-bottom: 2px solid rgba(37,99,235,0.35);
  letter-spacing: 0.3px;
}
/* LEGEND */
.vp-legend { display: flex; gap: 18px; padding: 8px 20px 16px; font-size: .82em; background: #0f1729; }
.vp-legend-item { display: flex; align-items: center; gap: 6px; }
.vp-ldot { width: 8px; height: 8px; border-radius: 50%; }
.vp-ldot-t { background: #3b82f6; }
.vp-ldot-s { background: #ef4444; }
.vp-lt { color: #60a5fa; font-weight: 600; }
.vp-ls { color: #f87171; font-weight: 600; }
.vp-ldot-c { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,.6); }
.vp-lc { color: #86efac; font-weight: 600; }
/* MOBILE */
.vp-desktop { display: block; }
.vp-mobile  { display: none; }
@media (max-width: 600px) { .vp-desktop { display: none; } .vp-mobile { display: block; } }
/* Day tabs */
.vp-mob-tabs {
  display: flex; gap: 4px; padding: 10px 12px 6px;
  background: #0f1729;
}
.vp-mob-tab {
  flex: 1; border: none; border-radius: 8px;
  background: rgba(255,255,255,.06); color: #64748b;
  font-size: .75em; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all .15s;
  text-transform: uppercase; letter-spacing: .4px;
  display: flex; flex-direction: column; align-items: center;
  gap: 1px; padding: 6px 4px;
}
.vp-mob-tab:hover { background: rgba(255,255,255,.1); color: #94a3b8; }
.vp-mob-tab-active { background: #2563eb !important; color: #fff !important; }
.vp-mob-tab-day { font-size: .82em; font-weight: 700; line-height: 1.2; }
.vp-mob-tab-date { font-size: .72em; font-weight: 500; opacity: .8; line-height: 1.2; }
/* Lesson rows */
.vp-mob-lesson {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; border-bottom: 1px solid rgba(255,255,255,.05);
}
.vp-mob-lesson:last-child { border-bottom: none; }
.vp-mob-sub   { background: rgba(127,29,29,.25); border-left: 3px solid #7f1d1d; }
.vp-mob-empty { opacity: .45; }
.vp-mob-left  { display: flex; flex-direction: column; align-items: center; min-width: 44px; }
.vp-mob-num   { font-size: .9em; font-weight: 700; color: #94a3b8; line-height: 1.2; }
.vp-mob-time  { font-size: .62em; color: #475569; margin-top: 1px; white-space: nowrap; }
.vp-mob-subj  {
  flex: 1; font-size: .95em; font-weight: 500; color: #e2e8f0;
  background: #1a2a50; border-radius: 8px;
  padding: 8px 12px; text-align: center;
}
.vp-mob-subj-sub   { background: #7f1d1d !important; color: #fca5a5 !important; font-weight: 600; }
.vp-mob-subj-empty { background: rgba(255,255,255,.03) !important; color: #475569 !important; }
/* Pause row */
.vp-mob-pause-row {
  text-align: center; padding: 8px 14px;
  border-top: 2px solid rgba(37,99,235,0.35);
  border-bottom: 2px solid rgba(37,99,235,0.35);
  background: rgba(37,99,235,0.1);
  color: #93c5fd; font-size: .78em; font-style: italic; font-weight: 500;
}
/* POPUP */
.vp-popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 999; }
.vp-popup-ausfall .vp-popup-title { display: none !important; }
.vp-popup-ausfall #popup-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0; }
.vp-popup-ausfall .vp-popup-footer { border-top: none !important; padding: 0 20px 20px; background: transparent; }
.vp-popup-ausfall {
  background: #7f1d1d !important;
  border-color: rgba(239,68,68,0.5) !important;
  box-shadow: 0 0 0 1px rgba(239,68,68,0.3), 0 12px 48px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.25) !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 220px;
}
.vp-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: #162040; border-radius: 14px; box-shadow: 0 12px 48px rgba(0,0,0,.7); padding: 0; max-width: 380px; width: 92%; z-index: 1000; border: 1px solid rgba(255,255,255,.12); color: #e2e8f0; overflow: hidden; }
.vp-popup-title { font-size: 1em; font-weight: 700; color: #fff; padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.vp-detail-num { font-size: .78em; font-weight: 600; color: #94a3b8; background: rgba(255,255,255,.07); padding: 3px 8px; border-radius: 5px; }
.vp-detail-fach { font-size: 1.1em; font-weight: 800; color: #fff; }
.vp-detail-badge { font-size: .7em; font-weight: 700; padding: 3px 8px; border-radius: 5px; }
.vp-detail-sub { background: rgba(239,68,68,.2); color: #fca5a5; border: 1px solid rgba(239,68,68,.3); }
.vp-detail-cancelled { background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.25); }
/* Detail rows */
.vp-detail-row { display: flex; align-items: center; gap: 12px; padding: 13px 20px; border-bottom: 1px solid rgba(255,255,255,.05); }
.vp-detail-row:last-child { border-bottom: none; }
.vp-detail-info-row { background: rgba(245,158,11,.06); }
.vp-detail-icon { font-size: 1.1em; width: 24px; text-align: center; flex-shrink: 0; }
.vp-detail-label { font-size: .78em; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; min-width: 52px; }
.vp-detail-val { font-size: .95em; font-weight: 500; color: #e2e8f0; flex: 1; }
.vp-detail-empty { padding: 16px 20px; color: #475569; font-size: .88em; font-style: italic; }
/* Clickable tiles */
.vp-tile-clickable { cursor: pointer; }
.vp-tile-clickable:hover { filter: brightness(1.15); transform: scale(1.03); transition: transform .12s, filter .12s; }
.vp-mob-clickable { cursor: pointer; }
.vp-mob-clickable:hover { filter: brightness(1.1); }
/* INFO BUTTON */
.vp-info-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(245,158,11,.15); border: 1.5px solid rgba(245,158,11,.4);
  color: #fcd34d; font-size: .9em; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s; font-family: inherit;
  line-height: 1;
}
.vp-info-btn:hover { background: rgba(245,158,11,.3); border-color: #fcd34d; transform: scale(1.1); }
.vp-info-btn.has-info { animation: vp-pulse 2.5s ease-in-out infinite; }
@keyframes vp-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,.4); }
  50%      { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
}
/* INFO POPUP */
.vp-info-popup-title {
  padding: 16px 20px 12px;
  font-size: 1em; font-weight: 700; color: #fcd34d;
  border-bottom: 1px solid rgba(245,158,11,.2);
  display: flex; align-items: center; gap: 8px;
}
.vp-info-popup-date {
  font-size: .78em; font-weight: 500; color: #94a3b8;
  margin-left: auto;
}
.vp-info-section { padding: 12px 20px 4px; }
.vp-info-section-label {
  font-size: .7em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .8px; color: #64748b; margin-bottom: 8px;
}
.vp-info-entry {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 9px 12px; margin-bottom: 6px;
  background: rgba(245,158,11,.07);
  border: 1px solid rgba(245,158,11,.15);
  border-radius: 8px; font-size: .88em; color: #e2e8f0; line-height: 1.5;
}
.vp-info-entry-icon { flex-shrink: 0; font-size: 1em; margin-top: 1px; }
.vp-info-none { padding: 16px 20px; color: #475569; font-size: .88em; font-style: italic; }
/* Popup footer */
.vp-popup-footer { padding: 12px 20px 16px; text-align: right; border-top: 1px solid rgba(255,255,255,.06); }
.vp-popup-btn { background: #2563eb; color: #fff; border: none; border-radius: 7px; padding: 9px 22px; cursor: pointer; font-size: .9em; font-family: inherit; transition: background .2s; }
.vp-popup-btn:hover { background: #1d4ed8; }
.info-item { padding: 10px 12px; margin-bottom: 8px; background: rgba(255,255,255,.05); border-radius: 6px; border-left: 3px solid #f59e0b; font-size: .9em; color: #94a3b8; }
.hidden { display: none !important; }
/* Ausfall popup */
.vp-ausfall-block {
  background: transparent;
  color: #fca5a5;
  font-size: 2.5em; font-weight: 900;
  letter-spacing: 4px; text-align: center;
  padding: 20px;
  text-shadow: 0 0 30px rgba(255,100,100,1), 0 0 60px rgba(255,50,50,0.7);
}
/* Current lesson highlight (green glow) */
.vp-tile.vp-current { background: #14532d !important; color: #86efac !important; font-weight: 700; box-shadow: 0 0 0 2px #22c55e; }
.vp-today-col .vp-tile.vp-current { background: #166534 !important; color: #bbf7d0 !important; box-shadow: 0 0 0 2px #4ade80; }
/* Today pill with date below */
.vp-today-pill { display: inline-flex; flex-direction: column; align-items: center; gap: 1px; background: #2563eb; color: #fff; border-radius: 8px; padding: 4px 12px; font-weight: 700; font-size: .82em; text-transform: uppercase; letter-spacing: .5px; }
.vp-today-date { font-size: .82em; font-weight: 500; opacity: .9; text-transform: none; letter-spacing: 0; }
/* Other day headers with date */
.vp-th-day { display: block; font-size: .78em; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #475569; }
.vp-th-date { display: block; font-size: .82em; font-weight: 600; color: #334155; margin-top: 1px; }
</style>
<ha-card>
  <div class="vp-hdr">
    <div class="vp-hdr-icon">📅</div>
    <div class="vp-hdr-body">
      <div class="vp-hdr-row1">
        <span class="vp-hdr-title">${title}</span>
        ${infoBtn ? '<button class="vp-pill vp-pill-info vp-pill-btn' + (infoBtnHasInfo ? ' has-info' : '') + '" onclick="this.getRootNode().host._showInfoPopup()" title="Zusatzinformationen">ⓘ</button>' : ''}
        <div class="vp-hdr-spacer"></div>
        ${this._config.reload_entity ? '<button class="vp-pill vp-pill-btn" onclick="this.getRootNode().host._handleReload()">↺ Aktualisieren</button>' : ''}
      </div>
      <span class="vp-hdr-sub">Klasse ${className}</span>
    </div>
  </div>
  <div class="vp-desktop">${tableHtml}</div>
  <div class="vp-mobile">${mobileHtml}</div>
  <div class="vp-legend">
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-t"></span><span class="vp-lt">Heute</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-s"></span><span class="vp-ls">Vertretung</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-c"></span><span class="vp-lc">Jetzt</span></div>
  </div>
</ha-card>
<!-- Lesson detail popup -->
<div id="popup-overlay" class="vp-popup-overlay hidden" onclick="this.getRootNode().host._closePopup()"></div>
<div id="popup" class="vp-popup hidden">
  <div id="popup-title" class="vp-popup-title">Details</div>
  <div id="popup-content"></div>
  <div class="vp-popup-footer"><button class="vp-popup-btn" onclick="this.getRootNode().host._closePopup()">Schließen</button></div>
</div>
<!-- Info popup -->
<div id="info-popup-overlay" class="vp-popup-overlay hidden" onclick="this.getRootNode().host._closeInfoPopup()"></div>
<div id="info-popup" class="vp-popup hidden">
  <div class="vp-info-popup-title">ℹ️ Zusatzinformationen</div>
  <div id="info-popup-content"></div>
  <div class="vp-popup-footer"><button class="vp-popup-btn" onclick="this.getRootNode().host._closeInfoPopup()">Schließen</button></div>
</div>`;
  }
}

customElements.define('vpmobile24-card', VpMobile24Card);
window.customCards = window.customCards || [];
window.customCards.push({ type:'vpmobile24-card', name:'VpMobile24 Card', description:'Wochenstundenplan', preview:true });
console.log('✅ VpMobile24 Card v2.4.2 loaded');

