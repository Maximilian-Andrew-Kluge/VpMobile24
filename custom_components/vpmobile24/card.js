// VpMobile24 Card v2.4.0
console.info('%c VpMobile24-CARD %c v2.4.0 ', 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

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
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) this._render();
  }
  get hass() { return this._hass; }
  getCardSize() { return 6; }

  _handleReload() {
    if (!this._config.reload_entity) return;
    this._hass.callService('button', 'press', { entity_id: this._config.reload_entity });
  }

  _showInfoPopup() {
    if (!this._config.additional_info_entity) return;
    const ent = this._hass.states[this._config.additional_info_entity];
    if (!ent) return;
    const infos = [...(ent.attributes.allgemeine_infos||[]), ...(ent.attributes.stunden_infos||[])];
    const html = infos.length ? infos.map(i=>`<div class="info-item">${i}</div>`).join('') : '<div class="info-item">Keine Zusatzinformationen</div>';
    this.shadowRoot.getElementById('popup-content').innerHTML = html;
    this.shadowRoot.getElementById('popup').classList.remove('hidden');
    this.shadowRoot.getElementById('popup-overlay').classList.remove('hidden');
  }

  _closePopup() {
    this.shadowRoot.getElementById('popup').classList.add('hidden');
    this.shadowRoot.getElementById('popup-overlay').classList.add('hidden');
  }

  _switchMobDay(idx) {
    // Re-render mobile content for selected day index
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const days    = ['Mo','Di','Mi','Do','Fr'];
    const showTime = this._config.show_time !== false;
    const useCustomTimes = this._config.use_custom_times === true;
    const entity = this._hass && this._hass.states[this._config.entity];
    const weekTable = entity && entity.attributes && entity.attributes.week_table;
    if (!weekTable) return;

    const slots = this._buildTimeSlots(useCustomTimes);
    const sched = weekTable[dayKeys[idx]] || {};

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
        } else {
          rowCls += ' vp-mob-empty';
        }
        const numPart = '<div class="vp-mob-left"><span class="vp-mob-num">' + slot.period + '</span>'
          + (showTime ? '<span class="vp-mob-time">' + slot.time + '</span>' : '') + '</div>';
        const subjPart = subj
          ? '<div class="vp-mob-subj' + (isSub ? ' vp-mob-subj-sub' : '') + '">' + subj + '</div>'
          : '<div class="vp-mob-subj vp-mob-subj-empty">—</div>';
        rows += '<div class="' + rowCls + '">' + numPart + subjPart + '</div>';
      }
    });

    const content = this.shadowRoot.getElementById('vp-mob-content');
    if (content) content.innerHTML = rows;

    // Update tab active state
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

    // ── TABLE HTML ──
    let tableHtml = '<table class="vp-table"><thead><tr><th class="vp-th-num">#</th>';
    days.forEach((d, i) => {
      if (i === todayIdx) {
        tableHtml += '<th><span class="vp-today-pill">' + d + '</span></th>';
      } else {
        tableHtml += '<th>' + d + '</th>';
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
        days.forEach((d, di) => {
          const lesson = (weekTable[dayKeys[di]] || {})[slot.lessonNumber];
          const isToday = di === todayIdx;
          let cls = 'vp-tile';
          let text = '';
          if (lesson && lesson.fach) {
            text = lesson.fach;
            if (lesson.ist_vertretung) cls += ' vp-sub';
            else if (isToday) cls += ' vp-today-tile';
          } else {
            cls += isToday ? ' vp-today-tile vp-empty' : ' vp-empty';
          }
          tableHtml += '<td class="' + (isToday ? 'vp-today-col' : '') + '"><div class="' + cls + '">' + text + '</div></td>';
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table>';

    // ── MOBILE HTML – compact single-column (today's schedule) ──
    // Show today's day; if weekend show Monday
    const mobDayIdx = (todayIdx >= 0) ? todayIdx : 0;
    const mobDayKey = dayKeys[mobDayIdx];
    const mobDayName = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'][mobDayIdx];
    const mobDaySchedule = weekTable[mobDayKey] || {};

    // Day selector tabs
    let mobTabs = '<div class="vp-mob-tabs">';
    days.forEach((d, i) => {
      const active = i === mobDayIdx ? ' vp-mob-tab-active' : '';
      mobTabs += '<button class="vp-mob-tab' + active + '" onclick="this.getRootNode().host._switchMobDay(' + i + ')">' + d + '</button>';
    });
    mobTabs += '</div>';

    // Build rows for a given day
    const buildMobRows = (dayKey) => {
      const sched = weekTable[dayKey] || {};
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
          } else {
            rowCls += ' vp-mob-empty';
          }
          const numPart = '<div class="vp-mob-left"><span class="vp-mob-num">' + slot.period + '</span>'
            + (showTime ? '<span class="vp-mob-time">' + slot.time + '</span>' : '') + '</div>';
          const subjPart = subj
            ? '<div class="vp-mob-subj' + (isSub ? ' vp-mob-subj-sub' : '') + '">' + subj + '</div>'
            : '<div class="vp-mob-subj vp-mob-subj-empty">—</div>';
          rows += '<div class="' + rowCls + '">' + numPart + subjPart + '</div>';
        }
      });
      return rows;
    };

    let mobileHtml = mobTabs + '<div id="vp-mob-content">' + buildMobRows(mobDayKey) + '</div>';

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
  align-items: center; gap: 14px;
  padding: 18px 20px 14px; background: #0f1729;
}
.vp-hdr-icon {
  width: 46px; height: 46px; flex-shrink: 0;
  background: linear-gradient(135deg,#3b82f6,#1d4ed8);
  border-radius: 11px; display: flex; align-items: center;
  justify-content: center; font-size: 1.5em;
  box-shadow: 0 3px 12px rgba(29,78,216,0.5);
}
.vp-hdr-text { flex: 1; min-width: 0; }
.vp-hdr-title { font-size: 1.35em; font-weight: 700; color: #fff; line-height: 1.2; }
.vp-hdr-sub   { font-size: 0.85em; color: #94a3b8; margin-top: 2px; }
.vp-chip {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px; padding: 6px 14px; font-size: 0.82em;
  color: #94a3b8; white-space: nowrap; flex-shrink: 0;
}
.vp-reload {
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px; padding: 7px 13px; color: #94a3b8;
  cursor: pointer; font-size: 0.82em; white-space: nowrap;
  flex-shrink: 0; font-family: inherit; transition: all .2s;
}
.vp-reload:hover { background: rgba(255,255,255,0.13); color: #fff; }
/* TABLE */
.vp-table { width: 100%; border-collapse: separate; border-spacing: 0; padding: 0 12px 12px; }
.vp-table th {
  padding: 10px 4px; text-align: center; color: #475569;
  font-size: 0.78em; font-weight: 600; text-transform: uppercase;
  letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,0.07);
  background: #0f1729;
}
.vp-th-num { width: 56px; min-width: 56px; }
.vp-table td { padding: 4px 3px; text-align: center; vertical-align: middle; background: #0f1729; }
.vp-td-num { width: 56px; min-width: 56px; padding: 4px 6px; }
.vp-snum  { font-size: .88em; font-weight: 600; color: #94a3b8; line-height: 1.3; }
.vp-stime { font-size: .68em; color: #475569; margin-top: 1px; white-space: nowrap; }
/* TILES */
.vp-tile {
  background: #1a2a50; border-radius: 8px; padding: 9px 5px;
  font-size: .88em; font-weight: 500; color: #e2e8f0;
  min-height: 36px; display: flex; align-items: center;
  justify-content: center; transition: background .15s;
}
.vp-tile.vp-empty { background: rgba(255,255,255,0.03); color: #475569; }
.vp-today-col .vp-tile { background: #2563eb; color: #fff; font-weight: 600; }
.vp-today-col .vp-tile.vp-empty { background: rgba(37,99,235,.2); color: rgba(255,255,255,.3); }
.vp-tile.vp-sub { background: #7f1d1d !important; color: #fca5a5 !important; font-weight: 600; }
.vp-today-pill {
  background: #2563eb; color: #fff; border-radius: 8px;
  padding: 5px 12px; font-weight: 700; font-size: .82em;
  text-transform: uppercase; letter-spacing: .5px; display: inline-block;
}
/* PAUSE */
.vp-pause-tr td { padding: 3px 0; background: #0f1729; }
.vp-pause-cell {
  text-align: center; color: #64748b; font-size: .82em;
  padding: 7px 0; border-top: 1px solid rgba(255,255,255,.07);
  border-bottom: 1px solid rgba(255,255,255,.07);
}
/* LEGEND */
.vp-legend { display: flex; gap: 18px; padding: 8px 20px 16px; font-size: .82em; background: #0f1729; }
.vp-legend-item { display: flex; align-items: center; gap: 6px; }
.vp-ldot { width: 8px; height: 8px; border-radius: 50%; }
.vp-ldot-t { background: #3b82f6; }
.vp-ldot-s { background: #ef4444; }
.vp-lt { color: #60a5fa; font-weight: 600; }
.vp-ls { color: #f87171; font-weight: 600; }
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
  flex: 1; padding: 7px 4px; border: none; border-radius: 8px;
  background: rgba(255,255,255,.06); color: #64748b;
  font-size: .82em; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all .15s;
  text-transform: uppercase; letter-spacing: .4px;
}
.vp-mob-tab:hover { background: rgba(255,255,255,.1); color: #94a3b8; }
.vp-mob-tab-active { background: #2563eb !important; color: #fff !important; }
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
  text-align: center; padding: 6px 14px;
  border-top: 1px solid rgba(255,255,255,.07);
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: rgba(0,0,0,.15);
  color: #64748b; font-size: .78em; font-style: italic;
}
/* POPUP */
.vp-popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 999; }
.vp-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: #162040; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.6); padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; z-index: 1000; border: 1px solid rgba(255,255,255,.1); color: #e2e8f0; }
.vp-popup-title { font-size: 1.2em; font-weight: 700; margin-bottom: 14px; color: #fff; border-bottom: 1px solid rgba(255,255,255,.1); padding-bottom: 10px; }
.info-item { padding: 10px 12px; margin-bottom: 8px; background: rgba(255,255,255,.05); border-radius: 6px; border-left: 3px solid #f59e0b; font-size: .9em; color: #94a3b8; }
.vp-popup-footer { margin-top: 14px; text-align: right; }
.vp-popup-btn { background: #2563eb; color: #fff; border: none; border-radius: 7px; padding: 9px 22px; cursor: pointer; font-size: .9em; font-family: inherit; }
.vp-popup-btn:hover { background: #1d4ed8; }
.hidden { display: none !important; }
</style>
<ha-card>
  <div class="vp-hdr">
    <div class="vp-hdr-icon">📅</div>
    <div class="vp-hdr-text">
      <div class="vp-hdr-title">${title}</div>
      <div class="vp-hdr-sub">Klasse ${className}</div>
    </div>
    <div class="vp-chip">${dateChip}</div>
    ${this._config.reload_entity ? '<button class="vp-reload" onclick="this.getRootNode().host._handleReload()">↺ Neu laden</button>' : ''}
  </div>
  <div class="vp-desktop">${tableHtml}</div>
  <div class="vp-mobile">${mobileHtml}</div>
  <div class="vp-legend">
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-t"></span><span class="vp-lt">Heute</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-s"></span><span class="vp-ls">Vertretung</span></div>
  </div>
</ha-card>
<div id="popup-overlay" class="vp-popup-overlay hidden" onclick="this.getRootNode().host._closePopup()"></div>
<div id="popup" class="vp-popup hidden">
  <div class="vp-popup-title">Zusatzinformationen</div>
  <div id="popup-content"></div>
  <div class="vp-popup-footer"><button class="vp-popup-btn" onclick="this.getRootNode().host._closePopup()">OK</button></div>
</div>`;
  }
}

customElements.define('vpmobile24-card', VpMobile24Card);
window.customCards = window.customCards || [];
window.customCards.push({ type:'vpmobile24-card', name:'VpMobile24 Card', description:'Wochenstundenplan', preview:true });
console.log('✅ VpMobile24 Card v2.4.0 loaded');

