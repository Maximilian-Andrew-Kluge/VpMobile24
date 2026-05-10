// VpMobile24 Card v3.2.0 - Hybrid Editor (works with all HA versions)
console.info('%c VpMobile24-CARD %c v3.2.0 ', 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

// Editor Element (for older HA versions)
class VpMobile24CardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    if (!this._content) {
      this.innerHTML = `
        <style>
          .card-config { padding: 16px; }
          .setting { margin: 16px 0; }
          .setting label { display: block; margin-bottom: 8px; font-weight: 500; }
          .setting input, .setting select { 
            width: 100%; 
            padding: 8px; 
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            background: var(--card-background-color);
            color: var(--primary-text-color);
            box-sizing: border-box;
          }
          .setting input[type="checkbox"] { width: auto; margin-right: 8px; }
          .help { font-size: 12px; color: var(--secondary-text-color); margin-top: 4px; }
        </style>
        <div class="card-config">
          <div class="setting">
            <label>Entity (Week Table Sensor)</label>
            <input type="text" class="entity-input" placeholder="sensor.vpmobile24_week_table">
            <div class="help">Entity ID des Week Table Sensors</div>
          </div>
          <div class="setting">
            <label>Titel</label>
            <input type="text" class="title-input" placeholder="Stundenplan">
            <div class="help">Titel der Card</div>
          </div>
          <div class="setting">
            <label>Klassenname</label>
            <input type="text" class="class-input" placeholder="5a">
            <div class="help">Name der Klasse</div>
          </div>
          <div class="setting">
            <label>
              <input type="checkbox" class="time-checkbox">
              Uhrzeiten anzeigen
            </label>
          </div>
          <div class="setting">
            <label>
              <input type="checkbox" class="highlight-checkbox">
              Heutigen Tag hervorheben
            </label>
          </div>
        </div>
      `;
      this._content = this.querySelector('.card-config');
      this._setupListeners();
    }
    this._updateValues();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _setupListeners() {
    this.querySelector('.entity-input').addEventListener('input', (e) => {
      this._config.entity = e.target.value;
      this._fireChange();
    });

    this.querySelector('.title-input').addEventListener('input', (e) => {
      this._config.title = e.target.value;
      this._fireChange();
    });

    this.querySelector('.class-input').addEventListener('input', (e) => {
      this._config.class_name = e.target.value;
      this._fireChange();
    });

    this.querySelector('.time-checkbox').addEventListener('change', (e) => {
      this._config.show_time = e.target.checked;
      this._fireChange();
    });

    this.querySelector('.highlight-checkbox').addEventListener('change', (e) => {
      this._config.highlight_today = e.target.checked;
      this._fireChange();
    });
  }

  _updateValues() {
    const entityInput = this.querySelector('.entity-input');
    const titleInput = this.querySelector('.title-input');
    const classInput = this.querySelector('.class-input');
    const timeCheckbox = this.querySelector('.time-checkbox');
    const highlightCheckbox = this.querySelector('.highlight-checkbox');

    if (entityInput) entityInput.value = this._config.entity || '';
    if (titleInput) titleInput.value = this._config.title || 'Stundenplan';
    if (classInput) classInput.value = this._config.class_name || '5a';
    if (timeCheckbox) timeCheckbox.checked = this._config.show_time !== false;
    if (highlightCheckbox) highlightCheckbox.checked = this._config.highlight_today !== false;
  }

  _fireChange() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('vpmobile24-card-editor', VpMobile24CardEditor);
console.log('✅ Editor element registered');

// Main Card
class VpMobile24Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // Modern method (HA 2024.2+)
  static getConfigForm() {
    return {
      schema: [
        { 
          name: "entity", 
          required: true, 
          selector: { 
            entity: { 
              filter: {
                domain: "sensor"
              }
            } 
          } 
        },
        {
          type: "grid",
          name: "",
          schema: [
            { 
              name: "title", 
              selector: { text: {} } 
            },
            { 
              name: "class_name", 
              selector: { text: {} } 
            },
          ],
        },
        { 
          name: "show_time", 
          selector: { boolean: {} } 
        },
        { 
          name: "highlight_today", 
          selector: { boolean: {} } 
        },
      ],
      computeLabel: (schema) => {
        switch (schema.name) {
          case "entity":
            return "Week Table Sensor";
          case "title":
            return "Titel";
          case "class_name":
            return "Klassenname";
          case "show_time":
            return "Uhrzeiten anzeigen";
          case "highlight_today":
            return "Heutigen Tag hervorheben";
        }
        return undefined;
      },
      computeHelper: (schema) => {
        switch (schema.name) {
          case "entity":
            return "Wähle den sensor.vpmobile24_week_table Sensor";
          case "title":
            return "Titel der Card (z.B. 'Stundenplan')";
          case "class_name":
            return "Name der Klasse (z.B. '5a', '10b')";
          case "show_time":
            return "Zeigt die Uhrzeiten für jede Stunde an";
          case "highlight_today":
            return "Hebt die Spalte des heutigen Tages farblich hervor";
        }
        return undefined;
      },
      assertConfig: (config) => {
        if (!config.entity) {
          throw new Error("Entity ist erforderlich");
        }
      },
    };
  }

  // Legacy method (older HA versions)
  static getConfigElement() {
    return document.createElement('vpmobile24-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.vpmobile24_week_table',
      title: 'Stundenplan',
      class_name: '5a',
      show_time: true,
      highlight_today: true,
    };
  }

  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 6;
  }

  _render() {
    if (!this._hass) return;
    
    if (!this.config.entity) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 20px; text-align: center;">
            <p>Bitte konfiguriere die Card über den Editor</p>
          </div>
        </ha-card>
      `;
      return;
    }

    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];

    if (!stateObj) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 20px; color: var(--error-color);">
            <h3>Entity nicht gefunden</h3>
            <p>Entity ${entityId} existiert nicht.</p>
          </div>
        </ha-card>
      `;
      return;
    }

    const weekTableEntity = this._hass.states['sensor.vpmobile24_week_table'];
    const className = this.config.class_name || '5a';
    const title = this.config.title || 'Stundenplan';

    const now = new Date();
    const wdn = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    const mon = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    const dateChip = `${wdn[now.getDay()]}, ${now.getDate()}. ${mon[now.getMonth()]}`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --vp-bg:         #0f1729;
          --vp-card-bg:    #162040;
          --vp-cell-bg:    #1a2a50;
          --vp-cell-hover: #1e3060;
          --vp-today-bg:   #2563eb;
          --vp-sub-bg:     #7f1d1d;
          --vp-sub-text:   #fca5a5;
          --vp-pause:      #64748b;
          --vp-text:       #e2e8f0;
          --vp-muted:      #94a3b8;
          --vp-dim:        #475569;
          --vp-border:     rgba(255,255,255,0.07);
          --vp-r:          10px;
          --vp-rs:         7px;
        }
        ha-card {
          background: var(--vp-bg);
          border-radius: var(--vp-r);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
          border: 1px solid var(--vp-border);
        }
        .vp-header {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px 14px;
        }
        .vp-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg,#3b82f6,#1d4ed8);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4em; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(29,78,216,0.4);
        }
        .vp-title { font-size:1.35em; font-weight:700; color:var(--vp-text); line-height:1.2; }
        .vp-sub   { font-size:0.85em; color:var(--vp-muted); margin-top:2px; }
        .vp-chip  {
          margin-left: auto;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 6px 14px;
          font-size: 0.82em; color: var(--vp-muted); white-space: nowrap;
        }
        .schedule-table {
          width: 100%; border-collapse: separate; border-spacing: 0;
          padding: 0 12px 12px;
        }
        .schedule-table th {
          padding: 10px 6px; text-align: center;
          color: var(--vp-dim); font-size: 0.78em; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid var(--vp-border);
        }
        .schedule-table th:first-child { width: 28px; }
        .schedule-table td { padding: 5px 4px; text-align: center; vertical-align: middle; }
        .schedule-table td:first-child { color:var(--vp-dim); font-size:0.82em; font-weight:500; width:28px; }
        .cell-tile {
          background: var(--vp-cell-bg); border-radius: var(--vp-rs);
          padding: 9px 6px; font-size: 0.88em; font-weight: 500;
          color: var(--vp-text); min-height: 36px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .cell-tile.empty { background: transparent; color: var(--vp-dim); }
        .today-col .cell-tile { background: var(--vp-today-bg); color:#fff; font-weight:600; }
        .today-col .cell-tile.empty { background: rgba(37,99,235,0.25); color: rgba(255,255,255,0.35); }
        .today-header-pill {
          background: var(--vp-today-bg); color:#fff !important;
          border-radius: 8px; padding: 5px 10px;
          display: inline-block; font-weight:700 !important;
          font-size: 0.82em !important; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .cell-tile.substitution { background: var(--vp-sub-bg) !important; color: var(--vp-sub-text) !important; font-weight:600; }
        .pause-row td { padding: 4px 0; }
        .pause-cell {
          text-align: center; color: var(--vp-pause); font-size: 0.82em;
          padding: 6px 0;
          border-top: 1px solid var(--vp-border);
          border-bottom: 1px solid var(--vp-border);
        }
        .vp-legend {
          display: flex; gap: 18px; padding: 10px 20px 16px; font-size: 0.82em;
        }
        .vp-legend-item { display: flex; align-items: center; gap: 6px; }
        .ldot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .ldot.t { background:#3b82f6; }
        .ldot.s { background:#ef4444; }
        .lt { color:#60a5fa; font-weight:600; }
        .ls { color:#f87171; font-weight:600; }
      </style>
      <ha-card>
        <div class="vp-header">
          <div class="vp-icon">📅</div>
          <div><div class="vp-title">${title}</div><div class="vp-sub">Klasse ${className}</div></div>
          <div class="vp-chip">${dateChip}</div>
        </div>
        ${this._renderTable(weekTableEntity)}
        <div class="vp-legend">
          <div class="vp-legend-item"><span class="ldot t"></span><span class="lt">Heute</span></div>
          <div class="vp-legend-item"><span class="ldot s"></span><span class="ls">Vertretung</span></div>
        </div>
      </ha-card>
    `;
  }

  _renderTable(weekTableEntity) {
    if (!weekTableEntity) {
      return `<div style="padding: 20px; text-align: center;">Week Table Sensor nicht gefunden</div>`;
    }

    const weekTable = weekTableEntity?.attributes?.week_table;
    if (!weekTable) {
      return `<div style="padding: 20px; text-align: center;">Keine Wochendaten verfügbar</div>`;
    }

    const showTime = this.config.show_time !== false;
    const highlightToday = this.config.highlight_today !== false;

    const timeSlots = [
      { period: '1.', time: '07:45-08:30' },
      { period: '2.', time: '08:35-09:20' },
      { period: '', time: '09:20-09:40', isPause: true, label: 'gr. Pause' },
      { period: '3.', time: '09:40-10:25' },
      { period: '4.', time: '10:30-11:15' },
      { period: '', time: '11:15-11:40', isPause: true, label: 'gr. Pause' },
      { period: '5.', time: '11:40-12:25' },
      { period: '6.', time: '12:30-13:15' },
    ];

    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
    const weekDayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const today = new Date().getDay();
    const todayIndex = highlightToday && today !== 0 ? today - 1 : -1;

    let html = '<table class="schedule-table"><thead><tr><th>#</th>';
    weekDays.forEach((day, i) => {
      const isToday = i === todayIndex;
      const label = isToday ? `<span class="today-header-pill">${day}</span>` : day;
      html += `<th class="${isToday ? 'today-col' : ''}">${label}</th>`;
    });
    html += '</tr></thead><tbody>';

    timeSlots.forEach(slot => {
      if (slot.isPause) {
        html += `<tr class="pause-row"><td colspan="6"><div class="pause-cell">Pause ${slot.time}</div></td></tr>`;
      } else {
        const periodNum = slot.period.replace('.', '');
        html += `<tr><td>${slot.period}</td>`;
        weekDays.forEach((day, dayIndex) => {
          const dayKey = weekDayKeys[dayIndex];
          const daySchedule = weekTable[dayKey] || {};
          const lesson = daySchedule[periodNum];
          const isToday = dayIndex === todayIndex;
          let tileClass = 'cell-tile';
          let content = '';
          if (lesson && lesson.fach) {
            content = lesson.fach;
            if (lesson.ist_vertretung) tileClass += ' substitution';
          } else {
            tileClass += ' empty';
          }
          html += `<td class="${isToday ? 'today-col' : ''}"><div class="${tileClass}">${content}</div></td>`;
        });
        html += '</tr>';
      }
    });

    html += '</tbody></table>';
    return html;
  }
}

customElements.define('vpmobile24-card', VpMobile24Card);
console.log('✅ Card registered with both editor methods');

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'vpmobile24-card',
  name: 'VpMobile24 Card',
  description: 'Wochenstundenplan mit visuellem Editor',
  preview: true,
});

console.log('✅ VpMobile24 Card v3.2.0 loaded - Hybrid editor support');
console.log('Has getConfigForm:', typeof VpMobile24Card.getConfigForm === 'function');
console.log('Has getConfigElement:', typeof VpMobile24Card.getConfigElement === 'function');
console.log('Editor element exists:', customElements.get('vpmobile24-card-editor') !== undefined);
