// VpMobile24 Card v2.3.0 - Smart filtering and popup improvements
console.info('%c VpMobile24-CARD %c v2.3.0 ', 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

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
          name: "additional_info_entity", 
          required: false,
          selector: { 
            entity: { 
              filter: [{ integration: "vpmobile24" }]
            } 
          } 
        },
        { 
          name: "reload_entity", 
          required: false,
          selector: { 
            entity: { 
              domain: "button"
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
              default: 8,
              selector: { number: { min: 1, max: 10, step: 1, mode: "box" } }
            },
            {
              name: "pause_count",
              default: 2,
              selector: { number: { min: 0, max: 5, step: 1, mode: "box" } }
            },
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
            {
              type: "grid",
              name: "pause_1_config",
              schema: [
                { name: "pause_1", default: "10:10-10:30", selector: { text: { type: "text" } } },
                { name: "pause_1_after", default: 3, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
              ]
            },
            {
              type: "grid",
              name: "pause_2_config",
              schema: [
                { name: "pause_2", default: "12:15-12:45", selector: { text: { type: "text" } } },
                { name: "pause_2_after", default: 5, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
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
          additional_info_entity: "Zusatzinfo Sensor",
          reload_entity: "Neu laden Button",
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
          additional_info_entity: "Wähle den Zusatzinfo-Sensor (z.B. sensor.vpmobile24_zusatzinfos) um Ausrufezeichen bei Tagen mit Infos anzuzeigen",
          reload_entity: "Wähle einen Button-Entity zum manuellen Neuladen der Daten (z.B. button.vpmobile24_reload)",
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
      lesson_count: 8,
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

  _handleReload() {
    if (!this._config.reload_entity) return;
    
    // Call the button entity to trigger reload
    this._hass.callService('button', 'press', {
      entity_id: this._config.reload_entity
    });
  }

  _showInfoPopup() {
    if (!this._config.additional_info_entity) return;
    
    const additionalInfoEntity = this._hass.states[this._config.additional_info_entity];
    if (!additionalInfoEntity || !additionalInfoEntity.attributes) return;

    const allgemeineInfos = additionalInfoEntity.attributes.allgemeine_infos || [];
    const stundenInfos = additionalInfoEntity.attributes.stunden_infos || [];
    
    let content = '';
    
    if (allgemeineInfos.length > 0) {
      content += '<div style="margin-bottom: 16px;"><strong>Allgemeine Informationen:</strong></div>';
      allgemeineInfos.forEach(info => {
        content += `<div class="info-item">${info}</div>`;
      });
    }
    
    if (stundenInfos.length > 0) {
      if (allgemeineInfos.length > 0) {
        content += '<div style="margin-top: 20px; margin-bottom: 16px;"><strong>Stunden-Informationen:</strong></div>';
      } else {
        content += '<div style="margin-bottom: 16px;"><strong>Stunden-Informationen:</strong></div>';
      }
      stundenInfos.forEach(info => {
        content += `<div class="info-item">${info}</div>`;
      });
    }
    
    if (content === '') {
      content = '<div class="info-item">Keine Zusatzinformationen verfügbar</div>';
    }
    
    const popup = this.shadowRoot.getElementById('info-popup');
    const overlay = this.shadowRoot.getElementById('info-popup-overlay');
    const popupContent = this.shadowRoot.getElementById('info-popup-content');
    
    if (popup && overlay && popupContent) {
      popupContent.innerHTML = content;
      popup.classList.remove('hidden');
      overlay.classList.remove('hidden');
    }
  }

  _closePopup() {
    const popup = this.shadowRoot.getElementById('info-popup');
    const overlay = this.shadowRoot.getElementById('info-popup-overlay');
    
    if (popup && overlay) {
      popup.classList.add('hidden');
      overlay.classList.add('hidden');
    }
  }

  _handlePopupClick(event) {
    // Verhindere dass Klicks auf das Popup zum Overlay durchgehen
    event.stopPropagation();
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
          position: relative;
        }
        .reload-button {
          position: absolute;
          top: 16px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 6px 12px;
          color: white;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        }
        .reload-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .reload-button:active {
          transform: scale(0.95);
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
          position: relative;
        }
        .info-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 18px;
          height: 18px;
          background: var(--warning-color, #ff9800);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7em;
          color: white;
          font-weight: bold;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .reload-button {
          position: absolute;
          top: 16px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 6px 12px;
          color: white;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        }
        .reload-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .reload-button:active {
          transform: scale(0.95);
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
          background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05) !important;
          position: relative;
        }
        
        .today-column::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 2px;
          height: 100%;
          background: var(--primary-color);
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
        
        /* Mobile View - Card Layout */
        .mobile-view {
          display: none;
        }
        
        .desktop-view {
          display: block;
        }
        
        @media (max-width: 1024px) {
          .desktop-view {
            display: none;
          }
          .mobile-view {
            display: block;
            padding: 12px;
          }
        }
        
        .day-card {
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
        }
        
        .day-card.today {
          border: 2px solid var(--primary-color);
          box-shadow: 0 2px 8px rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        }
        
        .day-card-header {
          background: var(--primary-color);
          color: white;
          padding: 12px 16px;
          font-weight: 500;
          font-size: 1.1em;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        
        .day-card.today .day-card-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--rgb-primary-color, 3, 169, 244), 0.8) 100%);
        }
        
        .day-card-header-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .day-card-info-badge {
          width: 24px;
          height: 24px;
          background: var(--warning-color, #ff9800);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8em;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        
        .day-card-body {
          padding: 0;
        }
        
        .lesson-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--divider-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .lesson-item:last-child {
          border-bottom: none;
        }
        
        .lesson-item.substitution {
          background: rgba(255, 82, 82, 0.1);
          border-left: 4px solid #ff5252;
        }
        
        .lesson-item.pause {
          background: var(--secondary-background-color);
          font-style: italic;
          color: var(--secondary-text-color);
        }
        
        .lesson-item.empty {
          color: var(--disabled-text-color);
        }
        
        .lesson-time {
          font-size: 0.85em;
          color: var(--secondary-text-color);
          min-width: 90px;
        }
        
        .lesson-subject {
          flex: 1;
          font-size: 1em;
          font-weight: 500;
          text-align: right;
        }
        
        .lesson-item.substitution .lesson-subject {
          color: #ff5252;
          font-weight: 600;
        }
        
        .day-header-clickable {
          cursor: pointer;
          transition: background 0.2s;
        }
        .day-header-clickable:hover {
          background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1) !important;
        }
        .info-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--card-background-color);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 1000;
          border: 1px solid var(--divider-color);
        }
        
        @media (max-width: 480px) {
          .info-popup {
            padding: 14px;
            width: 95%;
            max-height: 85vh;
            border-radius: 6px;
          }
          .info-popup-header {
            font-size: 1.1em;
            margin-bottom: 12px;
            padding-bottom: 8px;
          }
          .info-item {
            padding: 10px;
            margin-bottom: 6px;
            font-size: 0.9em;
          }
          .info-popup-button {
            padding: 8px 18px;
            font-size: 0.95em;
          }
          .info-popup-footer {
            margin-top: 14px;
          }
        }
        
        .info-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }
        .info-popup-header {
          font-size: 1.3em;
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--primary-text-color);
          border-bottom: 2px solid var(--primary-color);
          padding-bottom: 8px;
        }
        .info-popup-content {
          color: var(--primary-text-color);
          line-height: 1.6;
        }
        .info-item {
          padding: 12px;
          margin-bottom: 8px;
          background: var(--secondary-background-color);
          border-radius: 4px;
          border-left: 3px solid var(--warning-color);
        }
        .info-popup-footer {
          margin-top: 20px;
          text-align: right;
        }
        .info-popup-button {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 24px;
          cursor: pointer;
          font-size: 1em;
          transition: all 0.2s;
        }
        .info-popup-button:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }
        .info-popup-button:active {
          transform: scale(0.95);
        }
        .hidden {
          display: none;
        }
      </style>
      <ha-card>
        ${showHeader ? `<div class="card-header">
          ${title} - Klasse ${className}
          ${this._config.reload_entity ? `<button class="reload-button" onclick="this.getRootNode().host._handleReload()">🔄 Neu laden</button>` : ''}
        </div>` : ''}
        <div class="desktop-view">${this._renderTable(weekTable, showTime, highlightToday, useCustomTimes)}</div>
        <div class="mobile-view">${this._renderMobileView(weekTable, showTime, useCustomTimes)}</div>
      </ha-card>
      <div id="info-popup-overlay" class="info-popup-overlay hidden"></div>
      <div id="info-popup" class="info-popup hidden" onclick="this.getRootNode().host._handlePopupClick(event)">
        <div class="info-popup-header">Zusatzinformationen</div>
        <div id="info-popup-content" class="info-popup-content"></div>
        <div class="info-popup-footer">
          <button class="info-popup-button" onclick="this.getRootNode().host._closePopup()">OK</button>
        </div>
      </div>
    `;
  }

  _renderTable(weekTable, showTime, highlightToday, useCustomTimes) {
    const defaults = {
      time_1: '07:45-08:30', 
      time_2: '08:40-09:25',
      time_3: '09:25-10:10',
      time_4: '10:35-11:20',
      time_5: '11:30-12:15',
      time_6: '12:45-13:30',
      time_7: '13:40-14:25',
      time_8: '14:35-15:20',
      time_9: '15:00-15:45', 
      time_10: '15:50-16:35',
      pause_1: '10:10-10:30', 
      pause_1_after: 3,
      pause_2: '12:15-12:45', 
      pause_2_after: 5,
    };

    // Get additional info sensor from config
    let additionalInfoEntity = null;
    if (this._config.additional_info_entity) {
      additionalInfoEntity = this._hass.states[this._config.additional_info_entity];
    }
    const hasInfoPerDay = this._getInfoPerDay(additionalInfoEntity, weekTable);

    // Read from nested time_settings object if it exists, otherwise use top-level values
    const timeSettings = this._config.time_settings || {};
    const lessonCount = useCustomTimes ? (timeSettings.lesson_count || this._config.lesson_count || 8) : 8;
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
      const hasInfo = hasInfoPerDay[weekDayKeys[i]] || false;
      const infoIcon = hasInfo ? '<span class="info-indicator">!</span>' : '';
      const clickable = hasInfo ? 'day-header-clickable' : '';
      const onclick = hasInfo ? `onclick="this.getRootNode().host._showInfoPopup()"` : '';
      html += `<th class="${i === todayIndex ? 'today-column' : ''} ${clickable}" ${onclick}>${day}${infoIcon}</th>`;
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

  _getInfoPerDay(additionalInfoEntity, weekTable) {
    // Returns object with weekday keys (monday, tuesday, etc.) and boolean values
    const infoPerDay = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false
    };

    if (!additionalInfoEntity || !additionalInfoEntity.attributes) {
      return infoPerDay;
    }

    // Get today's date
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const todayWeekday = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Map weekday number to key
    const weekdayMap = {
      1: 'monday',
      2: 'tuesday', 
      3: 'wednesday',
      4: 'thursday',
      5: 'friday'
    };
    
    const todayKey = weekdayMap[todayWeekday];
    
    // Only check for today
    if (!todayKey) {
      return infoPerDay; // Weekend, no info
    }

    // Check if there are any infos today
    const allgemeineInfos = additionalInfoEntity.attributes.allgemeine_infos || [];
    const stundenInfos = additionalInfoEntity.attributes.stunden_infos || [];
    
    // If there are general infos or lesson infos, mark today
    if (allgemeineInfos.length > 0 || stundenInfos.length > 0) {
      infoPerDay[todayKey] = true;
    }

    // Also check weekTable for today's lessons with zusatzinfo
    if (weekTable[todayKey]) {
      const daySchedule = weekTable[todayKey] || {};
      Object.values(daySchedule).forEach(lesson => {
        if (lesson && lesson.zusatzinfo) {
          infoPerDay[todayKey] = true;
        }
      });
    }

    return infoPerDay;
  }

  _renderMobileView(weekTable, showTime, useCustomTimes) {
    const defaults = {
      time_1: '07:45-08:30', 
      time_2: '08:40-09:25',
      time_3: '09:25-10:10',
      time_4: '10:35-11:20',
      time_5: '11:30-12:15',
      time_6: '12:45-13:30',
      time_7: '13:40-14:25',
      time_8: '14:35-15:20',
      time_9: '15:00-15:45', 
      time_10: '15:50-16:35',
      pause_1: '10:10-10:30', 
      pause_1_after: 3,
      pause_2: '12:15-12:45', 
      pause_2_after: 5,
    };

    // Get additional info sensor from config
    let additionalInfoEntity = null;
    if (this._config.additional_info_entity) {
      additionalInfoEntity = this._hass.states[this._config.additional_info_entity];
    }
    const hasInfoPerDay = this._getInfoPerDay(additionalInfoEntity, weekTable);

    const timeSettings = this._config.time_settings || {};
    const lessonCount = useCustomTimes ? (timeSettings.lesson_count || this._config.lesson_count || 8) : 8;
    const pauseCount = useCustomTimes ? (timeSettings.pause_count || this._config.pause_count || 2) : 2;

    const timeSlots = [];
    for (let i = 1; i <= lessonCount; i++) {
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

    const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    const weekDayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const today = new Date().getDay();
    const todayIndex = today !== 0 && today !== 6 ? today - 1 : -1;

    let html = '';
    
    weekDays.forEach((dayName, dayIndex) => {
      const dayKey = weekDayKeys[dayIndex];
      const daySchedule = weekTable[dayKey] || {};
      const isToday = dayIndex === todayIndex;
      const hasInfo = hasInfoPerDay[dayKey] || false;
      
      const todayClass = isToday ? 'today' : '';
      const infoBadge = hasInfo ? `<span class="day-card-info-badge" onclick="this.getRootNode().host._showInfoPopup()">!</span>` : '';
      
      html += `<div class="day-card ${todayClass}">`;
      html += `<div class="day-card-header">
        <div class="day-card-header-info">
          <span>${dayName}</span>
        </div>
        ${infoBadge}
      </div>`;
      html += `<div class="day-card-body">`;
      
      timeSlots.forEach(slot => {
        if (slot.isPause) {
          html += `<div class="lesson-item pause">
            <span class="lesson-time">${showTime ? slot.time : ''}</span>
            <span class="lesson-subject">${slot.label}</span>
          </div>`;
        } else {
          const lesson = daySchedule[slot.lessonNumber];
          let itemClass = '';
          let subject = '';
          
          if (lesson && lesson.fach) {
            subject = lesson.fach;
            if (lesson.ist_vertretung) {
              itemClass = 'substitution';
            }
          } else {
            itemClass = 'empty';
            subject = '—';
          }
          
          html += `<div class="lesson-item ${itemClass}">
            <span class="lesson-time">${slot.period} ${showTime ? slot.time : ''}</span>
            <span class="lesson-subject">${subject}</span>
          </div>`;
        }
      });
      
      html += `</div></div>`;
    });

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

console.log('✅ VpMobile24 Card v2.3.0 loaded');
