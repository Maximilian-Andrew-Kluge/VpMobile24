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

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius, 4px);
          box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
          overflow: hidden;
        }
        .card-header {
          background: var(--primary-color);
          color: white;
          padding: 16px 20px;
          font-size: 1.3em;
          font-weight: 500;
        }
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
        }
        .schedule-table th,
        .schedule-table td {
          padding: 12px 8px;
          text-align: center;
          border: 1px solid var(--divider-color);
          font-size: 0.95em;
        }
        .schedule-table th {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-weight: 600;
        }
        .schedule-table th:first-child,
        .schedule-table td:first-child {
          text-align: left;
          padding-left: 16px;
          min-width: 140px;
          background: var(--secondary-background-color);
          font-weight: 500;
        }
        .today-column {
          background: var(--primary-color) !important;
          color: white !important;
        }
        .pause-row td {
          background: var(--secondary-background-color);
          color: var(--secondary-text-color);
          font-style: italic;
        }
        .lesson-substitution {
          background: var(--error-color) !important;
          color: white !important;
        }
        .empty-cell {
          color: var(--secondary-text-color);
        }
        @media (max-width: 768px) {
          .schedule-table th,
          .schedule-table td {
            padding: 8px 4px;
            font-size: 0.85em;
          }
          .schedule-table th:first-child,
          .schedule-table td:first-child {
            padding-left: 8px;
            min-width: 100px;
          }
        }
      </style>
      <ha-card>
        <div class="card-header">${title} - Klasse ${className}</div>
        ${this._renderTable(weekTableEntity)}
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

    let html = '<table class="schedule-table"><thead><tr><th>Stunde</th>';
    weekDays.forEach((day, i) => {
      html += `<th class="${i === todayIndex ? 'today-column' : ''}">${day}</th>`;
    });
    html += '</tr></thead><tbody>';

    timeSlots.forEach(slot => {
      if (slot.isPause) {
        html += `<tr class="pause-row"><td>${showTime ? slot.time : slot.label}</td><td colspan="5" style="text-align: center;">${slot.label}</td></tr>`;
      } else {
        const periodNum = slot.period.replace('.', '');
        const timeDisplay = showTime ? ` ${slot.time}` : '';
        html += `<tr><td>${slot.period}${timeDisplay}</td>`;
        
        weekDays.forEach((day, dayIndex) => {
          const dayKey = weekDayKeys[dayIndex];
          const daySchedule = weekTable[dayKey] || {};
          const lesson = daySchedule[periodNum];
          
          let cellContent = '';
          let cellClass = '';
          
          if (lesson && lesson.fach) {
            cellContent = lesson.fach;
            if (lesson.ist_vertretung) {
              cellClass = 'lesson-substitution';
            }
          } else {
            cellClass = 'empty-cell';
          }
          
          html += `<td class="${cellClass} ${dayIndex === todayIndex ? 'today-column' : ''}">${cellContent}</td>`;
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
