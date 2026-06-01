// VpMobile24 Card v2.4.9b
console.info('%c VpMobile24-CARD %c v2.4.9b ', 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

class VpMobile24Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._t = null; // language strings — set in _render(), used everywhere
    this._weekOffset = 0; // 0 = current week, 1 = next week
  }

  // ── Language helper ──────────────────────────────────────────────────────
  _buildTranslations() {
    const haLang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
    const lang = ['de','en','fr'].includes(haLang) ? haLang : 'de';
    const _i = {
      de:{ today:'Heute', sub:'Vertretung', now:'Jetzt', pause:'Pause',
           cancel:'AUSFALL', close:'Schließen', period:'Stunde',
           teacher:'Lehrer', room:'Raum', info:'Info',
           cancelled:'Ausfall', substitution:'Vertretung',
           noDetail:'Keine weiteren Details verfügbar.',
           noInfo:(d)=>'Keine Zusatzinformationen für '+d+' verfügbar.',
           genInfo:'📢 Allgemeine Informationen',
           infoTitle:'ℹ️ Zusatzinformationen',
           refresh:'↺ Aktualisieren',
           nextWeek:'Nächste Woche \u2192',
           currentWeek:'\u2190 Aktuelle Woche',
           classLabel:'Klasse',
           noData:'Keine Wochendaten verfügbar',
           entityNotFound:'Entity nicht gefunden',
           days:['Mo','Di','Mi','Do','Fr'],
           daysFull:['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'],
           wdFull:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'] },
      en:{ today:'Today', sub:'Substitution', now:'Now', pause:'Break',
           cancel:'CANCELLED', close:'Close', period:'Period',
           teacher:'Teacher', room:'Room', info:'Info',
           cancelled:'Cancelled', substitution:'Substitution',
           noDetail:'No further details available.',
           noInfo:(d)=>'No additional info for '+d+' available.',
           genInfo:'📢 General Information',
           infoTitle:'ℹ️ Additional Information',
           refresh:'↺ Refresh',
           nextWeek:'Next Week \u2192',
           currentWeek:'\u2190 Current Week',
           classLabel:'Class',
           noData:'No weekly data available',
           entityNotFound:'Entity not found',
           days:['Mo','Tu','We','Th','Fr'],
           daysFull:['Monday','Tuesday','Wednesday','Thursday','Friday'],
           wdFull:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
      fr:{ today:'Aujourd\u0027hui', sub:'Remplacement', now:'Maintenant', pause:'Pause',
           cancel:'ANNUL\u00c9', close:'Fermer', period:'Heure',
           teacher:'Prof', room:'Salle', info:'Info',
           cancelled:'Annul\u00e9', substitution:'Remplacement',
           noDetail:'Aucun d\u00e9tail disponible.',
           noInfo:(d)=>'Aucune info pour '+d+'.',
           genInfo:'📢 Informations g\u00e9n\u00e9rales',
           infoTitle:'ℹ️ Informations suppl\u00e9mentaires',
           refresh:'↺ Actualiser',
           nextWeek:'Semaine suivante \u2192',
           currentWeek:'\u2190 Semaine actuelle',
           classLabel:'Classe',
           noData:'Aucune donn\u00e9e hebdomadaire disponible',
           entityNotFound:'Entit\u00e9 introuvable',
           days:['Lu','Ma','Me','Je','Ve'],
           daysFull:['Lundi','Mardi','Mercredi','Jeudi','Vendredi'],
           wdFull:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'] }
    };
    this._t = _i[lang] || _i.de;
    return this._t;
  }

  static getConfigForm() {
    // Determine language from hass if available (accessed via DOM for static context)
    const _hl = (hass) => {
      try {
        if (hass && hass.language) return hass.language.substring(0,2).toLowerCase();
        const lang = document.querySelector('home-assistant')?._hass?.language
          || document.querySelector('home-assistant')?.hass?.language
          || navigator.language || 'de';
        return lang.substring(0,2).toLowerCase();
      } catch(e) { return 'de'; }
    };

    // Build translations inline so computeLabel/computeHelper always have correct language
    const _cfgLabels = (hass) => {
      const hl = _hl(hass);
      const L = {
        de:{entity:"Week Table Sensor",additional_info_entity:"Zusatzinfo Sensor",reload_entity:"Neu laden Button",title:"Titel",class_name:"Klassenname (leer = automatisch)",show_time:"Uhrzeiten anzeigen",show_header:"Header anzeigen",highlight_today:"Heutigen Tag hervorheben",theme:"Theme",display_settings:"Anzeige-Einstellungen",use_custom_times:"Eigene Uhrzeiten verwenden",header_settings:"Header-Einstellungen",time_settings:"Uhrzeiten-Anpassung",lesson_count:"Anzahl der Stunden",pause_count:"Anzahl der Pausen",time_1:"1. Stunde",time_2:"2. Stunde",time_3:"3. Stunde",time_4:"4. Stunde",time_5:"5. Stunde",time_6:"6. Stunde",time_7:"7. Stunde",time_8:"8. Stunde",time_9:"9. Stunde",time_10:"10. Stunde",pause_1:"1. Pause - Zeit",pause_1_after:"1. Pause - Nach Stunde",pause_2:"2. Pause - Zeit",pause_2_after:"2. Pause - Nach Stunde",pause_3:"3. Pause - Zeit",pause_3_after:"3. Pause - Nach Stunde",pause_4:"4. Pause - Zeit",pause_4_after:"4. Pause - Nach Stunde",pause_5:"5. Pause - Zeit",pause_5_after:"5. Pause - Nach Stunde"},
        en:{entity:"Week Table Sensor",additional_info_entity:"Additional Info Sensor",reload_entity:"Reload Button",title:"Title",class_name:"Class Name (empty = auto)",show_time:"Show Times",show_header:"Show Header",highlight_today:"Highlight Today",theme:"Theme",display_settings:"Display Settings",use_custom_times:"Use Custom Times",header_settings:"Header Settings",time_settings:"Time Settings",lesson_count:"Number of Periods",pause_count:"Number of Breaks",time_1:"Period 1",time_2:"Period 2",time_3:"Period 3",time_4:"Period 4",time_5:"Period 5",time_6:"Period 6",time_7:"Period 7",time_8:"Period 8",time_9:"Period 9",time_10:"Period 10",pause_1:"Break 1 - Time",pause_1_after:"Break 1 - After Period",pause_2:"Break 2 - Time",pause_2_after:"Break 2 - After Period",pause_3:"Break 3 - Time",pause_3_after:"Break 3 - After Period",pause_4:"Break 4 - Time",pause_4_after:"Break 4 - After Period",pause_5:"Break 5 - Time",pause_5_after:"Break 5 - After Period"},
        fr:{entity:"Capteur Semaine",additional_info_entity:"Capteur Infos Supp.",reload_entity:"Bouton Actualiser",title:"Titre",class_name:"Nom de Classe",show_time:"Afficher Horaires",show_header:"Afficher En-t\u00eate",highlight_today:"Mettre en avant Aujourd'hui",use_custom_times:"Horaires Personnalis\u00e9s",header_settings:"Param\u00e8tres En-t\u00eate",time_settings:"Personnalisation des Horaires",lesson_count:"Nombre d'Heures",pause_count:"Nombre de Pauses",time_1:"1\u00e8re Heure",time_2:"2\u00e8me Heure",time_3:"3\u00e8me Heure",time_4:"4\u00e8me Heure",time_5:"5\u00e8me Heure",time_6:"6\u00e8me Heure",time_7:"7\u00e8me Heure",time_8:"8\u00e8me Heure",time_9:"9\u00e8me Heure",time_10:"10\u00e8me Heure",pause_1:"Pause 1 - Heure",pause_1_after:"Pause 1 - Apr\u00e8s Heure",pause_2:"Pause 2 - Heure",pause_2_after:"Pause 2 - Apr\u00e8s Heure",pause_3:"Pause 3 - Heure",pause_3_after:"Pause 3 - Apr\u00e8s Heure",pause_4:"Pause 4 - Heure",pause_4_after:"Pause 4 - Apr\u00e8s Heure",pause_5:"Pause 5 - Heure",pause_5_after:"Pause 5 - Apr\u00e8s Heure"}
      };
      return (L[hl]||L.de);
    };
    const _cfgHelpers = (hass) => {
      const hl = _hl(hass);
      const H = {
        de:{entity:"Wähle den sensor.vpmobile24_week_table Sensor",additional_info_entity:"Zusatzinfo-Sensor für ⓘ-Button",reload_entity:"Button-Entity zum Neuladen (z.B. button.vpmobile24_reload)",title:"Titel der Card",class_name:"Klassenname (z.B. 5a, 10b)",show_time:"Zeigt Uhrzeiten unter der Stundennummer",show_header:"Zeigt den Header mit Titel und Klassenname",highlight_today:"Hebt die heutige Spalte blau hervor",use_custom_times:"Aktiviere um eigene Uhrzeiten einzutragen"},
        en:{entity:"Select the sensor.vpmobile24_week_table sensor",additional_info_entity:"Info sensor for ⓘ button",reload_entity:"Button entity for manual reload (e.g. button.vpmobile24_reload)",title:"Card title",class_name:"Class name (e.g. 5a, 10b)",show_time:"Show times below period number",show_header:"Show header with title and class name",highlight_today:"Highlight today column in blue",use_custom_times:"Enable to enter custom times"},
        fr:{entity:"S\u00e9lectionner le capteur sensor.vpmobile24_week_table",additional_info_entity:"Capteur infos pour bouton info",reload_entity:"Entit\u00e9 bouton pour actualisation (ex. button.vpmobile24_reload)",title:"Titre de la carte",class_name:"Nom de classe (ex. 5a, 10b)",show_time:"Afficher les horaires sous le num\u00e9ro",show_header:"Afficher en-t\u00eate avec titre et classe",highlight_today:"Mettre en avant la colonne du jour",use_custom_times:"Activer pour saisir des horaires personnalis\u00e9s"}
      };
      return (H[hl]||H.de);
    };

    const _sectionTitles = {
      de: { header_settings: 'Header-Einstellungen', display_settings: 'Anzeige', time_settings: 'Uhrzeiten-Anpassung' },
      en: { header_settings: 'Header Settings', display_settings: 'Display', time_settings: 'Time Settings' },
      fr: { header_settings: 'Param\u00e8tres En-t\u00eate', display_settings: 'Affichage', time_settings: 'Personnalisation des Horaires' }
    };
    const hl0 = _hl(null);
    const st = _sectionTitles[['de','en','fr'].includes(hl0) ? hl0 : 'de'];

    // Theme field uses native HA theme selector — shows all installed HA themes automatically
    const themeSchema = { name: 'theme', default: 'navy', selector: { theme: {} } };

    return {
      schema: [
        // ── Sensoren ──────────────────────────────────────────────────────
        { name: "entity", required: true, selector: { entity: { filter: [{ integration: "vpmobile24" }] } } },
        { name: "additional_info_entity", required: false, selector: { entity: { filter: [{ integration: "vpmobile24" }] } } },
        { name: "reload_entity", required: false, selector: { entity: { domain: "button" } } },

        // ── Header ────────────────────────────────────────────────────────
        { name: "show_header", default: true, selector: { boolean: {} } },
        { type: "expandable", name: "header_settings", title: st.header_settings, collapsed: false,
          schema: [
            { name: "title", default: "Stundenplan", selector: { text: { type: "text" } } },
            { name: "class_name", default: "", selector: { text: { type: "text" } } }
          ]
        },

        // ── Anzeige ───────────────────────────────────────────────────────
        { type: "expandable", name: "display_settings", title: st.display_settings, collapsed: false,
          schema: [
            { name: "highlight_today", default: true, selector: { boolean: {} } },
            { name: "show_time", default: true, selector: { boolean: {} } },
            themeSchema,          ]
        },

        // ── Uhrzeiten ─────────────────────────────────────────────────────
        { name: "use_custom_times", default: false, selector: { boolean: {} } },
        { type: "expandable", name: "time_settings", title: st.time_settings, collapsed: true,
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
      computeLabel: (s, hass) => _cfgLabels(hass)[s.name] || s.name,
      computeHelper: (s, hass) => _cfgHelpers(hass)[s.name],
      computeVisible: () => true,
    };
  }

  static getStubConfig() {
    return { entity:'sensor.vpmobile24_week_table', show_header:true, show_time:true,
      highlight_today:true, use_custom_times:false, theme:'navy',
      header_settings:{ title:'Stundenplan', class_name:'5a' } };
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error('Entity ist erforderlich');
    this._config = JSON.parse(JSON.stringify(config));
    this._popupOpen = false;
    this._popupData = null;
    this._infoPopupOpen = false;
    this._mobDayIdx = null; // reset to today on config change
    this._weekOffset = 0;   // reset to current week on config change
    if (this._hass) this._render();
  }

  _switchWeek(offset) {
    this._weekOffset = offset;
    if (offset === 0) {
      // Returning to current week: jump to today's tab
      const todayDow = new Date().getDay();
      this._mobDayIdx = (todayDow >= 1 && todayDow <= 5) ? todayDow - 1 : 0;
    } else {
      this._mobDayIdx = 0; // next week: start at Monday
    }
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      // Auto-switch to next week on weekends (Saturday=6, Sunday=0)
      const dow = new Date().getDay();
      const isWeekend = dow === 0 || dow === 6;
      if (isWeekend && (this._weekOffset === 0 || this._weekOffset === undefined)) {
        this._weekOffset = 1;
        this._mobDayIdx = 0;
      }
      const anyPopupOpen = this._popupOpen || this._infoPopupOpen;
      if (anyPopupOpen) {
        // When viewing next week, always do a full re-render to avoid
        // showing current week data behind the popup
        if ((this._weekOffset || 0) !== 0) {
          this._render();
        } else {
          this._updateTableOnly();
          if (this._infoPopupOpen) {
            this._renderInfoPopupContent();
          }
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
    // Don't show info popup when viewing next week — infos are for current week only
    if ((this._weekOffset || 0) !== 0) return;
    this._infoPopupOpen = true;
    this._renderInfoPopupContent();
  }

  _renderInfoPopupContent() {
    const popup   = this.shadowRoot.getElementById('info-popup');
    const overlay = this.shadowRoot.getElementById('info-popup-overlay');
    const content = this.shadowRoot.getElementById('info-popup-content');
    if (!popup || !overlay || !content) return;

    const t = this._t || this._buildTranslations();
    const wdKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const wdDE = t.wdFull;
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
        + '<div class="vp-info-section-label">' + t.genInfo + '</div>'
        + allg.map(a => '<div class="vp-info-entry"><span>' + a + '</span></div>').join('')
        + '</div>';
    }

    if (!html) {
      html = '<div class="vp-info-none">' + t.noInfo(todayName) + '</div>';
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

    const t = this._t || this._buildTranslations();
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
      badge = '<span class="vp-detail-badge vp-detail-cancelled">' + t.cancelled + '</span>';
    } else if (isVertretung) {
      badge = '<span class="vp-detail-badge vp-detail-sub">' + t.substitution + '</span>';
    }
    title.innerHTML =
      '<span class="vp-detail-num">' + slotPeriod + '. ' + t.period + '</span>' +
      (isActuallyCancelled ? '<span class="vp-detail-fach" style="color:#94a3b8">—</span>' : '<span class="vp-detail-fach">' + fach + '</span>') +
      badge;

    // Rows
    let rows = '';
    // Show period + time as first row (no Tag row)
    rows += '<div class="vp-detail-row">'
      + '<span class="vp-detail-icon">🕐</span>'
      + '<span class="vp-detail-label">' + slotPeriod + '. ' + t.period + '</span>'
      + '<span class="vp-detail-val">' + (zeit || slotTime || '—') + '</span></div>';

    if (lehrer) rows += '<div class="vp-detail-row">'
      + '<span class="vp-detail-icon">👤</span>'
      + '<span class="vp-detail-label">' + t.teacher + '</span>'
      + '<span class="vp-detail-val">' + lehrer + '</span></div>';

    if (raum) rows += '<div class="vp-detail-row">'
      + '<span class="vp-detail-icon">🚪</span>'
      + '<span class="vp-detail-label">' + t.room + '</span>'
      + '<span class="vp-detail-val">' + raum + '</span></div>';

    if (info) rows += '<div class="vp-detail-row vp-detail-info-row">'
      + '<span class="vp-detail-icon">ℹ️</span>'
      + '<span class="vp-detail-label">' + t.info + '</span>'
      + '<span class="vp-detail-val">' + info + '</span></div>';

    if (isActuallyCancelled) {
      // Ausfall: show big red message, no rows
      // Build ausfall popup: no title bar, no lines, just red glow + AUSFALL
      title.innerHTML = '';
      title.style.display = 'none';
      content.innerHTML = '<div class="vp-ausfall-block">' + t.cancel + '</div>';
      popup.classList.add('vp-popup-ausfall');
      popup.classList.remove('hidden');
      overlay.classList.remove('hidden');
      return;
    }
    if (!lehrer && !raum && !info) {
      rows += '<div class="vp-detail-empty">' + t.noDetail + '</div>';
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
    const weekOffset = this._weekOffset || 0;
    const weekTable = weekOffset === 1
      ? (entity.attributes && entity.attributes.next_week_table)
      : (entity.attributes && entity.attributes.week_table);
    if (!weekTable) { this._render(); return; }

    const t = this._t || this._buildTranslations();
    const showTime       = this._config.show_time !== false;
    const highlightToday = this._config.highlight_today !== false;
    const useCustomTimes = this._config.use_custom_times === true;
    const days = t.days;
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const dayFullNames = t.daysFull;
    const todayDow = new Date().getDay();
    const todayIdx = highlightToday && todayDow >= 1 && todayDow <= 5 ? todayDow - 1 : -1;
    const slots = this._buildTimeSlots(useCustomTimes);

    const tbody = this.shadowRoot.querySelector('.vp-table tbody');
    if (!tbody) { this._render(); return; }

    let bodyHtml = '';
    slots.forEach(slot => {
      if (slot.isPause) {
        bodyHtml += '<tr class="vp-pause-tr"><td colspan="6"><div class="vp-pause-cell">' + t.pause + ' ' + slot.time + '</div></td></tr>';
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
            if (isVertretung) cls += ' vp-sub';
            else if (isToday) cls += ' vp-today-tile';
            cls += ' vp-tile-clickable';
          } else if (isCancelled) {
            text = '—';
            cls += ' vp-cancelled vp-tile-clickable';
          } else {
            cls += isToday ? ' vp-today-tile vp-empty' : ' vp-empty';
          }
          const onclickAttr = (lesson && (lesson.fach || isCancelled))
            ? 'onclick="this.getRootNode().host._showLessonDetail(' + JSON.stringify(lesson).replace(/"/g,'&quot;') + ',\'' + dayFullNames[di] + '\',' + slot.period + ',\'' + slot.time + '\',' + isCancelled + ')"'
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
    const t = this._t || this._buildTranslations();
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const dayFullNames = t.daysFull;
    const showTime = this._config.show_time !== false;
    const useCustomTimes = this._config.use_custom_times === true;
    const highlightToday = this._config.highlight_today !== false;
    const entity = this._hass && this._hass.states[this._config.entity];
    const weekOffset = this._weekOffset || 0;
    const weekTable = weekOffset === 1
      ? (entity && entity.attributes && entity.attributes.next_week_table)
      : (entity && entity.attributes && entity.attributes.week_table);
    if (!weekTable) return;

    const slots = this._buildTimeSlots(useCustomTimes);
    const sched = weekTable[dayKeys[idx]] || {};
    const dName = dayFullNames[idx];

    // Calculate current lesson number (only relevant when viewing today)
    const now = new Date();
    const todayDow = now.getDay();
    const todayIdx = highlightToday && todayDow >= 1 && todayDow <= 5 ? todayDow - 1 : -1;
    const isViewingToday = idx === todayIdx;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    let currentLessonNum = -1;
    if (isViewingToday) {
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

    let rows = '';
    slots.forEach(slot => {
      if (slot.isPause) {
        rows += '<div class="vp-mob-pause-row"><span>' + t.pause + ' ' + slot.time + '</span></div>';
      } else {
        const lesson = sched[slot.lessonNumber];
        let rowCls = 'vp-mob-lesson';
        let subj = '';
        let isSub = false;
        // Detect cancellation
        const rawFach = lesson ? lesson.fach : undefined;
        const isCancelled = lesson && (
          rawFach === undefined || rawFach === null ||
          rawFach === "---" || rawFach === "\u2014" || rawFach === "\u2013" ||
          rawFach === "" || rawFach === "-" || rawFach === "\u00a0" ||
          (typeof rawFach === "string" && rawFach.trim() === "") ||
          (typeof rawFach === "string" && /^[-\u2014\u2013\s]+$/.test(rawFach))
        );
        if (isCancelled) {
          subj = '—';
          rowCls += ' vp-mob-cancelled vp-mob-clickable';
        } else if (lesson && lesson.fach) {
          subj = lesson.fach;
          isSub = !!lesson.ist_vertretung;
          const isCurrent = isViewingToday && !isCancelled && slot.lessonNumber === currentLessonNum;
          if (isCurrent) rowCls += ' vp-mob-current';
          else if (isSub) rowCls += ' vp-mob-sub';
          rowCls += ' vp-mob-clickable';
        } else {
          rowCls += ' vp-mob-empty';
        }
        const onclickAttr = (lesson && (lesson.fach || isCancelled))
          ? 'onclick="this.getRootNode().host._showLessonDetail(' + JSON.stringify(lesson).replace(/"/g,'&quot;') + ',\'' + dName + '\',' + slot.period + ',\'' + slot.time + '\',' + isCancelled + ')"'
          : '';
        const isCurrent = isViewingToday && !isCancelled && slot.lessonNumber === currentLessonNum;
        const numPart = '<div class="vp-mob-left' + (isCurrent ? ' vp-mob-left-current' : '') + '"><span class="vp-mob-num">' + slot.period + '</span>'
          + (showTime ? '<span class="vp-mob-time">' + slot.time + '</span>' : '') + '</div>';
        let subjPart;
        if (isCancelled) {
          subjPart = '<div class="vp-mob-subj vp-mob-subj-cancelled">—</div>';
        } else if (subj) {
          subjPart = '<div class="vp-mob-subj' + (isCurrent ? ' vp-mob-subj-current' : isSub ? ' vp-mob-subj-sub' : '') + '">' + subj + '</div>';
        } else {
          subjPart = '<div class="vp-mob-subj vp-mob-subj-empty">—</div>';
        }
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

    // Auto-populate times from XML sensor data when not using custom times
    if (!useCustomTimes && this._hass && this._config.entity) {
      const entity = this._hass.states[this._config.entity];
      const weekTable = entity && entity.attributes && entity.attributes.week_table;
      if (weekTable) {
        const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
        for (let p = 1; p <= 10; p++) {
          for (const day of dayKeys) {
            const lesson = weekTable[day] && weekTable[day][String(p)];
            if (lesson && lesson.zeit && lesson.zeit.includes('-')) {
              defaults['time_' + p] = lesson.zeit;
              break;
            }
          }
        }
      }
    }

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
    const t = this._buildTranslations(); // also sets this._t

    const entity = this._hass.states[this._config.entity];
    if (!entity) {
      this.shadowRoot.innerHTML = '<ha-card><div style="padding:20px;color:#ef4444">' + t.entityNotFound + ': ' + this._config.entity + '</div></ha-card>';
      return;
    }
    if (!entity.attributes || !entity.attributes.week_table) {
      this.shadowRoot.innerHTML = '<ha-card><div style="padding:20px;color:#94a3b8">' + t.noData + '</div></ha-card>';
      return;
    }

    const title         = (this._config.header_settings && this._config.header_settings.title)     || this._config.title     || 'Stundenplan';
    // Auto class name: if config has no class_name or still has the default '5a',
    // prefer the class from the sensor attribute
    const cfgClass = (this._config.header_settings && this._config.header_settings.class_name) || this._config.class_name || '';
    const sensorClass = (entity.attributes && entity.attributes.class) || '';
    const className = (cfgClass && cfgClass !== '5a') ? cfgClass : (sensorClass || cfgClass);
    const showHeader    = this._config.show_header !== false;
    const showTime      = this._config.show_time !== false;
    const highlightToday = this._config.highlight_today !== false;
    const useCustomTimes = this._config.use_custom_times === true;
    const weekOffset    = this._weekOffset || 0;

    // Theme: navy (default), light, or any HA theme name
    // Fallback to navy if empty, null, undefined, or HA's own 'default' theme
    const theme = (this._config.theme && this._config.theme !== 'default') ? this._config.theme : 'navy';
    // Built-in themes
    const T = {
      navy:  { bg:'#0f1729', bg2:'#1a2a50', text:'#e2e8f0', text2:'#94a3b8', text3:'#475569', border:'rgba(255,255,255,0.08)', tileNormal:'#1a2a50', tileCancelled:'#7f1d1d', tileSub:'#7f1d1d', tileToday:'#1a2a50', tileCurrent:'#14532d', useThemeColors:false },
      light: { bg:'#ffffff', bg2:'#f1f5f9', text:'#1e293b', text2:'#475569', text3:'#94a3b8', border:'rgba(0,0,0,0.1)', tileNormal:'#e2e8f0', tileCancelled:'#fecaca', tileSub:'#fed7aa', tileToday:'#dbeafe', tileCurrent:'#bbf7d0', useThemeColors:false },
    };
    let tv;
    if (T[theme]) {
      tv = T[theme];
    } else {
      // HA theme — use CSS vars for everything, tiles adapt to theme
      tv = {
        bg:     'var(--ha-card-background, var(--card-background-color, #1c1c1c))',
        bg2:    'var(--secondary-background-color, #2a2a2a)',
        text:   'var(--primary-text-color, #e2e8f0)',
        text2:  'var(--secondary-text-color, #94a3b8)',
        text3:  'var(--disabled-text-color, #475569)',
        border: 'var(--divider-color, rgba(255,255,255,0.1))',
        tileNormal:    'var(--secondary-background-color, #2a2a2a)',
        tileCancelled: 'var(--error-color, #ef4444)',
        tileSub:       'var(--warning-color, #f97316)',
        tileToday:     'var(--primary-color, #3b82f6)',
        tileCurrent:   'var(--success-color, #22c55e)',
        useThemeColors: true,
      };
      // Apply HA theme CSS vars to shadow host
      if (this._hass && this._hass.themes && this._hass.themes.themes && this._hass.themes.themes[theme]) {
        const themeVars = this._hass.themes.themes[theme];
        const hostStyle = this.shadowRoot.host ? this.shadowRoot.host.style : null;
        if (hostStyle) {
          Object.entries(themeVars).forEach(([k, v]) => {
            hostStyle.setProperty('--' + k, v);
          });
        }
      }
    }

    // Pick correct week table
    const weekTable = weekOffset === 1
      ? (entity.attributes && entity.attributes.next_week_table) || null
      : entity.attributes.week_table;

    // If next week data not yet available, show loading state
    if (weekOffset === 1 && !weekTable) {
      this.shadowRoot.innerHTML = `<ha-card><div style="padding:32px 20px;text-align:center;color:#94a3b8;font-family:-apple-system,sans-serif">
        <div style="font-size:1.5em;margin-bottom:12px">⏳</div>
        <div style="font-weight:600;color:#e2e8f0;margin-bottom:6px">${t.nextWeek}</div>
        <div style="font-size:.85em">Daten werden geladen…</div>
      </div></ha-card>`;
      return;
    }

    const now = new Date();
    const days = t.days;
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const todayDow = now.getDay();
    // Only highlight today column when viewing current week
    const todayIdx = (weekOffset === 0 && highlightToday && todayDow >= 1 && todayDow <= 5) ? todayDow - 1 : -1;

    // Calculate Monday of the displayed week
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + weekOffset * 7);
    const dayDates = days.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });

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
        tableHtml += '<tr class="vp-pause-tr"><td colspan="6"><div class="vp-pause-cell">' + t.pause + ' ' + slot.time + '</div></td></tr>';
      } else {
        const numHtml = showTime
          ? '<div class="vp-snum">' + slot.period + '</div><div class="vp-stime">' + slot.time + '</div>'
          : '<div class="vp-snum">' + slot.period + '</div>';
        tableHtml += '<tr><td class="vp-td-num">' + numHtml + '</td>';
        const dayFullNames = t.daysFull;
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
    const dayFullNames = t.daysFull;
    const buildMobRows = (dayKey, dayIdx) => {
      const sched = weekTable[dayKey] || {};
      const dName = dayFullNames[dayIdx] || dayKey;
      // Only highlight current lesson when viewing today's tab
      const isViewingToday = dayIdx === todayIdx;
      let rows = '';
      slots.forEach(slot => {
        if (slot.isPause) {
          rows += '<div class="vp-mob-pause-row"><span>' + t.pause + ' ' + slot.time + '</span></div>';
        } else {
          const lesson = sched[slot.lessonNumber];
          let rowCls = 'vp-mob-lesson';
          let subj = '';
          let isSub = false;
          // Detect cancellation in mobile too
          const rawFachMob = lesson ? lesson.fach : undefined;
          const isCancelledMob = lesson && (
            rawFachMob === undefined || rawFachMob === null ||
            rawFachMob === "---" || rawFachMob === "\u2014" || rawFachMob === "\u2013" ||
            rawFachMob === "" || rawFachMob === "-" || rawFachMob === "\u00a0" ||
            (typeof rawFachMob === "string" && rawFachMob.trim() === "") ||
            (typeof rawFachMob === "string" && /^[-\u2014\u2013\s]+$/.test(rawFachMob))
          );
          // Current lesson highlight (green) — only on today's tab, not cancelled
          const isCurrent = isViewingToday && !isCancelledMob && slot.lessonNumber === currentLessonNum;
          if (isCancelledMob) {
            subj = '—';
            rowCls += ' vp-mob-cancelled vp-mob-clickable';
          } else if (lesson && lesson.fach) {
            subj = lesson.fach;
            isSub = !!lesson.ist_vertretung;
            if (isCurrent) rowCls += ' vp-mob-current';
            else if (isSub) rowCls += ' vp-mob-sub';
            rowCls += ' vp-mob-clickable';
          } else {
            rowCls += ' vp-mob-empty';
          }
          const onclickAttr = (lesson && (lesson.fach || isCancelledMob))
            ? 'onclick="this.getRootNode().host._showLessonDetail(' + JSON.stringify(lesson).replace(/"/g, '&quot;') + ',\'' + dName + '\',' + slot.period + ',\'' + slot.time + '\',' + isCancelledMob + ')"'
            : '';
          const numPart = '<div class="vp-mob-left' + (isCurrent ? ' vp-mob-left-current' : '') + '"><span class="vp-mob-num">' + slot.period + '</span>'
            + (showTime ? '<span class="vp-mob-time">' + slot.time + '</span>' : '') + '</div>';
          let subjPart;
          if (isCancelledMob) {
            subjPart = '<div class="vp-mob-subj vp-mob-subj-cancelled">—</div>';
          } else if (subj) {
            subjPart = '<div class="vp-mob-subj' + (isCurrent ? ' vp-mob-subj-current' : isSub ? ' vp-mob-subj-sub' : '') + '">' + subj + '</div>';
          } else {
            subjPart = '<div class="vp-mob-subj vp-mob-subj-empty">—</div>';
          }
          rows += '<div class="' + rowCls + '" ' + onclickAttr + '>' + numPart + subjPart + '</div>';
        }
      });
      return rows;
    };

    let mobileHtml = mobTabs + '<div id="vp-mob-content">' + buildMobRows(mobDayKey, mobDayIdx) + '</div>';

    this.shadowRoot.innerHTML = `
<style>
:host {
  display: block;
  --vp-bg: ${tv.bg};
  --vp-bg2: ${tv.bg2};
  --vp-text: ${tv.text};
  --vp-text2: ${tv.text2};
  --vp-text3: ${tv.text3};
  --vp-border: ${tv.border};
  --vp-tile: ${tv.tileNormal};
  --vp-tile-cancelled: ${tv.tileCancelled};
  --vp-tile-sub: ${tv.tileSub};
  --vp-tile-today: ${tv.tileToday};
  --vp-tile-current: ${tv.tileCurrent};
  --vp-tile-opacity: ${tv.useThemeColors ? '0.15' : '1'};
}
ha-card {
  background: var(--vp-bg) !important;
  border-radius: var(--ha-card-border-radius, 14px) !important;
  overflow: hidden;
  box-shadow: 0 6px 32px rgba(0,0,0,0.55) !important;
  border: 1px solid var(--vp-border) !important;
  font-family: var(--paper-font-body1_-_font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  color: var(--vp-text) !important;
}
/* HEADER */
.vp-hdr {
  display: ${showHeader ? 'flex' : 'none'};
  align-items: center; gap: 10px;
  padding: 12px 14px 10px;
  background: var(--vp-bg);
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
  font-size: 1.15em; font-weight: 700;
  color: var(--vp-text);
  line-height: 1.2; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.vp-hdr-sub { font-size: 0.8em; color: var(--vp-text2); white-space: nowrap; }
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
.vp-pill-btn:hover { background: rgba(255,255,255,0.11); color: #e2e8f0; border-color: rgba(255,255,255,0.22); }
.vp-pill-week { color: #93c5fd; border-color: rgba(59,130,246,0.35); background: rgba(59,130,246,0.1); }
.vp-pill-week:hover { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #bfdbfe; }
.vp-pill-week-back { color: #86efac; border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.1); }
.vp-pill-week-back:hover { background: rgba(34,197,94,0.2); border-color: #22c55e; color: #bbf7d0; }
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
  padding: 8px 4px; text-align: center;
  color: var(--vp-text3);
  font-size: 0.78em; font-weight: 600; text-transform: uppercase;
  letter-spacing: .5px; border-bottom: 1px solid var(--vp-border);
  background: var(--vp-bg); line-height: 1.2;
}
.vp-th-day { display: block; }
.vp-th-date { display: block; font-size: 0.85em; color: var(--vp-text3); font-weight: 500; text-transform: none; letter-spacing: 0; }
.vp-th-num { width: 56px; min-width: 56px; }
.vp-table td { padding: 3px 3px; text-align: center; vertical-align: middle; background: var(--vp-bg); height: 52px; }
.vp-td-num { width: 56px; min-width: 56px; padding: 4px 6px; }
.vp-snum  { font-size: .88em; font-weight: 600; color: var(--vp-text2); line-height: 1.3; }
.vp-stime { font-size: .68em; color: var(--vp-text3); margin-top: 1px; white-space: nowrap; }
/* TILES */
.vp-tile {
  background: var(--vp-tile); border-radius: 8px; padding: 0 5px;
  font-size: .88em; font-weight: 500; color: var(--vp-text);
  height: 46px; min-height: 46px;
  display: flex; align-items: center;
  justify-content: center; transition: background .15s;
}
.vp-tile.vp-empty { background: rgba(128,128,128,0.08); color: var(--vp-text3); }
.vp-today-col .vp-tile {
  background: var(--vp-tile); border-radius: 8px; padding: 0 5px;
  font-size: .88em; font-weight: 500; color: var(--vp-text);
  height: 46px; min-height: 46px;
  display: flex; align-items: center;
  justify-content: center; transition: background .15s;
}
.vp-today-col .vp-tile.vp-empty { background: color-mix(in srgb, var(--vp-tile-today) 20%, transparent); color: var(--vp-text3); }
.vp-tile.vp-sub { background: color-mix(in srgb, var(--vp-tile-sub) calc(var(--vp-tile-opacity) * 100%), transparent) !important; color: var(--vp-text) !important; font-weight: 600; }
.vp-tile.vp-cancelled { background: color-mix(in srgb, var(--vp-tile-cancelled) calc(var(--vp-tile-opacity) * 100%), transparent) !important; color: var(--vp-text) !important; font-weight: 700; font-size: 1.1em; }
.vp-today-col .vp-tile.vp-cancelled { background: color-mix(in srgb, var(--vp-tile-cancelled) calc(var(--vp-tile-opacity) * 120%), transparent) !important; }
.vp-tile.vp-sub { background: #7f1d1d !important; color: #fca5a5 !important; font-weight: 600; }
/* Cancelled lesson – always red, every column */
.vp-tile.vp-cancelled { background: #7f1d1d !important; color: #fca5a5 !important; font-weight: 700; font-size: 1.1em; }
.vp-today-col .vp-tile.vp-cancelled { background: #991b1b !important; color: #fca5a5 !important; box-shadow: 0 0 0 2px rgba(239,68,68,0.5); }.vp-today-pill {
  background: #2563eb; color: #fff; border-radius: 8px;
  padding: 4px 10px; font-weight: 700; font-size: .82em;
  text-transform: uppercase; letter-spacing: .5px; display: inline-flex;
  flex-direction: column; align-items: center; gap: 1px;
}
.vp-today-date { font-size: 0.85em; font-weight: 500; opacity: 0.85; text-transform: none; letter-spacing: 0; }
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
.vp-legend { display: flex; gap: 18px; padding: 8px 20px 16px; font-size: .82em; background: var(--vp-bg); }
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
  background: var(--vp-bg);
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
.vp-mob-sub   { background: color-mix(in srgb, var(--vp-tile-sub) 25%, transparent); border-left: 3px solid var(--vp-tile-sub); }
.vp-mob-cancelled { background: color-mix(in srgb, var(--vp-tile-cancelled) 25%, transparent); border-left: 3px solid var(--vp-tile-cancelled); }
.vp-mob-current { background: color-mix(in srgb, var(--vp-tile-current) 35%, transparent); border-left: 3px solid var(--vp-tile-current); }
.vp-mob-empty { opacity: .45; }
.vp-mob-left  { display: flex; flex-direction: column; align-items: center; min-width: 44px; }
.vp-mob-left-current .vp-mob-num  { color: #86efac !important; }
.vp-mob-left-current .vp-mob-time { color: #4ade80 !important; }
.vp-mob-num   { font-size: .9em; font-weight: 700; color: #94a3b8; line-height: 1.2; }
.vp-mob-time  { font-size: .62em; color: #475569; margin-top: 1px; white-space: nowrap; }
.vp-mob-subj  {
  flex: 1; font-size: .95em; font-weight: 500; color: var(--vp-text);
  background: var(--vp-bg2); border-radius: 8px;
  padding: 8px 12px; text-align: center;
}
.vp-mob-subj-sub   { background: var(--vp-tile-sub) !important; color: var(--vp-text) !important; font-weight: 600; }
.vp-mob-subj-cancelled { background: var(--vp-tile-cancelled) !important; color: var(--vp-text) !important; font-weight: 700; }
.vp-mob-subj-current { background: var(--vp-tile-current) !important; color: var(--vp-text) !important; font-weight: 700; box-shadow: 0 0 0 2px var(--vp-tile-current); }
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
.vp-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: var(--vp-bg); border-radius: 14px; box-shadow: 0 12px 48px rgba(0,0,0,.7); padding: 0; max-width: 380px; width: 92%; z-index: 1000; border: 1px solid var(--vp-border); color: var(--vp-text); overflow: hidden; }
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
.vp-tile.vp-current { background: var(--vp-tile-current) !important; color: var(--vp-text) !important; font-weight: 700; box-shadow: 0 0 0 2px var(--vp-tile-current); }
.vp-today-col .vp-tile.vp-current { background: var(--vp-tile-current) !important; color: var(--vp-text) !important; box-shadow: 0 0 0 2px var(--vp-tile-current); }
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
        ${infoBtn && weekOffset === 0 ? '<button class="vp-pill vp-pill-info vp-pill-btn' + (infoBtnHasInfo ? ' has-info' : '') + '" onclick="this.getRootNode().host._showInfoPopup()" title="' + t.infoTitle + '">ⓘ</button>' : ''}
        <div class="vp-hdr-spacer"></div>
        ${weekOffset === 0
          ? '<button class="vp-pill vp-pill-btn vp-pill-week" onclick="this.getRootNode().host._switchWeek(1)">' + t.nextWeek + '</button>'
          : '<button class="vp-pill vp-pill-btn vp-pill-week vp-pill-week-back" onclick="this.getRootNode().host._switchWeek(0)">' + t.currentWeek + '</button>'
        }
        ${this._config.reload_entity ? '<button class="vp-pill vp-pill-btn" onclick="this.getRootNode().host._handleReload()">' + t.refresh + '</button>' : ''}
      </div>
      <span class="vp-hdr-sub">${className ? t.classLabel + ' ' + className : ''}</span>
    </div>
  </div>
  <div class="vp-desktop">${tableHtml}</div>
  <div class="vp-mobile">${mobileHtml}</div>
  <div class="vp-legend">
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-t"></span><span class="vp-lt">${t.today}</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-s"></span><span class="vp-ls">${t.sub}</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-c"></span><span class="vp-lc">${t.now}</span></div>
  </div>
</ha-card>
<!-- Lesson detail popup -->
<div id="popup-overlay" class="vp-popup-overlay hidden" onclick="this.getRootNode().host._closePopup()"></div>
<div id="popup" class="vp-popup hidden">
  <div id="popup-title" class="vp-popup-title">Details</div>
  <div id="popup-content"></div>
  <div class="vp-popup-footer"><button class="vp-popup-btn" onclick="this.getRootNode().host._closePopup()">${t.close}</button></div>
</div>
<!-- Info popup -->
<div id="info-popup-overlay" class="vp-popup-overlay hidden" onclick="this.getRootNode().host._closeInfoPopup()"></div>
<div id="info-popup" class="vp-popup hidden">
  <div class="vp-info-popup-title">${t.infoTitle}</div>
  <div id="info-popup-content"></div>
  <div class="vp-popup-footer"><button class="vp-popup-btn" onclick="this.getRootNode().host._closeInfoPopup()">${t.close}</button></div>
</div>`;
  }
}

customElements.define('vpmobile24-card', VpMobile24Card);
window.customCards = window.customCards || [];
window.customCards.push({ type:'vpmobile24-card', name:'VpMobile24 Card', description:'Wochenstundenplan', preview:true });

// ── VpMobile24 Current Lesson Card ────────────────────────────────────────
class VpMobile24CurrentCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  static getStubConfig() {
    return { entity: 'sensor.vpmobile24_aktueller_unterricht' };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { filter: [{ integration: 'vpmobile24' }] } } },
        { name: 'title', default: 'Aktueller Unterricht', selector: { text: { type: 'text' } } },
      ],
      computeLabel: (s) => ({ entity: 'Sensor', title: 'Titel' })[s.name] || s.name,
    };
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error('Entity erforderlich');
    this._config = config;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) this._render();
  }

  getCardSize() { return 2; }

  _render() {
    if (!this._hass || !this._config) return;
    const entity = this._hass.states[this._config.entity];
    const title = this._config.title || 'Aktueller Unterricht';

    if (!entity) {
      this.shadowRoot.innerHTML = `<ha-card><div style="padding:16px;color:#ef4444;font-family:-apple-system,sans-serif">Entity nicht gefunden: ${this._config.entity}</div></ha-card>`;
      return;
    }

    const state = entity.state || '';
    const attr = entity.attributes || {};
    const fach = attr.fach || state;
    const zeit = attr.zeit || '';
    const lehrer = attr.lehrer || '';
    const raum = attr.raum || '';
    const stunde = attr.stunde || '';
    const isAusfall = attr.ist_ausfall || false;
    const isSub = attr.ist_vertretung || false;
    const info = attr.zusatzinfo || '';
    const noLesson = state === 'Keine Daten' || state === 'No data' || !fach;

    const color = isAusfall ? '#ef4444' : isSub ? '#f97316' : '#3b82f6';
    const bgColor = isAusfall ? 'rgba(239,68,68,0.12)' : isSub ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.12)';
    const icon = isAusfall ? '❌' : isSub ? '🔄' : '📚';
    const label = isAusfall ? 'AUSFALL' : isSub ? 'Vertretung' : (stunde ? stunde + '. Stunde' : '');

    this.shadowRoot.innerHTML = `
<style>
:host { display: block; }
ha-card {
  background: #0f1729 !important;
  border-radius: 14px !important;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0 !important;
}
.vp-cur {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: ${bgColor};
  border-left: 4px solid ${color};
}
.vp-cur-icon { font-size: 1.8em; flex-shrink: 0; }
.vp-cur-body { flex: 1; min-width: 0; }
.vp-cur-title { font-size: .72em; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; color: #64748b; margin-bottom: 3px; }
.vp-cur-fach { font-size: 1.4em; font-weight: 800; color: ${noLesson ? '#475569' : '#fff'}; line-height: 1.2; }
.vp-cur-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 5px; }
.vp-cur-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: .72em; font-weight: 600; color: #94a3b8;
  background: rgba(255,255,255,0.06); border-radius: 6px; padding: 2px 8px;
}
.vp-cur-badge {
  display: inline-block; font-size: .68em; font-weight: 700;
  padding: 2px 8px; border-radius: 5px; margin-left: 6px;
  background: ${isAusfall ? 'rgba(239,68,68,.2)' : 'rgba(249,115,22,.2)'};
  color: ${isAusfall ? '#fca5a5' : '#fdba74'};
  border: 1px solid ${isAusfall ? 'rgba(239,68,68,.3)' : 'rgba(249,115,22,.3)'};
}
.vp-cur-info { font-size: .75em; color: #f59e0b; margin-top: 4px; }
.vp-cur-empty { padding: 16px 18px; color: #475569; font-size: .88em; font-style: italic; }
</style>
<ha-card>
  ${noLesson
    ? `<div class="vp-cur-empty">🕐 ${title}: Kein laufender Unterricht</div>`
    : `<div class="vp-cur">
        <div class="vp-cur-icon">${icon}</div>
        <div class="vp-cur-body">
          <div class="vp-cur-title">${title}${label ? ' &nbsp;·&nbsp; ' + label : ''}</div>
          <div class="vp-cur-fach">${isAusfall ? 'AUSFALL' : fach}${(isAusfall || isSub) ? '<span class="vp-cur-badge">' + (isAusfall ? 'Ausfall' : 'Vertretung') + '</span>' : ''}</div>
          <div class="vp-cur-meta">
            ${zeit ? '<span class="vp-cur-chip">🕐 ' + zeit + '</span>' : ''}
            ${lehrer ? '<span class="vp-cur-chip">👤 ' + lehrer + '</span>' : ''}
            ${raum ? '<span class="vp-cur-chip">🚪 ' + raum + '</span>' : ''}
          </div>
          ${info ? '<div class="vp-cur-info">ℹ️ ' + info + '</div>' : ''}
        </div>
      </div>`
  }
</ha-card>`;
  }
}

customElements.define('vpmobile24-current-card', VpMobile24CurrentCard);
window.customCards.push({ type:'vpmobile24-current-card', name:'VpMobile24 Aktueller Unterricht', description:'Zeigt den aktuell laufenden Unterricht', preview:true });
console.log('✅ VpMobile24 Card v2.4.9b loaded');

