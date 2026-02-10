class VpMobile24Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this.config) return;

    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];
    
    console.log('VpMobile24Card Debug:', {
      entityId,
      stateObj: stateObj ? 'exists' : 'missing',
      hasWeekTable: !!this._hass.states['sensor.vpmobile24_week_table'],
      allEntities: Object.keys(this._hass.states).filter(e => e.includes('vpmobile24'))
    });
    
    if (!stateObj) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-content">
            <div class="error">Entity ${entityId} not found</div>
            <div>Available entities: ${Object.keys(this._hass.states).filter(e => e.includes('vpmobile24')).join(', ')}</div>
          </div>
        </ha-card>
      `;
      return;
    }

    // Get calendar entity for week schedule
    const calendarEntity = this._hass.states['calendar.vpmobile24_week_calendar'];
    const todayScheduleEntity = this._hass.states['sensor.vpmobile24_heutiger_stundenplan'] || 
                               this._hass.states['sensor.vpmobile24_today_schedule'];
    const weekTableEntity = this._hass.states['sensor.vpmobile24_week_table'];

    console.log('VpMobile24Card Entities:', {
      calendar: !!calendarEntity,
      todaySchedule: !!todayScheduleEntity,
      weekTable: !!weekTableEntity,
      weekTableData: weekTableEntity?.attributes?.week_table ? 'has data' : 'no data'
    });

    const title = this.config.title || 'Stundenplan - Klasse 5a';
    const className = this.config.class_name || '5a';

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius);
          box-shadow: var(--ha-card-box-shadow);
          overflow: hidden;
        }
        
        .card-header {
          background: var(--primary-color);
          color: white;
          padding: 16px 20px;
          font-size: 1.3em;
          font-weight: 500;
          text-align: left;
        }
        
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--card-background-color);
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
          font-size: 1em;
        }
        
        .schedule-table th:first-child {
          text-align: left;
          padding-left: 16px;
          min-width: 140px;
        }
        
        .schedule-table td:first-child {
          text-align: left;
          padding-left: 16px;
          font-weight: 500;
          color: var(--primary-text-color);
          background: var(--secondary-background-color);
        }
        
        .schedule-table td {
          color: var(--primary-text-color);
          font-weight: 500;
        }
        
        .today-column {
          background: var(--primary-color) !important;
          color: white !important;
        }
        
        .today-column th {
          background: var(--primary-color) !important;
          color: white !important;
        }
        
        .pause-row {
          background: var(--secondary-background-color);
          font-style: italic;
          color: var(--secondary-text-color);
        }
        
        .pause-row td {
          background: var(--secondary-background-color);
          color: var(--secondary-text-color);
          font-style: italic;
        }
        
        .pause-row td:first-child {
          font-weight: normal;
        }
        
        .lesson-cell {
          position: relative;
          min-height: 40px;
        }
        
        .lesson-changed {
          background: var(--warning-color) !important;
          color: var(--text-primary-color) !important;
        }
        
        .lesson-substitution {
          background: var(--error-color) !important;
          color: white !important;
        }
        
        .empty-cell {
          color: var(--secondary-text-color);
          font-style: italic;
        }
        
        .error {
          color: var(--error-color);
          text-align: center;
          padding: 20px;
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
          
          .card-header {
            padding: 12px 16px;
            font-size: 1.1em;
          }
        }
        
        @media (max-width: 480px) {
          .schedule-table th,
          .schedule-table td {
            padding: 6px 2px;
            font-size: 0.8em;
          }
          
          .schedule-table th:first-child,
          .schedule-table td:first-child {
            padding-left: 6px;
            min-width: 80px;
          }
        }
      </style>
      
      <ha-card>
        <div class="card-header">
          Stundenplan - Klasse ${className}
        </div>
        ${this.renderScheduleTable(weekTableEntity, todayScheduleEntity)}
      </ha-card>
    `;
  }

  renderScheduleTable(weekTableEntity, todayEntity) {
    // Debug output
    console.log('renderScheduleTable called with:', {
      weekTableEntity: !!weekTableEntity,
      weekTableState: weekTableEntity?.state,
      weekTableAttributes: weekTableEntity?.attributes ? Object.keys(weekTableEntity.attributes) : 'none',
      todayEntity: !!todayEntity
    });

    // If week table entity doesn't exist or has no data, show error message
    if (!weekTableEntity) {
      return `
        <div style="padding: 20px; text-align: center; color: var(--error-color);">
          <h3>Week Table Sensor nicht gefunden</h3>
          <p>Der Sensor 'sensor.vpmobile24_week_table' existiert nicht.</p>
          <p>Bitte starte Home Assistant neu oder lade die Integration neu.</p>
        </div>
      `;
    }

    const weekTable = weekTableEntity?.attributes?.week_table;
    if (!weekTable) {
      return `
        <div style="padding: 20px; text-align: center; color: var(--warning-color);">
          <h3>Keine Wochendaten</h3>
          <p>Der Week Table Sensor hat keine Daten.</p>
          <p>State: ${weekTableEntity.state}</p>
          <p>Attributes: ${Object.keys(weekTableEntity.attributes || {}).join(', ')}</p>
        </div>
      `;
    }
    // Standard German school schedule
    const timeSlots = [
      { period: '1.', time: '07:45-08:30' },
      { period: '2.', time: '08:35-09:20' },
      { period: '', time: '09:20-09:40', isPause: true, label: 'gr. Pause' },
      { period: '3.', time: '09:40-10:25' },
      { period: '4.', time: '10:30-11:15' },
      { period: '', time: '11:15-11:40', isPause: true, label: 'gr. Pause' },
      { period: '5.', time: '11:40-12:25' },
      { period: '6.', time: '12:30-13:15' }
    ];

    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
    const weekDayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.
    const todayIndex = today === 0 ? -1 : today - 1; // Convert to 0=Monday

    // Get week table data from the week table sensor
    const weekTable = weekTableEntity?.attributes?.week_table || {};

    // Generate table header
    const headerRow = `
      <tr>
        <th>Stunde</th>
        ${weekDays.map((day, index) => 
          `<th class="${index === todayIndex ? 'today-column' : ''}">${day}</th>`
        ).join('')}
      </tr>
    `;

    // Generate table rows
    const tableRows = timeSlots.map(slot => {
      if (slot.isPause) {
        return `
          <tr class="pause-row">
            <td>${slot.time}</td>
            <td colspan="5" style="text-align: center;">${slot.label}</td>
          </tr>
        `;
      }

      const periodNum = slot.period.replace('.', '');
      
      return `
        <tr>
          <td>${slot.period} ${slot.time}</td>
          ${weekDays.map((day, dayIndex) => {
            let cellContent = '';
            let cellClass = 'lesson-cell';
            
            // Get lesson for this day and period from week table
            const dayKey = weekDayKeys[dayIndex];
            const daySchedule = weekTable[dayKey] || {};
            const lesson = daySchedule[periodNum];
            
            if (lesson && lesson.fach) {
              cellContent = lesson.fach;
              if (lesson.ist_vertretung) {
                cellClass += ' lesson-substitution';
              }
            } else {
              cellContent = '';
              cellClass += ' empty-cell';
            }
            
            return `<td class="${cellClass} ${dayIndex === todayIndex ? 'today-column' : ''}">${cellContent}</td>`;
          }).join('')}
        </tr>
      `;
    }).join('');

    return `
      <table class="schedule-table">
        <thead>
          ${headerRow}
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }

  getCardSize() {
    return 6;
  }
}

customElements.define('vpmobile24-card', VpMobile24Card);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'vpmobile24-card',
  name: 'VpMobile24 Stundenplan Card',
  description: 'Eine Wochenstundenplan-Tabelle für VpMobile24 Integration',
  preview: true,
});

console.info(
  `%c VpMobile24-CARD %c v2.1.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);