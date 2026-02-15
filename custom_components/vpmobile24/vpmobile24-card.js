// VpMobile24 Card v2.0.1 - Automatic card loading
console.info('%c VpMobile24-CARD %c v2.0.1 ', 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

class VpMobile24Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static getConfigForm() {
    return {
      schema: [
        { 
          name: "entity", 
          required: true,
          selector: { 
            entity: { 
              filter: [{ integration: "vpmobile24" }]
            } 
          } 
        },
        { 
          name: "show_header", 
          default: true,
          selector: { boolean: {} } 
        },
        {
          type: "expandable",
          name: "header_settings",
          title: "Header-Einstellungen",
          collapsed: false,
          schema: [
            { 
              name: "title", 
              default: "Stundenplan",
              selector: { text: { type: "text" } } 
            },
            { 
              name: "class_name", 
              default: "5a",
              selector: { text: { type: "text" } } 
            }
          ]
        },
        {
          name: "custom_theme",
          default: "auto",
          selector: { theme: {} }
        },
        { 
          name: "highlight_today", 
          default: true,
          selector: { boolean: {} } 
        },
        { 
          name: "show_time", 
          default: true,
          selector: { boolean: {} } 
        },
        {
          name: "use_custom_times",
          default: false,
          selector: { boolean: {} }
        },
        {
          type: "expandable",
          name: "time_settings",
          title: "Uhrzeiten-Anpassung",
          collapsed: true,
          schema: [
            {
              name: "lesson_count",
              default: 6,
              selector: { number: { min: 1, max: 10, step: 1, mode: "box" } }
            },
            {
              name: "pause_count",
              default: 2,
              selector: { number: { min: 0, max: 5, step: 1, mode: "box" } }
            },
            { name: "time_1", default: "07:45-08:30", selector: { text: { type: "text" } } },
            { name: "time_2", default: "08:35-09:20", selector: { text: { type: "text" } } },
            { name: "time_3", default: "09:40-10:25", selector: { text: { type: "text" } } },
            { name: "time_4", default: "10:30-11:15", selector: { text: { type: "text" } } },
            { name: "time_5", default: "11:40-12:25", selector: { text: { type: "text" } } },
            { name: "time_6", default: "12:30-13:15", selector: { text: { type: "text" } } },
            { name: "time_7", default: "13:20-14:05", selector: { text: { type: "text" } } },
            { name: "time_8", default: "14:10-14:55", selector: { text: { type: "text" } } },
            { name: "time_9", default: "15:00-15:45", selector: { text: { type: "text" } } },
            { name: "time_10", default: "15:50-16:35", selector: { text: { type: "text" } } },
            {
              type: "grid",
              name: "pause_1_config",
              schema: [
                { name: "pause_1", default: "09:20-09:40", selector: { text: { type: "text" } } },
                { name: "pause_1_after", default: 2, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
              ]
            },
            {
              type: "grid",
              name: "pause_2_config",
              schema: [
                { name: "pause_2", default: "11:15-11:40", selector: { text: { type: "text" } } },
                { name: "pause_2_after", default: 4, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
              ]
            },
            {
              type: "grid",
              name: "pause_3_config",
              schema: [
                { name: "pause_3", default: "13:15-13:20", selector: { text: { type: "text" } } },
                { name: "pause_3_after", default: 6, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
              ]
            },
            {
              type: "grid",
              name: "pause_4_config",
              schema: [
                { name: "pause_4", default: "14:55-15:00", selector: { text: { type: "text" } } },
                { name: "pause_4_after", default: 8, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
              ]
            },
            {
              type: "grid",
              name: "pause_5_config",
              schema: [
                { name: "pause_5", default: "16:35-16:40", selector: { text: { type: "text" } } },
                { name: "pause_5_after", default: 10, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
              ]
            }
          ]
        }
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: "Week Table Sensor",
          title: "Titel",
          class_name: "Klassenname",
          show_time: "Uhrzeiten anzeigen",
          show_header: "Header anzeigen",
          highlight_today: "Heutigen Tag hervorheben",
          custom_theme: "Theme",
          use_custom_times: "Eigene Uhrzeiten verwenden",
          lesson_count: "Anzahl der Stunden",
          pause_count: "Anzahl der Pausen",
          time_1: "1. Stunde", time_2: "2. Stunde", time_3: "3. Stunde",
          time_4: "4. Stunde", time_5: "5. Stunde", time_6: "6. Stunde",
          time_7: "7. Stunde", time_8: "8. Stunde", time_9: "9. Stunde", time_10: "10. Stunde",
          pause_1: "1. Pause - Zeit", pause_1_after: "1. Pause - Nach Stunde",
          pause_2: "2. Pause - Zeit", pause_2_after: "2. Pause - Nach Stunde",
          pause_3: "3. Pause - Zeit", pause_3_after: "3. Pause - Nach Stunde",
          pause_4: "4. Pause - Zeit", pause_4_after: "4. Pause - Nach Stunde",
          pause_5: "5. Pause - Zeit", pause_5_after: "5. Pause - Nach Stunde",
        };
        return labels[schema.name];
      },
      computeHelper: (schema) => {
        const helpers = {
          entity: "Wähle den sensor.vpmobile24_week_table Sensor",
          title: "Titel der Card (z.B. 'Stundenplan')",
          class_name: "Name der Klasse (z.B. '5a', '10b')",
          show_time: "Zeigt die Uhrzeiten für jede Stunde an",
          show_header: "Zeigt den Header mit Titel und Klassenname an",
          highlight_today: "Hebt die Spalte des heutigen Tages farblich hervor",
          custom_theme: "Wähle ein installiertes Theme oder 'auto' für automatische Anpassung",
          use_custom_times: "Aktiviere dies, um die Uhrzeiten-Anpassung unten zu nutzen",
        };
        return helpers[schema.name];
      },
      computeVisible: (schema, config) => {
        // Remove conditional visibility - show all sections always
        return true;
      },
    };
  }

  static getStubConfig() {
    return {
      entity: 'sensor.vpmobile24_week_table',
      title: 'Stundenplan',
      class_name: '5a',
      show_header: true,
      show_time: true,
      highlight_today: true,
      custom_theme: 'auto',
      use_custom_times: false,
      lesson_count: 6,
      pause_count: 2,
    };
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error('Entity ist erforderlich');
    }
    
    // Store complete config including all nested values
    this._config = Object.assign({}, config);
    
    // Force immediate re-render
    if (this._hass) {
      this._render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    // Always re-render when hass updates
    if (this._config) {
      this._render();
    }
  }

  get hass() {
    return this._hass;
  }

  requestUpdate() {
    if (this._hass && this._config) {
      this._render();
    }
  }

  getCardSize() {
    return 6;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const entity = this._hass.states[this._config.entity];
    if (!entity) {
      this.shadowRoot.innerHTML = `<ha-card><div style="padding: 20px; color: var(--error-color);">Entity nicht gefunden</div></ha-card>`;
      return;
    }

    const weekTable = entity?.attributes?.week_table;
    if (!weekTable) {
      this.shadowRoot.innerHTML = `<ha-card><div style="padding: 20px;">Keine Wochendaten verfügbar</div></ha-card>`;
      return;
    }

    // Read from nested objects if they exist, otherwise use top-level values
    const title = this._config.header_settings?.title || this._config.title || 'Stundenplan';
    const className = this._config.header_settings?.class_name || this._config.class_name || '5a';
    const showHeader = this._config.show_header !== false;
    const showTime = this._config.show_time !== false;
    const highlightToday = this._config.highlight_today !== false;
    const useCustomTimes = this._config.use_custom_times === true;

    const primaryColor = 'var(--primary-color)';

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          background: var(--card-background-color);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: none;
          border: 1px solid var(--divider-color);
        }
        .card-header {
          background: ${primaryColor};
          color: white;
          padding: 16px 20px;
          font-size: 1.3em;
          font-weight: 500;
          display: ${showHeader ? 'block' : 'none'};
        }
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
        }
        .schedule-table th,
        .schedule-table td {
          padding: 12px 16px;
          text-align: center;
          border-bottom: 1px solid var(--divider-color);
          border-right: 1px solid var(--divider-color);
          font-size: 0.9em;
        }
        .schedule-table th:last-child,
        .schedule-table td:last-child {
          border-right: none;
        }
        .schedule-table th {
          background: var(--card-background-color);
          color: var(--secondary-text-color);
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.75em;
        }
        .schedule-table th:first-child,
        .schedule-table td:first-child {
          text-align: left;
          padding-left: 20px;
          font-weight: 500;
          border-right: 3px solid var(--divider-color);
        }
        .schedule-table tbody tr:last-child td {
          border-bottom: none;
        }
        .today-column {
          background: ${primaryColor} !important;
          color: white !important;
          font-weight: 500 !important;
        }
        .pause-row td {
          background: var(--secondary-background-color);
          color: var(--secondary-text-color);
          font-style: italic;
          font-size: 0.85em;
        }
        .lesson-substitution {
          background: #ff5252 !important;
          color: white !important;
          font-weight: 500 !important;
        }
        .empty-cell {
          color: var(--disabled-text-color);
        }
      </style>
      <ha-card>
        ${showHeader ? `<div class="card-header">${title} - Klasse ${className}</div>` : ''}
        <div>${this._renderTable(weekTable, showTime, highlightToday, useCustomTimes)}</div>
      </ha-card>
    `;
  }

  _renderTable(weekTable, showTime, highlightToday, useCustomTimes) {
    const defaults = {
      time_1: '07:45-08:30', time_2: '08:35-09:20', time_3: '09:40-10:25',
      time_4: '10:30-11:15', time_5: '11:40-12:25', time_6: '12:30-13:15',
      time_7: '13:20-14:05', time_8: '14:10-14:55', time_9: '15:00-15:45', time_10: '15:50-16:35',
      pause_1: '09:20-09:40', pause_1_after: 2,
      pause_2: '11:15-11:40', pause_2_after: 4,
    };

    // Read from nested time_settings object if it exists, otherwise use top-level values
    const timeSettings = this._config.time_settings || {};
    const lessonCount = useCustomTimes ? (timeSettings.lesson_count || this._config.lesson_count || 6) : 6;
    const pauseCount = useCustomTimes ? (timeSettings.pause_count || this._config.pause_count || 2) : 2;

    const timeSlots = [];
    for (let i = 1; i <= lessonCount; i++) {
      // Check nested time_settings first, then top-level config, then defaults
      const configTime = timeSettings[`time_${i}`] || this._config[`time_${i}`];
      const defaultTime = defaults[`time_${i}`];
      const fallbackTime = `0${7+i}:00-0${7+i}:45`;
      
      const time = useCustomTimes ? (configTime || defaultTime || fallbackTime) : (defaultTime || fallbackTime);
      
      timeSlots.push({ period: `${i}.`, time, lessonNumber: i });
      
      for (let p = 1; p <= pauseCount; p++) {
        const configPauseAfter = timeSettings[`pause_${p}_after`] !== undefined ? timeSettings[`pause_${p}_after`] : this._config[`pause_${p}_after`];
        const defaultPauseAfter = defaults[`pause_${p}_after`];
        const pauseAfter = useCustomTimes ? (configPauseAfter !== undefined ? configPauseAfter : defaultPauseAfter || p*2) : (defaultPauseAfter || p*2);
        
        if (pauseAfter === i) {
          const configPauseTime = timeSettings[`pause_${p}`] || this._config[`pause_${p}`];
          const defaultPauseTime = defaults[`pause_${p}`];
          const pauseTime = useCustomTimes ? (configPauseTime || defaultPauseTime || '00:00-00:00') : (defaultPauseTime || '00:00-00:00');
          
          timeSlots.push({ period: '', time: pauseTime, isPause: true, label: 'Pause' });
        }
      }
    }

    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
    const weekDayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const today = new Date().getDay();
    const todayIndex = highlightToday && today !== 0 && today !== 6 ? today - 1 : -1;

    let html = '<table class="schedule-table"><thead><tr><th>Stunde</th>';
    weekDays.forEach((day, i) => {
      html += `<th class="${i === todayIndex ? 'today-column' : ''}">${day}</th>`;
    });
    html += '</tr></thead><tbody>';

    timeSlots.forEach(slot => {
      if (slot.isPause) {
        html += `<tr class="pause-row"><td>${showTime ? slot.time : slot.label}</td><td colspan="5" style="text-align: center;">${slot.label}</td></tr>`;
      } else {
        const timeDisplay = showTime ? ` ${slot.time}` : '';
        html += `<tr><td>${slot.period}${timeDisplay}</td>`;
        
        weekDays.forEach((day, dayIndex) => {
          const daySchedule = weekTable[weekDayKeys[dayIndex]] || {};
          const lesson = daySchedule[slot.lessonNumber];
          
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

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'vpmobile24-card',
  name: 'VpMobile24 Card',
  description: 'Wochenstundenplan mit modernem UI Editor',
  preview: true,
});

console.log('✅ VpMobile24 Card v2.0.1 loaded');
