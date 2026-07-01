// VpMobile24 Card v2.5.1
console.info('%c VpMobile24-CARD %c v2.5.1 ', 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

// Global registry — CSP-safe, no inline onclick needed
window._vpm24 = window._vpm24 || {};

class VpMobile24Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._t = null;
    this._weekOffset = 0;
    this._uid = '_vpm24_' + Math.random().toString(36).slice(2);
    window._vpm24[this._uid] = this;
    // One persistent click handler on shadowRoot — never re-added
    this._bound_click = (e) => this._handleClick(e);
    this.shadowRoot.addEventListener('click', this._bound_click);
  }

  _handleClick(e) {
    const el = e.target;
    // Popup overlay
    if (el.id === 'popup-overlay')      { this._closePopup();    return; }
    if (el.id === 'info-popup-overlay') { this._closeInfoPopup(); return; }
    // Any button with data-vpm
    const btn = el.closest('[data-vpm]');
    if (!btn) return;
    e.stopPropagation();
    const act = btn.dataset.vpm;
    if (act === 'close')       { this._closePopup();    return; }
    if (act === 'close-info')  { this._closeInfoPopup(); return; }
    if (act === 'next-week')   { this._switchWeek(this._weekOffset + 1); return; }
    if (act === 'cur-week')    { this._switchWeek(0); return; }
    if (act === 'reload')      { this._handleReload();  return; }
    if (act === 'info')        { this._showInfoPopup();  return; }
    if (act === 'mob-day')     { this._switchMobDay(Number(btn.dataset.vpmDay)); return; }
    if (act === 'lesson') {
      try {
        const les = JSON.parse(btn.dataset.vpmLesson);
        this._showLessonDetail(les, btn.dataset.vpmDay, Number(btn.dataset.vpmPeriod), btn.dataset.vpmTime, btn.dataset.vpmCancelled === 'true');
      } catch(err) {}
      return;
    }
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
           holiday:'Schulferien',
           noDetail:'Keine weiteren Details verfügbar.',
           noInfo:(d)=>'Keine Zusatzinformationen für '+d+' verfügbar.',
           genInfo:'📢 Allgemeine Informationen',
           lessonInfo:'📋 Stunden-Informationen',
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
           holiday:'School Holidays',
           noDetail:'No further details available.',
           noInfo:(d)=>'No additional info for '+d+' available.',
           genInfo:'📢 General Information',
           lessonInfo:'📋 Lesson Information',
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
           holiday:'Vacances scolaires',
           noDetail:'Aucun d\u00e9tail disponible.',
           noInfo:(d)=>'Aucune info pour '+d+'.',
           genInfo:'📢 Informations g\u00e9n\u00e9rales',
           lessonInfo:'📋 Informations de cours',
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
        de:{entity:"Wochentabellen-Sensor",additional_info_entity:"Zusatzinfo-Sensor",reload_entity:"Neu laden Button",title:"Kartentitel",class_name:"Klassenname (leer = automatisch)",show_time:"Uhrzeiten anzeigen",show_header:"Header anzeigen",highlight_today:"Heutigen Tag hervorheben",use_custom_times:"Eigene Uhrzeiten verwenden",sensors:"Weitere Sensoren",header_settings:"Header & Anzeige",time_settings:"Uhrzeiten-Anpassung",lesson_count:"Anzahl der Stunden",pause_count:"Anzahl der Pausen",time_1:"1. Stunde",time_2:"2. Stunde",time_3:"3. Stunde",time_4:"4. Stunde",time_5:"5. Stunde",time_6:"6. Stunde",time_7:"7. Stunde",time_8:"8. Stunde",time_9:"9. Stunde",time_10:"10. Stunde",pause_1:"1. Pause - Zeit",pause_1_after:"1. Pause - Nach Stunde",pause_2:"2. Pause - Zeit",pause_2_after:"2. Pause - Nach Stunde",pause_3:"3. Pause - Zeit",pause_3_after:"3. Pause - Nach Stunde",pause_4:"4. Pause - Zeit",pause_4_after:"4. Pause - Nach Stunde",pause_5:"5. Pause - Zeit",pause_5_after:"5. Pause - Nach Stunde"},
        en:{entity:"Week Table Sensor",additional_info_entity:"Additional Info Sensor",reload_entity:"Reload Button",title:"Title",class_name:"Class Name (empty = auto)",show_time:"Show Times",show_header:"Show Header",highlight_today:"Highlight Today",use_custom_times:"Use Custom Times",header_settings:"Header Settings",time_settings:"Time Settings",lesson_count:"Number of Periods",pause_count:"Number of Breaks",time_1:"Period 1",time_2:"Period 2",time_3:"Period 3",time_4:"Period 4",time_5:"Period 5",time_6:"Period 6",time_7:"Period 7",time_8:"Period 8",time_9:"Period 9",time_10:"Period 10",pause_1:"Break 1 - Time",pause_1_after:"Break 1 - After Period",pause_2:"Break 2 - Time",pause_2_after:"Break 2 - After Period",pause_3:"Break 3 - Time",pause_3_after:"Break 3 - After Period",pause_4:"Break 4 - Time",pause_4_after:"Break 4 - After Period",pause_5:"Break 5 - Time",pause_5_after:"Break 5 - After Period"},
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
      de: {
        sensors:         '📡 Sensoren',
        header_settings: '🎨 Header & Anzeige',
        time_settings:   '⏰ Uhrzeiten-Anpassung',
      },
      en: {
        sensors:         '📡 Sensors',
        header_settings: '🎨 Header & Display',
        time_settings:   '⏰ Time Settings',
      },
      fr: {
        sensors:         '📡 Capteurs',
        header_settings: '🎨 En-t\u00eate & Affichage',
        time_settings:   '⏰ Personnalisation des Horaires',
      },
    };
    const hl0 = _hl(null);
    const st = _sectionTitles[['de','en','fr'].includes(hl0) ? hl0 : 'de'];

    return {
      schema: [
        // ── Pflicht-Sensor ────────────────────────────────────────────────
        { name: "entity", required: true,
          selector: { entity: { filter: [{ integration: "vpmobile24" }] } } },

        // ── Optionale Sensoren (eingeklappt) ──────────────────────────────
        { type: "expandable", name: "sensors", title: st.sensors, collapsed: true,
          schema: [
            { name: "additional_info_entity", required: false,
              selector: { entity: { filter: [{ integration: "vpmobile24" }] } } },
            { name: "reload_entity", required: false,
              selector: { entity: { domain: "button" } } },
          ]
        },

        // ── Header & Anzeige (ausgeklappt) ────────────────────────────────
        { name: "show_header", default: true, selector: { boolean: {} } },
        { type: "expandable", name: "header_settings", title: st.header_settings, collapsed: false,
          schema: [
            { name: "title",           default: "Stundenplan", selector: { text: { type: "text" } } },
            { name: "class_name",      default: "",    selector: { text: { type: "text" } } },
            { name: "highlight_today", default: true,  selector: { boolean: {} } },
            { name: "show_time",       default: true,  selector: { boolean: {} } },
          ]
        },

        // ── Uhrzeiten (eingeklappt) ───────────────────────────────────────
        { name: "use_custom_times", default: false, selector: { boolean: {} } },
        { type: "expandable", name: "time_settings", title: st.time_settings, collapsed: true,
          schema: [
            { name: "lesson_count", default: 8, selector: { number: { min: 1, max: 10, step: 1, mode: "box" } } },
            { name: "pause_count",  default: 2, selector: { number: { min: 0, max: 5,  step: 1, mode: "box" } } },
            { name: "time_1",  default: "07:45-08:30", selector: { text: { type: "text" } } },
            { name: "time_2",  default: "08:40-09:25", selector: { text: { type: "text" } } },
            { name: "time_3",  default: "09:25-10:10", selector: { text: { type: "text" } } },
            { name: "time_4",  default: "10:35-11:20", selector: { text: { type: "text" } } },
            { name: "time_5",  default: "11:30-12:15", selector: { text: { type: "text" } } },
            { name: "time_6",  default: "12:45-13:30", selector: { text: { type: "text" } } },
            { name: "time_7",  default: "13:40-14:25", selector: { text: { type: "text" } } },
            { name: "time_8",  default: "14:35-15:20", selector: { text: { type: "text" } } },
            { name: "time_9",  default: "15:00-15:45", selector: { text: { type: "text" } } },
            { name: "time_10", default: "15:50-16:35", selector: { text: { type: "text" } } },
            { type: "grid", name: "pause_1_config", schema: [
              { name: "pause_1",       default: "10:10-10:30", selector: { text: { type: "text" } } },
              { name: "pause_1_after", default: 3, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_2_config", schema: [
              { name: "pause_2",       default: "12:15-12:45", selector: { text: { type: "text" } } },
              { name: "pause_2_after", default: 5, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_3_config", schema: [
              { name: "pause_3",       default: "13:15-13:20", selector: { text: { type: "text" } } },
              { name: "pause_3_after", default: 6, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_4_config", schema: [
              { name: "pause_4",       default: "14:55-15:00", selector: { text: { type: "text" } } },
              { name: "pause_4_after", default: 8, selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } }
            ]},
            { type: "grid", name: "pause_5_config", schema: [
              { name: "pause_5",       default: "16:35-16:40", selector: { text: { type: "text" } } },
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
    this._mobDayIdx = null;
    this._weekOffset = 0;
    if (this._hass) this._render();
  }

  _switchWeek(offset) {
    this._weekOffset = offset;
    this._manualWeekOffset = true;  // user navigated manually — disable auto-switch
    this._popupOpen = false;
    this._popupData = null;
    this._infoPopupOpen = false;
    if (offset === 0) {
      const todayDow = new Date().getDay();
      this._mobDayIdx = (todayDow >= 1 && todayDow <= 5) ? todayDow - 1 : 0;
    } else {
      this._mobDayIdx = 0;
    }
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      const dow = new Date().getDay();
      // Auto-switch to next week on weekends — but only if user hasn't navigated manually
      if ((dow === 0 || dow === 6) && !this._weekOffset && !this._manualWeekOffset) {
        this._weekOffset = 1; this._mobDayIdx = 0;
      }
      if (this._popupOpen || this._infoPopupOpen) {
        this._updateTableOnly();
        if (this._infoPopupOpen) this._renderInfoPopupContent();
      } else {
        this._render();
      }
    }
  }
  get hass() { return this._hass; }
  getCardSize() { return 6; }

  _handleReload() {
    const r = this._config.reload_entity || (this._config.sensors && this._config.sensors.reload_entity);
    if (!r) return;
    this._reloading = true;
    this._render(); // re-render with green spinning button
    setTimeout(() => {
      this._reloading = false;
      if (!this._popupOpen && !this._infoPopupOpen) this._render();
    }, 900);
    this._hass.callService('button', 'press', { entity_id: r });
  }

  _showInfoPopup() {
    const e = this._config.additional_info_entity || (this._config.sensors && this._config.sensors.additional_info_entity);
    if (!e) return;
    if ((this._weekOffset || 0) !== 0) return;
    this._infoPopupOpen = true;
    this._renderInfoPopupContent();
  }

  _renderInfoPopupContent() {
    const t = this._t || this._buildTranslations();
    const wdKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayIdx = new Date().getDay();
    const todayKey = wdKeys[todayIdx];
    const wdNames = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    const wdNamesEN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const wdNamesFR = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const haLang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
    const todayName = haLang === 'en' ? wdNamesEN[todayIdx] : haLang === 'fr' ? wdNamesFR[todayIdx] : wdNames[todayIdx];

    const infoEntId = this._config.additional_info_entity || (this._config.sensors && this._config.sensors.additional_info_entity);
    const ent = (this._hass && infoEntId) ? this._hass.states[infoEntId] : null;
    const attr = ent ? (ent.attributes || {}) : {};

    const toArr = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.map(String);
      if (typeof v === 'string') return v.split('\n').map(s => s.trim()).filter(Boolean);
      return [];
    };

    let allg = [];
    const wi = attr.week_infos;
    if (wi && wi[todayKey]) allg = toArr(wi[todayKey].allgemeine_infos);
    if (allg.length === 0)  allg = toArr(attr.allgemeine_infos);

    let bodyHtml = '';
    if (allg.length > 0) {
      bodyHtml = `<div class="vp-info-section">
        <div class="vp-info-section-label">${t.genInfo || '📢 Allgemeine Informationen'}</div>
        ${allg.map(a => `<div class="vp-info-entry"><span>${a}</span></div>`).join('')}
      </div>`;
    } else {
      const noInfoMsg = haLang === 'en' ? `No additional info for ${todayName} available.`
                      : haLang === 'fr' ? `Aucune info pour ${todayName}.`
                      : `Keine Zusatzinformationen für ${todayName} verfügbar.`;
      bodyHtml = `<div class="vp-info-none">${noInfoMsg}</div>`;
    }

    let overlay = this.shadowRoot.getElementById('info-popup-overlay');
    let popup   = this.shadowRoot.getElementById('info-popup');

    if (!overlay || !popup) {
      const o = document.createElement('div');
      o.id = 'info-popup-overlay';
      o.className = 'vp-popup-overlay';
      o.addEventListener('click', () => this._closeInfoPopup());
      this.shadowRoot.appendChild(o);
      const p = document.createElement('div');
      p.id = 'info-popup';
      p.className = 'vp-popup';
      p.innerHTML = `
        <div class="vp-info-popup-title">${t.infoTitle || 'ℹ️ Zusatzinformationen'}</div>
        <div id="info-popup-content"></div>
        <div class="vp-popup-footer"><button class="vp-popup-btn" data-vpm="close-info">${t.close || 'Schließen'}</button></div>`;
      this.shadowRoot.appendChild(p);
      overlay = o; popup = p;
    }

    const content = this.shadowRoot.getElementById('info-popup-content');
    if (content) content.innerHTML = bodyHtml + '<div style="height:8px"></div>';
    overlay.classList.remove('hidden');
    popup.classList.remove('hidden');
  }

  _closeInfoPopup() {
    this._infoPopupOpen = false;
    const p = this.shadowRoot.getElementById('info-popup');
    const o = this.shadowRoot.getElementById('info-popup-overlay');
    if (p) p.classList.add('hidden');
    if (o) o.classList.add('hidden');
  }

  _closePopup() {
    this._popupOpen = false;
    this._popupData = null;
    const popup   = this.shadowRoot.getElementById('popup');
    const overlay = this.shadowRoot.getElementById('popup-overlay');
    if (popup) {
      popup.classList.add('hidden');
      popup.classList.remove('vp-popup-ausfall');
      const tt = popup.querySelector('#popup-title');
      if (tt) tt.style.display = '';
    }
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
    const lehrer = (lesson && lesson.lehrer) || '';
    const raum   = (lesson && lesson.raum)   || '';
    const zeit   = (lesson && lesson.zeit)   || slotTime || '';
    const info   = (lesson && lesson.zusatzinfo) || '';
    const isActuallyCancelled = isCancelled || fach === '—';
    const isVertretung = !isActuallyCancelled && !!(lesson && lesson.ist_vertretung);
    if (isActuallyCancelled) {
      title.innerHTML = ''; title.style.display = 'none';
      content.innerHTML = '<div class="vp-ausfall-block">' + t.cancel + '</div>';
      popup.classList.add('vp-popup-ausfall');
      popup.classList.remove('hidden');
      overlay.classList.remove('hidden');
      return;
    }
    let badge = '';
    if (isVertretung) badge = '<span class="vp-detail-badge vp-detail-sub">' + t.substitution + '</span>';
    title.style.display = '';
    title.innerHTML = '<span class="vp-detail-num">' + slotPeriod + '. ' + t.period + '</span>'
      + '<span class="vp-detail-fach">' + fach + '</span>' + badge;
    let rows = '<div class="vp-detail-row"><span class="vp-detail-icon">🕐</span>'
      + '<span class="vp-detail-label">' + slotPeriod + '. ' + t.period + '</span>'
      + '<span class="vp-detail-val">' + (zeit || '—') + '</span></div>';
    if (lehrer) rows += '<div class="vp-detail-row"><span class="vp-detail-icon">👤</span><span class="vp-detail-label">' + t.teacher + '</span><span class="vp-detail-val">' + lehrer + '</span></div>';
    if (raum)   rows += '<div class="vp-detail-row"><span class="vp-detail-icon">🚪</span><span class="vp-detail-label">' + t.room + '</span><span class="vp-detail-val">' + raum + '</span></div>';
    if (info)   rows += '<div class="vp-detail-row vp-detail-info-row"><span class="vp-detail-icon">ℹ️</span><span class="vp-detail-label">' + t.info + '</span><span class="vp-detail-val">' + info + '</span></div>';
    if (!lehrer && !raum && !info) rows += '<div class="vp-detail-empty">' + t.noDetail + '</div>';
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
    const weekTable = weekOffset === 2
      ? (entity.attributes && entity.attributes.next_next_week_table)
      : weekOffset === 1
      ? (entity.attributes && entity.attributes.next_week_table)
      : (entity.attributes && entity.attributes.week_table);
    if (!weekTable) {
      // Only do a full re-render if no popup is open
      if (!this._popupOpen && !this._infoPopupOpen) this._render();
      return;
    }

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

    // ── Calculate current lesson ──────────────────────────────────────────
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    let currentLessonNum = -1;
    if (todayIdx >= 0) {
      slots.forEach(slot => {
        if (!slot.isPause && slot.time) {
          const parts = slot.time.split('-');
          if (parts.length === 2) {
            const [sh, sm] = parts[0].split(':').map(Number);
            const [eh, em] = parts[1].split(':').map(Number);
            if (nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em)
              currentLessonNum = slot.lessonNumber;
          }
        }
      });
    }

    const tbody = this.shadowRoot.querySelector('.vp-table tbody');
    if (!tbody) {
      // No table found (e.g. mobile view) — never call _render() while popup is open
      if (!this._popupOpen && !this._infoPopupOpen) this._render();
      return;
    }

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
            const isCurrent = isToday && slot.lessonNumber === currentLessonNum;
            if (isCurrent)         cls += ' vp-current';
            else if (isVertretung) cls += ' vp-sub';
            else                   cls += ' vp-normal';
            cls += ' vp-tile-clickable';
          } else if (isCancelled) {
            text = '—';
            cls += ' vp-cancelled vp-tile-clickable';
          } else {
            cls += ' vp-empty';
          }
          const tip = lesson ? [lesson.fach, lesson.lehrer && '👤 '+lesson.lehrer, lesson.raum && '🚪 '+lesson.raum].filter(Boolean).join(' | ') : '';
          const lessonAttr = (lesson && (lesson.fach || isCancelled))
            ? 'data-vpm="lesson" data-vpm-lesson=\'' + JSON.stringify(lesson).replace(/'/g,'&#39;').replace(/\\/g,'\\\\') + '\' data-vpm-day="' + dayFullNames[di] + '" data-vpm-period="' + slot.period + '" data-vpm-time="' + slot.time + '" data-vpm-cancelled="' + isCancelled + '"'
            : '';
          bodyHtml += '<td class="' + (isToday ? 'vp-today-col' : '') + '"><div class="' + cls + '" ' + lessonAttr + (tip ? ' title="' + tip.replace(/"/g,'&quot;') + '"' : '') + '>' + text + '</div></td>';
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
    const weekTable = weekOffset === 2
      ? (entity && entity.attributes && entity.attributes.next_next_week_table)
      : weekOffset === 1
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
        const lessonAttr = (lesson && (lesson.fach || isCancelled))
          ? 'data-vpm="lesson" data-vpm-lesson=\'' + JSON.stringify(lesson).replace(/'/g,'&#39;').replace(/\\/g,'\\\\') + '\' data-vpm-day="' + dName + '" data-vpm-period="' + slot.period + '" data-vpm-time="' + slot.time + '" data-vpm-cancelled="' + isCancelled + '"'
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
        rows += '<div class="' + rowCls + '" ' + lessonAttr + '>' + numPart + subjPart + '</div>';
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
    const t = this._buildTranslations();

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
    const cfgClass = (this._config.header_settings && this._config.header_settings.class_name) || this._config.class_name || '';
    const sensorClass = (entity.attributes && entity.attributes.class) || '';
    const className = (cfgClass && cfgClass !== '5a') ? cfgClass : (sensorClass || cfgClass);
    const showHeader    = this._config.show_header !== false;
    const showTime      = (this._config.header_settings && this._config.header_settings.show_time  !== undefined)
                          ? this._config.header_settings.show_time !== false
                          : this._config.show_time !== false;
    const highlightToday = (this._config.header_settings && this._config.header_settings.highlight_today !== undefined)
                           ? this._config.header_settings.highlight_today !== false
                           : this._config.highlight_today !== false;
    const useCustomTimes = this._config.use_custom_times === true;
    const weekOffset    = this._weekOffset || 0;
    // Resolve additional_info_entity + reload_entity from top-level OR nested sensors object
    const sensors = this._config.sensors || {};
    const additionalInfoEntity = this._config.additional_info_entity || sensors.additional_info_entity || null;
    const reloadEntity         = this._config.reload_entity          || sensors.reload_entity          || null;
    const holidayEntity        = this._config.holiday_entity         || sensors.holiday_entity
      // Auto-detect: replace last segment of entity ID with 'ferien'
      || (entity && entity.entity_id ? entity.entity_id.replace(/_week_table$/, '_ferien').replace(/_wochentabelle$/, '_ferien') : null);

    // ── Holiday check ──────────────────────────────────────────────────
    const holidayEnt = holidayEntity ? this._hass.states[holidayEntity] : null;
    const isHolidayFromSensor = !!(holidayEnt && holidayEnt.attributes && holidayEnt.attributes.ist_ferien);
    const holidayNameFromSensor = isHolidayFromSensor ? (holidayEnt.state || 'Ferien') : '';

    // Auto-detect holidays from empty week_table (all days empty = Ferien)
    const _isWeekEmpty = (wt) => {
      if (!wt) return false;
      const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
      return dayKeys.every(dk => {
        const day = wt[dk] || {};
        return Object.keys(day).length === 0 || Object.values(day).every(l => !l || !l.fach);
      });
    };

    // Determine holiday state
    const weekTableForHolidayCheck = entity.attributes.week_table;
    const isWeekEmpty = weekOffset === 0 && _isWeekEmpty(weekTableForHolidayCheck);
    const isHoliday = isHolidayFromSensor || isWeekEmpty;
    // Name: from sensor, or next holiday name, or generic
    let holidayName = holidayNameFromSensor;
    if (!holidayName && isWeekEmpty) {
      const nextName = holidayEnt && holidayEnt.attributes && holidayEnt.attributes.naechste_ferien_name;
      holidayName = nextName || (t.holiday || 'Ferien');
    }

    // ── Full holiday screen ─────────────────────────────────────────────
    if (isHoliday) {
      const endDate = holidayEnt && holidayEnt.attributes && holidayEnt.attributes.end;
      const nextStart = holidayEnt && holidayEnt.attributes && holidayEnt.attributes.naechste_ferien_start;
      const nextName  = holidayEnt && holidayEnt.attributes && holidayEnt.attributes.naechste_ferien_name;
      const haLang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
      const fmtDate = (ds) => ds ? new Date(ds).toLocaleDateString(haLang === 'en' ? 'en-GB' : haLang === 'fr' ? 'fr-FR' : 'de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}) : '';
      const untilStr = haLang === 'en' ? 'Until' : haLang === 'fr' ? 'Jusqu\'au' : 'Bis';
      const nextStr  = haLang === 'en' ? 'Next' : haLang === 'fr' ? 'Prochain' : 'Nächste';
      this.shadowRoot.innerHTML = `
<style>
:host { display: block; }
ha-card {
  background: linear-gradient(135deg, #0f1729 0%, #1a2a1a 100%) !important;
  border-radius: 16px !important; overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6) !important;
  border: 1px solid rgba(245,158,11,.3) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0 !important;
}
.hol-wrap {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center;
  padding: 40px 24px; min-height: 220px; gap: 12px;
}
.hol-icon { font-size: 3.5em; margin-bottom: 4px; }
.hol-title { font-size: 1.6em; font-weight: 800; color: #fde68a; }
.hol-sub { font-size: .9em; color: #94a3b8; }
.hol-next { font-size: .82em; color: #64748b; margin-top: 8px; }
.hol-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 16px 10px;
  border-bottom: 1px solid rgba(245,158,11,.15);
  background: rgba(245,158,11,.05);
}
.hol-hdr-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  background: linear-gradient(135deg,#f59e0b,#d97706);
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 1.2em;
}
.hol-hdr-title { font-size: 1.1em; font-weight: 800; color: #fff; }
.hol-hdr-class {
  font-size: .72em; font-weight: 700; color: #f59e0b;
  background: rgba(245,158,11,.13); border: 1px solid rgba(245,158,11,.25);
  border-radius: 6px; padding: 2px 8px;
}
</style>
<ha-card>
  <div class="hol-hdr">
    <div class="hol-hdr-icon">🗓️</div>
    <div>
      <div class="hol-hdr-title">${title}</div>
      ${className ? `<span class="hol-hdr-class">${t.classLabel || 'Klasse'} ${className}</span>` : ''}
    </div>
  </div>
  <div class="hol-wrap">
    <div class="hol-icon">🏖️</div>
    <div class="hol-title">${holidayName}</div>
    ${endDate ? `<div class="hol-sub">${untilStr} ${fmtDate(endDate)}</div>` : ''}
    ${nextName && nextStart && !isHolidayFromSensor ? `<div class="hol-next">${nextStr}: ${nextName} ab ${fmtDate(nextStart)}</div>` : ''}
  </div>
</ha-card>`;
      return;
    }

    // Pick correct week table
    const weekTable = weekOffset === 2
      ? (entity.attributes && entity.attributes.next_next_week_table) || null
      : weekOffset === 1
      ? (entity.attributes && entity.attributes.next_week_table) || null
      : entity.attributes.week_table;

    // If next/next_next week data not yet available, show loading state
    if (weekOffset >= 1 && !weekTable) {
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
    if (additionalInfoEntity) {
      infoBtn = true;
      const infoEnt = this._hass.states[additionalInfoEntity];
      if (infoEnt && infoEnt.attributes) {
        const allg  = infoEnt.attributes.allgemeine_infos  || [];
        const stund = infoEnt.attributes.stunden_infos     || [];
        const totalDirect = allg.length + stund.length;
        // Also check week_infos for any day
        const weekInfos = infoEnt.attributes.week_infos || {};
        const totalWeek = Object.values(weekInfos).reduce((sum, d) =>
          sum + (d.allgemeine_infos || []).length + (d.stunden_infos || []).length, 0);
        infoBtnHasInfo = (totalDirect + totalWeek) > 0;
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
            if (isCurrent)       cls += ' vp-current';
            else if (isVertretung) cls += ' vp-sub';
            else                   cls += ' vp-normal';
            cls += ' vp-tile-clickable';
          } else if (isCancelled) {
            text = '—';
            cls += ' vp-cancelled vp-tile-clickable';
          } else {
            cls += ' vp-empty';
          }
          const tip = lesson ? [lesson.fach, lesson.lehrer && '👤 '+lesson.lehrer, lesson.raum && '🚪 '+lesson.raum].filter(Boolean).join(' | ') : '';
          const lessonAttr2 = (lesson && (lesson.fach || isCancelled))
            ? 'data-vpm="lesson" data-vpm-lesson=\'' + JSON.stringify(lesson).replace(/'/g,'&#39;').replace(/\\/g,'\\\\') + '\' data-vpm-day="' + dayFullNames[di] + '" data-vpm-period="' + slot.period + '" data-vpm-time="' + slot.time + '" data-vpm-cancelled="' + isCancelled + '"'
            : '';
          tableHtml += '<td class="' + (isToday ? 'vp-today-col' : '') + '"><div class="' + cls + '" ' + lessonAttr2 + (tip ? ' title="' + tip.replace(/"/g,'&quot;') + '"' : '') + '>' + text + '</div></td>';
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
      mobTabs += '<button class="vp-mob-tab' + active + '" data-vpm="mob-day" data-vpm-day="' + i + '"><span class="vp-mob-tab-day">' + d + '</span><span class="vp-mob-tab-date">' + dn + '</span></button>';
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
          const onclickAttr2 = (lesson && (lesson.fach || isCancelledMob))
            ? 'data-vpm="lesson" data-vpm-lesson=\'' + JSON.stringify(lesson).replace(/'/g,'&#39;').replace(/\\/g,'\\\\') + '\' data-vpm-day="' + dName + '" data-vpm-period="' + slot.period + '" data-vpm-time="' + slot.time + '" data-vpm-cancelled="' + isCancelledMob + '"'
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
          rows += '<div class="' + rowCls + '" ' + onclickAttr2 + '>' + numPart + subjPart + '</div>';        }
      });
      return rows;
    };

    let mobileHtml = mobTabs + '<div id="vp-mob-content">' + buildMobRows(mobDayKey, mobDayIdx) + '</div>';

    // ── KW + Smart status bar ────────────────────────────────────────────
    const kwNum = (() => {
      const d = new Date(monday);
      const jan4 = new Date(d.getFullYear(), 0, 4);
      const startW1 = new Date(jan4);
      startW1.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
      return Math.round((d - startW1) / 604800000) + 1;
    })();

    // Smart hints: count today's substitutions & cancellations
    let smartHints = [];
    // ── Holiday banner takes priority ──────────────────────────────────
    if (isHoliday) {
      const hlLang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
      const nextStart = holidayEnt && holidayEnt.attributes.naechste_ferien_start;
      smartHints.push(`<span class="vp-hint vp-hint-holiday">🏖️ ${holidayName}</span>`);
    } else if (todayIdx >= 0 && weekTable) {
      const todayData = weekTable[dayKeys[todayIdx]] || {};
      let nSub = 0, nCancel = 0, lastEnd = '';
      slots.forEach(slot => {
        if (slot.isPause) return;
        const les = todayData[String(slot.lessonNumber)];
        if (!les) return;
        const rawF = les.fach;
        const isCan = !rawF || rawF === '---' || rawF === '—' || rawF === '-' || (typeof rawF === 'string' && rawF.trim() === '');
        if (isCan) { nCancel++; }
        else if (les.ist_vertretung) { nSub++; }
        if (!isCan && les.fach && slot.time) {
          const p = slot.time.split('-');
          if (p[1]) lastEnd = p[1];
        }
      });
      if (nCancel > 0) smartHints.push(`<span class="vp-hint vp-hint-red">⚠ ${nCancel}× ${t.cancelled}</span>`);
      if (nSub > 0)    smartHints.push(`<span class="vp-hint vp-hint-yellow">🔄 ${nSub}× ${t.sub}</span>`);
      if (lastEnd)     smartHints.push(`<span class="vp-hint vp-hint-blue">🏁 ${t.today}: ${lastEnd}</span>`);
    }
    // Next lesson — show during active lesson OR during pause/free time today
    if (todayIdx >= 0 && weekTable) {
      const todayData = weekTable[dayKeys[todayIdx]] || {};
      const isCancelledFach = (f) => !f || f === '---' || f === '—' || f === '-' || (typeof f === 'string' && f.trim() === '');
      // Find next non-cancelled lesson after now
      const nextSlot = slots.find(s => {
        if (s.isPause || !s.time) return false;
        const parts = s.time.split('-');
        if (parts.length !== 2) return false;
        const [sh, sm] = parts[0].split(':').map(Number);
        const startM = sh * 60 + sm;
        // Must start in the future (or currently active)
        if (startM <= nowMins && s.lessonNumber !== currentLessonNum) return false;
        if (s.lessonNumber <= currentLessonNum && currentLessonNum >= 0) return false;
        const les = todayData[String(s.lessonNumber)];
        return les && les.fach && !isCancelledFach(les.fach);
      });
      if (nextSlot) {
        const nextLes = todayData[String(nextSlot.lessonNumber)];
        if (nextLes && nextLes.fach) {
          const nl = { de:'Nächste', en:'Next', fr:'Prochain' };
          const haLang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
          const nextStr = (nl[haLang] || nl.de);
          smartHints.unshift(`<span class="vp-hint vp-hint-green">▶ ${nextStr}: ${nextLes.fach}${nextSlot.time ? ' · ' + nextSlot.time.split('-')[0] : ''}</span>`);
        }
      }
    }

    this.shadowRoot.innerHTML = `
<style>
:host { display: block; }
ha-card {
  background: #0f1729 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0 !important;
}

/* ══ HEADER ══════════════════════════════════════════════════════════════ */
.vp-hdr {
  display: ${showHeader ? 'flex' : 'none'};
  align-items: center; gap: 10px;
  padding: 13px 16px 10px;
  background: linear-gradient(180deg, rgba(37,99,235,0.12) 0%, rgba(15,23,41,0) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-wrap: wrap;
}
.vp-hdr-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  background: linear-gradient(135deg,#3b82f6,#1d4ed8);
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 1.2em;
  box-shadow: 0 4px 14px rgba(29,78,216,0.5);
}
.vp-hdr-body { flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 2px; }
.vp-hdr-top  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.vp-hdr-title {
  font-size: 1.1em; font-weight: 800; color: #fff;
  letter-spacing: -0.2px; line-height: 1.2;
}
.vp-hdr-class {
  font-size: .72em; font-weight: 700; color: #3b82f6;
  background: rgba(59,130,246,0.13); border: 1px solid rgba(59,130,246,0.25);
  border-radius: 6px; padding: 2px 8px;
}
.vp-hdr-sub {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.vp-hdr-kw {
  font-size: .7em; font-weight: 600; color: #64748b;
}
.vp-hdr-spacer { flex: 1; }
.vp-hdr-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

/* ── Pills ── */
.vp-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px; padding: 5px 12px;
  font-size: 0.73em; font-weight: 600; color: #94a3b8;
  white-space: nowrap; cursor: pointer; font-family: inherit;
  transition: all .18s; line-height: 1.3;
}
.vp-pill:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
.vp-pill-blue  { color: #93c5fd; border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.09); }
.vp-pill-blue:hover  { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #bfdbfe; }
.vp-pill-green { color: #86efac; border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.09); }
.vp-pill-green:hover { background: rgba(34,197,94,0.2); border-color: #22c55e; }
.vp-pill-amber { color: #fcd34d; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.09); }
.vp-pill-amber:hover { background: rgba(245,158,11,0.2); border-color: #f59e0b; }
.vp-pill-amber.has-info { animation: vp-pulse 2.5s ease-in-out infinite; }
@keyframes vp-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50%      { box-shadow: 0 0 0 5px rgba(245,158,11,0); }
}
@keyframes vpm-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes vpm-spin-ccw {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}
.vp-pill-reloading {
  background: rgba(34,197,94,0.25) !important;
  color: #22c55e !important;
  border-color: rgba(34,197,94,0.6) !important;
}
.vp-pill-reloading .vp-reload-icon {
  animation: vpm-spin-ccw 0.8s linear !important;
}

/* ── Smart hints bar ── */
.vp-hints {
  display: flex; gap: 8px; flex-wrap: wrap;
  padding: 7px 16px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  min-height: 0;
}
.vp-hints:empty { display: none; }
.vp-hint {
  font-size: .72em; font-weight: 600; border-radius: 20px;
  padding: 3px 10px; white-space: nowrap;
}
.vp-hint-red    { background: rgba(239,68,68,.12);  color: #fca5a5; border: 1px solid rgba(239,68,68,.2); }
.vp-hint-yellow { background: rgba(234,179,8,.12);  color: #fde68a; border: 1px solid rgba(234,179,8,.2); }
.vp-hint-blue   { background: rgba(59,130,246,.12); color: #93c5fd; border: 1px solid rgba(59,130,246,.2); }
.vp-hint-green  { background: rgba(34,197,94,.12);  color: #86efac; border: 1px solid rgba(34,197,94,.2); }
.vp-hint-holiday { background: rgba(251,191,36,.15); color: #fde68a; border: 1px solid rgba(251,191,36,.35); font-weight: 700; }

/* ══ TABLE ═══════════════════════════════════════════════════════════════ */
.vp-table { width: 100%; border-collapse: separate; border-spacing: 0; padding: 6px 10px 10px; }
.vp-table th {
  padding: 7px 3px; text-align: center;
  font-size: 0.74em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .5px; color: #475569;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: transparent; line-height: 1.3;
}
.vp-th-num { width: 52px; min-width: 52px; }
.vp-th-day  { display: block; font-size: .9em; }
.vp-th-date { display: block; font-size: .82em; color: #334155; font-weight: 500;
              text-transform: none; letter-spacing: 0; margin-top: 1px; }
.vp-today-pill {
  display: inline-flex; flex-direction: column; align-items: center; gap: 1px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff; border-radius: 8px; padding: 4px 10px;
  font-weight: 800; font-size: .82em; text-transform: uppercase; letter-spacing: .5px;
  box-shadow: 0 2px 8px rgba(37,99,235,0.5);
}
.vp-today-date { font-size: .8em; font-weight: 500; opacity: .9; text-transform: none; letter-spacing: 0; }

.vp-table td { padding: 2px 2px; text-align: center; vertical-align: middle; background: transparent; }
.vp-td-num  { width: 52px; min-width: 52px; padding: 3px 4px; }
.vp-snum    { font-size: .84em; font-weight: 700; color: #64748b; line-height: 1.3; }
.vp-stime   { font-size: .62em; color: #334155; margin-top: 1px; white-space: nowrap; }
.vp-today-col td,
.vp-today-col    { background: rgba(37,99,235,0.04) !important; }

/* ── Tiles ── */
.vp-tile {
  border-radius: 9px; padding: 0 4px;
  font-size: .84em; font-weight: 600; color: #e2e8f0;
  height: 48px; min-height: 48px;
  display: flex; align-items: center; justify-content: center;
  transition: filter .12s, transform .12s, box-shadow .12s;
  background: #1a2a50;
  line-height: 1.2; text-align: center;
}
.vp-tile.vp-empty {
  background: rgba(255,255,255,0.025);
  color: transparent;
}
.vp-today-col .vp-tile.vp-empty {
  background: rgba(37,99,235,0.05);
  border: 1px dashed rgba(37,99,235,0.2);
}
.vp-tile.vp-normal     { background: rgba(34,197,94,.1); color: #86efac; border: 1px solid rgba(34,197,94,.2); }
.vp-tile.vp-today-tile { background: #1e3a6e; color: #bfdbfe; }
.vp-tile.vp-sub        { background: rgba(234,179,8,0.18) !important; color: #fde68a !important; border: 1px solid rgba(234,179,8,0.3); font-weight: 700; }
.vp-tile.vp-cancelled  { background: rgba(239,68,68,0.18) !important; color: #fca5a5 !important; border: 1px solid rgba(239,68,68,0.3); font-weight: 700; }
.vp-today-col .vp-tile.vp-normal  { background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.3); }
.vp-today-col .vp-tile.vp-cancelled { background: rgba(239,68,68,0.25) !important; box-shadow: 0 0 0 1px rgba(239,68,68,0.4); }
.vp-tile.vp-current    {
  background: linear-gradient(135deg, #14532d, #166534) !important;
  color: #bbf7d0 !important; font-weight: 800;
  box-shadow: 0 0 0 2px #22c55e, 0 0 16px rgba(34,197,94,0.35) !important;
}
.vp-tile-clickable { cursor: pointer; }
.vp-tile-clickable:hover { filter: brightness(1.18); transform: scale(1.04); }

/* ── Pause row ── */
.vp-pause-tr td { padding: 2px 0; background: transparent !important; }
.vp-pause-cell {
  text-align: center; color: #60a5fa; font-size: .76em;
  padding: 8px 0; font-style: italic; font-weight: 600;
  background: rgba(37,99,235,0.08);
  border-top: 1px solid rgba(37,99,235,0.25);
  border-bottom: 1px solid rgba(37,99,235,0.25);
  letter-spacing: 0.3px;
}

/* ══ LEGEND ══════════════════════════════════════════════════════════════ */
.vp-legend {
  display: flex; gap: 14px; flex-wrap: wrap;
  padding: 7px 16px 12px; font-size: .75em;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.vp-legend-item { display: flex; align-items: center; gap: 5px; color: #64748b; }
.vp-ldot { width: 8px; height: 8px; border-radius: 50%; }
.vp-ldot-today   { background: #3b82f6; }
.vp-ldot-sub     { background: #eab308; }
.vp-ldot-cancel  { background: #ef4444; }
.vp-ldot-current { background: #22c55e; box-shadow: 0 0 5px rgba(34,197,94,.6); }
.vp-lbl-today   { color: #60a5fa;  font-weight: 600; }
.vp-lbl-sub     { color: #fde68a;  font-weight: 600; }
.vp-lbl-cancel  { color: #fca5a5;  font-weight: 600; }
.vp-lbl-current { color: #86efac;  font-weight: 600; }

/* ══ MOBILE ══════════════════════════════════════════════════════════════ */
.vp-desktop { display: block; }
.vp-mobile  { display: none;  }
@media (max-width: 600px) {
  .vp-desktop { display: none;  }
  .vp-mobile  { display: block; }
}

/* Day tabs */
.vp-mob-tabs {
  display: flex; gap: 3px; padding: 8px 10px 5px;
}
.vp-mob-tab {
  flex: 1; border: none; border-radius: 9px;
  background: rgba(255,255,255,.05); color: #475569;
  font-size: .72em; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all .15s;
  text-transform: uppercase; letter-spacing: .3px;
  display: flex; flex-direction: column; align-items: center;
  gap: 1px; padding: 7px 3px;
}
.vp-mob-tab:hover { background: rgba(255,255,255,.09); color: #94a3b8; }
.vp-mob-tab-active { background: linear-gradient(135deg,#2563eb,#1d4ed8) !important; color: #fff !important; box-shadow: 0 2px 8px rgba(37,99,235,.4); }
.vp-mob-tab-day  { font-size: .85em; font-weight: 800; line-height: 1.2; }
.vp-mob-tab-date { font-size: .7em;  font-weight: 500; opacity: .8; line-height: 1.2; }

/* Mobile lesson rows */
.vp-mob-lesson {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; border-bottom: 1px solid rgba(255,255,255,.04);
  transition: background .12s;
}
.vp-mob-lesson:last-child { border-bottom: none; }
.vp-mob-sub       { background: rgba(234,179,8,.1);  border-left: 3px solid #eab308; }
.vp-mob-cancelled { background: rgba(239,68,68,.1);  border-left: 3px solid #ef4444; }
.vp-mob-current   { background: rgba(20,83,45,.3);   border-left: 3px solid #22c55e; }
.vp-mob-empty     { opacity: .4; }
.vp-mob-left { display: flex; flex-direction: column; align-items: center; min-width: 42px; }
.vp-mob-left-current .vp-mob-num  { color: #86efac !important; }
.vp-mob-left-current .vp-mob-time { color: #4ade80 !important; }
.vp-mob-num  { font-size: .88em; font-weight: 800; color: #64748b; line-height: 1.2; }
.vp-mob-time { font-size: .6em;  color: #334155; margin-top: 1px; white-space: nowrap; }
.vp-mob-subj {
  flex: 1; font-size: .92em; font-weight: 600; color: #e2e8f0;
  background: #1a2a50; border-radius: 8px;
  padding: 8px 12px; text-align: center; line-height: 1.3;
}
.vp-mob-subj-sub      { background: rgba(234,179,8,.18) !important; color: #fde68a !important; }
.vp-mob-subj-cancelled{ background: rgba(239,68,68,.18) !important; color: #fca5a5 !important; font-weight: 700; }
.vp-mob-subj-current  { background: linear-gradient(135deg,#14532d,#166534) !important; color: #bbf7d0 !important; font-weight: 800; box-shadow: 0 0 0 2px #22c55e; }
.vp-mob-subj-empty    { background: rgba(255,255,255,.03) !important; color: #334155 !important; }
.vp-mob-pause-row {
  text-align: center; padding: 7px 14px;
  border-top: 1px solid rgba(37,99,235,0.25);
  border-bottom: 1px solid rgba(37,99,235,0.25);
  background: rgba(37,99,235,0.07);
  color: #60a5fa; font-size: .74em; font-style: italic; font-weight: 600;
}
.vp-mob-clickable { cursor: pointer; }
.vp-mob-clickable:hover { filter: brightness(1.1); }

/* ══ POPUPS ══════════════════════════════════════════════════════════════ */
.vp-popup-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  z-index: 9998; backdrop-filter: blur(3px);
}
.vp-popup {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: #131f38; border-radius: 16px;
  box-shadow: 0 16px 56px rgba(0,0,0,.75);
  max-width: 420px; width: 94%; z-index: 9999;
  border: 1px solid rgba(255,255,255,.1); color: #e2e8f0; overflow: hidden;
  max-height: 85vh; display: flex; flex-direction: column;
}
.vp-popup-title {
  font-size: 1em; font-weight: 700; color: #fff;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.vp-detail-num    { font-size: .75em; font-weight: 700; color: #94a3b8; background: rgba(255,255,255,.07); padding: 3px 8px; border-radius: 5px; }
.vp-detail-fach   { font-size: 1.1em; font-weight: 800; color: #fff; }
.vp-detail-badge  { font-size: .68em; font-weight: 700; padding: 3px 8px; border-radius: 5px; }
.vp-detail-sub    { background: rgba(234,179,8,.2);  color: #fde68a; border: 1px solid rgba(234,179,8,.3); }
.vp-detail-cancelled { background: rgba(239,68,68,.15); color: #fca5a5; border: 1px solid rgba(239,68,68,.25); }
.vp-detail-row    { display: flex; align-items: center; gap: 12px; padding: 13px 20px; border-bottom: 1px solid rgba(255,255,255,.05); }
.vp-detail-row:last-child { border-bottom: none; }
.vp-detail-info-row { background: rgba(245,158,11,.06); }
.vp-detail-icon   { font-size: 1.1em; width: 24px; text-align: center; flex-shrink: 0; }
.vp-detail-label  { font-size: .75em; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .5px; min-width: 52px; }
.vp-detail-val    { font-size: .92em; font-weight: 500; color: #e2e8f0; flex: 1; }
.vp-detail-empty  { padding: 16px 20px; color: #475569; font-size: .85em; font-style: italic; }
.vp-popup-footer  { padding: 12px 20px 16px; text-align: right; border-top: 1px solid rgba(255,255,255,.06); }
.vp-popup-btn     { background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 9px 22px; cursor: pointer; font-size: .88em; font-family: inherit; transition: background .18s; }
.vp-popup-btn:hover { background: #1d4ed8; }
/* Ausfall popup */
.vp-popup-ausfall {
  background: linear-gradient(135deg,#7f1d1d,#991b1b) !important;
  border-color: rgba(239,68,68,0.5) !important;
  box-shadow: 0 0 0 1px rgba(239,68,68,.3), 0 16px 56px rgba(239,68,68,.45), 0 0 80px rgba(239,68,68,.2) !important;
  display: flex !important; flex-direction: column !important; min-height: 220px;
}
.vp-popup-ausfall .vp-popup-title { display: none !important; }
.vp-popup-ausfall #popup-content  { flex: 1; display: flex; align-items: center; justify-content: center; }
.vp-popup-ausfall .vp-popup-footer { border-top: none !important; padding: 0 20px 20px; }
.vp-ausfall-block {
  color: #fca5a5; font-size: 2.6em; font-weight: 900;
  letter-spacing: 5px; text-align: center; padding: 20px;
  text-shadow: 0 0 30px rgba(255,100,100,1), 0 0 60px rgba(255,50,50,0.7);
}
/* Info popup */
.vp-info-popup-title {
  padding: 16px 20px 12px; font-size: 1em; font-weight: 700; color: #fcd34d;
  border-bottom: 1px solid rgba(245,158,11,.2);
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
#info-popup-content { overflow-y: auto; flex: 1; }
.vp-info-section { padding: 10px 16px 4px; }
.vp-info-section-label {
  font-size: .65em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .8px; color: #64748b; margin-bottom: 6px;
  display: flex; align-items: center; gap: 5px;
}
.vp-info-entry {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 7px 10px; margin-bottom: 4px;
  background: rgba(255,255,255,.04); border-radius: 8px;
  border-left: 3px solid rgba(245,158,11,.4);
  font-size: .88em; color: #e2e8f0; line-height: 1.4;
}
.vp-info-entry::before { content: '•'; color: #f59e0b; flex-shrink: 0; margin-top: 1px; }
.vp-info-none {
  padding: 24px 20px; color: #475569;
  font-size: .85em; font-style: italic; text-align: center;
}
.vp-info-section { padding: 12px 20px 4px; }
.vp-info-section-label { font-size: .7em; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #64748b; margin-bottom: 8px; }
.vp-info-entry {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 9px 12px; margin-bottom: 6px;
  background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.15);
  border-radius: 8px; font-size: .86em; color: #e2e8f0; line-height: 1.5;
}
.vp-info-none { padding: 16px 20px; color: #475569; font-size: .86em; font-style: italic; }
.hidden { display: none !important; }
</style>
<ha-card>

  <!-- ── Header ── -->
  <div class="vp-hdr">
    <div class="vp-hdr-icon">📅</div>
    <div class="vp-hdr-body">
      <div class="vp-hdr-top">
        <span class="vp-hdr-title">${title}</span>
        ${className ? `<span class="vp-hdr-class">${t.classLabel} ${className}</span>` : ''}
      </div>
      <div class="vp-hdr-sub">
        <span class="vp-hdr-kw">KW ${kwNum} · ${weekOffset === 0 ? t.today.replace('Heute','') || 'Aktuell' : weekOffset === 1 ? t.nextWeek.replace(' →','') : t.nextWeek.replace(' →','') + '+'}</span>
      </div>
    </div>
    <div class="vp-hdr-spacer"></div>
    <div class="vp-hdr-actions">
      ${infoBtn && weekOffset === 0
        ? `<button class="vp-pill vp-pill-amber${infoBtnHasInfo ? ' has-info' : ''}" data-vpm="info" title="${t.infoTitle}">ⓘ Info</button>`
        : ''}
      ${weekOffset === 0
        ? `<button class="vp-pill vp-pill-blue" data-vpm="next-week">${t.nextWeek}</button>`
        : `<button class="vp-pill vp-pill-green" data-vpm="cur-week">${t.currentWeek}</button>`}
      ${reloadEntity
        ? `<button class="vp-pill${this._reloading ? ' vp-pill-reloading' : ''}" data-vpm="reload"><span class="vp-reload-icon" style="display:inline-block">↺</span></button>`
        : ''}
    </div>
  </div>

  <!-- ── Smart hints bar ── -->
  <div class="vp-hints">${smartHints.join('')}</div>

  <!-- ── Table (desktop) / Tabs (mobile) ── -->
  <div class="vp-desktop">${tableHtml}</div>
  <div class="vp-mobile">${mobileHtml}</div>

  <!-- ── Legend ── -->
  <div class="vp-legend">
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-today"></span><span class="vp-lbl-today">${t.today}</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-sub"></span><span class="vp-lbl-sub">${t.sub}</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-cancel"></span><span class="vp-lbl-cancel">${t.cancelled}</span></div>
    <div class="vp-legend-item"><span class="vp-ldot vp-ldot-current"></span><span class="vp-lbl-current">${t.now}</span></div>
  </div>

</ha-card>

<!-- ── Lesson detail popup ── -->
<div id="popup-overlay" class="vp-popup-overlay hidden"></div>
<div id="popup" class="vp-popup hidden">
  <div id="popup-title" class="vp-popup-title">Details</div>
  <div id="popup-content"></div>
  <div class="vp-popup-footer"><button class="vp-popup-btn" data-vpm="close">${t.close}</button></div>
</div>

<!-- ── Info popup ── -->
<div id="info-popup-overlay" class="vp-popup-overlay hidden"></div>
<div id="info-popup" class="vp-popup hidden">
  <div class="vp-info-popup-title">${t.infoTitle}</div>
  <div id="info-popup-content"></div>
  <div class="vp-popup-footer"><button class="vp-popup-btn" data-vpm="close-info">${t.close}</button></div>
</div>`;

    // ── Restore popup if it was open before this render ──────────────────
    // NOTE: popup state is managed separately via _popupOpen/_popupData
    // _render() never restores popups — user must re-click to open them
  }
}

customElements.define('vpmobile24-card', VpMobile24Card);
window.customCards = window.customCards || [];
window.customCards.push({ type:'vpmobile24-card', name:'VpMobile24 Card', description:'Wochenstundenplan', preview:true });

// ── VpMobile24 Current Lesson Card v2.5.1 ────────────────────────────────
class VpMobile24CurrentCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._timer  = null;
  }

  static getStubConfig() {
    return {
      entity:       'sensor.vpmobile24_aktueller_unterricht',
      next_entity:  'sensor.vpmobile24_naechste_stunde',
      week_entity:  'sensor.vpmobile24_wochentabelle',
      title:        '',
      show_progress:   true,
      show_countdown:  true,
      show_next:       true,
      show_teacher:    true,
      show_room:       true,
      show_day_info:   true,
    };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity',      required: true,  selector: { entity: { filter: [{ integration: 'vpmobile24' }] } } },
        { name: 'next_entity', required: false, selector: { entity: { filter: [{ integration: 'vpmobile24' }] } } },
        { name: 'week_entity', required: false, selector: { entity: { filter: [{ integration: 'vpmobile24' }] } } },
        { name: 'title',       default: 'Aktueller Unterricht', selector: { text: { type: 'text' } } },
        { name: 'show_progress',  default: true, selector: { boolean: {} } },
        { name: 'show_countdown', default: true, selector: { boolean: {} } },
        { name: 'show_next',      default: true, selector: { boolean: {} } },
        { name: 'show_teacher',   default: true, selector: { boolean: {} } },
        { name: 'show_room',      default: true, selector: { boolean: {} } },
        { name: 'show_day_info',  default: true, selector: { boolean: {} } },
      ],
      computeLabel: (s) => {
        const lang = document.querySelector('home-assistant')?._hass?.language?.substring(0,2) || 'de';
        const L = {
          de: { entity:'Aktueller-Unterricht-Sensor', next_entity:'Nächste-Stunde-Sensor',
                week_entity:'Stundenplan-Sensor (für Tagesinfos)', title:'Kartentitel',
                show_progress:'Fortschrittsbalken', show_countdown:'Countdown',
                show_next:'Nächste Stunde', show_teacher:'Lehrer', show_room:'Raum', show_day_info:'Tagesinfos' },
          en: { entity:'Current Lesson Sensor', next_entity:'Next Lesson Sensor',
                week_entity:'Schedule Sensor (for daily info)', title:'Card title',
                show_progress:'Progress bar', show_countdown:'Countdown',
                show_next:'Next lesson', show_teacher:'Teacher', show_room:'Room', show_day_info:'Daily info' },
          fr: { entity:'Capteur cours actuel', next_entity:'Capteur prochain cours',
                week_entity:'Capteur planning (infos du jour)', title:'Titre de la carte',
                show_progress:'Barre de progression', show_countdown:'Compte à rebours',
                show_next:'Prochain cours', show_teacher:'Professeur', show_room:'Salle', show_day_info:'Infos du jour' },
        };
        return (L[lang] || L.de)[s.name] || s.name;
      },
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
    // Auto-update every minute for countdown/progress
    if (!this._timer) {
      this._timer = setInterval(() => { if (this._hass && this._config) this._render(); }, 30000);
    }
  }

  disconnectedCallback() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  getCardSize() { return 3; }

  // ── Time helpers ─────────────────────────────────────────────────────────
  _parseMins(str) {
    if (!str || !str.includes(':')) return null;
    const [h, m] = str.split(':').map(Number);
    return isNaN(h) || isNaN(m) ? null : h * 60 + m;
  }

  _nowMins() {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;
  }

  // ── Translations for CurrentCard ─────────────────────────────────────────
  _getT() {
    const lang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
    const l = ['de','en','fr'].includes(lang) ? lang : 'de';
    return {
      de: {
        currentLesson: 'Aktueller Unterricht', sub: 'Vertretung',
        freePause: 'Freistunde / Pause', beforeSchool: 'Noch kein Unterricht', done: 'Unterricht beendet',
        holiday: 'Schulferien',
        period: 'Stunde', nextLesson: 'Nächste Stunde',
        remaining: 'Noch', startsIn: 'Beginnt in',
        endedAt: 'Unterricht endete um', noLesson: 'Kein Unterricht mehr heute',
        soon: 'Gleich', min: 'Min.', lessons: 'Stunden',
        remaining2: 'verbleibend', cancel: 'Ausfall heute',
        subst: 'Vertretung heute', endAt: 'Ende', next: 'Nächste',
      },
      en: {
        currentLesson: 'Current Lesson', sub: 'Substitution',
        freePause: 'Free Period / Break', beforeSchool: 'No lessons yet', done: 'School ended',
        holiday: 'School Holidays',
        period: 'Period', nextLesson: 'Next Lesson',
        remaining: 'Remaining', startsIn: 'Starts in',
        endedAt: 'School ended at', noLesson: 'No more lessons today',
        soon: 'Soon', min: 'min.', lessons: 'lessons',
        remaining2: 'remaining', cancel: 'cancellation today',
        subst: 'substitution today', endAt: 'End', next: 'Next',
      },
      fr: {
        currentLesson: 'Cours actuel', sub: 'Remplacement',
        freePause: 'Heure libre / Pause', beforeSchool: 'Pas encore de cours', done: 'Cours terminé',
        holiday: 'Vacances scolaires',
        period: 'Heure', nextLesson: 'Prochain cours',
        remaining: 'Reste', startsIn: 'Commence dans',
        endedAt: 'Cours terminé à', noLesson: 'Plus de cours aujourd\'hui',
        soon: 'Bientôt', min: 'min.', lessons: 'heures',
        remaining2: 'restantes', cancel: 'annulation aujourd\'hui',
        subst: 'remplacement aujourd\'hui', endAt: 'Fin', next: 'Prochain',
      },
    }[l];
  }

  _fmtCountdown(mins, tc) {
    const m = Math.max(0, Math.round(mins));
    if (m === 0) return tc.soon;
    if (m < 60)  return m + ' ' + tc.min;
    return Math.floor(m / 60) + 'h ' + (m % 60) + 'min';
  }

  _progress(startMins, endMins, nowMins) {
    if (startMins === null || endMins === null) return 0;
    const total = endMins - startMins;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((nowMins - startMins) / total) * 100));
  }

  // ── Status detection ──────────────────────────────────────────────────────
  _getStatus(entity, nextEntity, weekEntity) {
    const now    = this._nowMins();
    const attr   = entity ? entity.attributes : {};
    const state  = entity ? (entity.state || '') : '';

    const fachSensor    = attr.fach        || '';
    const zeitStart = attr.zeit_start  || '';
    const zeitEnd   = attr.zeit_ende   || '';
    const zeit      = attr.zeit        || '';
    const lehrer    = attr.lehrer      || '';
    const raum      = attr.raum        || '';
    const stunde    = attr.stunde      || '';
    const isAusfall = attr.ist_ausfall || false;
    const isSub     = attr.ist_vertretung || false;
    const info      = attr.zusatzinfo  || '';

    const startMinsSensor = this._parseMins(zeitStart) ?? this._parseMins(zeit ? zeit.split('-')[0] : '');
    const endMinsSensor   = this._parseMins(zeitEnd)   ?? this._parseMins(zeit ? zeit.split('-')[1] : '');

    // ── Build lesson list from week_entity for live time-based detection ──
    let stundenHeute = [];
    let gesamt = 0, verbleibend = 0, unterrichtsEnde = '', nVertretung = 0;
    if (weekEntity && weekEntity.attributes) {
      const wa = weekEntity.attributes;
      stundenHeute = (wa.stunden_heute || []).filter(s => {
        const f = (s.fach || '').trim();
        return f && f !== '---' && f !== '—' && f !== '-' && !/^[-—–\s]+$/.test(f);
      });
      stundenHeute.forEach(s => {
        gesamt++;
        if (s.ist_vertretung) nVertretung++;
        const endT = (s.zeit || '').split('-')[1] || '';
        if (endT) {
          const endM = this._parseMins(endT);
          if (endM !== null && (!unterrichtsEnde || endM > this._parseMins(unterrichtsEnde))) unterrichtsEnde = endT;
          if (endM !== null && now <= endM) verbleibend++;
        } else if (!s.ist_vorbei) { verbleibend++; }
      });
    }

    // ── Find current lesson from stunden_heute by time ────────────────────
    let currentFromSchedule = null;
    let nextFromSchedule    = null;
    for (const s of stundenHeute) {
      const parts = (s.zeit || '').split('-');
      if (parts.length !== 2) continue;
      const st = this._parseMins(parts[0]);
      const en = this._parseMins(parts[1]);
      if (st === null || en === null) continue;
      if (now >= st && now <= en) {
        currentFromSchedule = { ...s, startMins: st, endMins: en };
      } else if (now < st && !nextFromSchedule) {
        // Skip cancelled lessons as "next lesson"
        if (!s.ist_ausfall && !s.ist_entfall) {
          nextFromSchedule = { ...s, startMins: st, endMins: en };
        }
      }
    }

    // ── Determine fach/details — prefer sensor if active, else use schedule ─
    let fach = fachSensor, startMins = startMinsSensor, endMins = endMinsSensor;
    let lessonSub = isSub, lessonInfo = info, lessonLehrer = lehrer, lessonRaum = raum, lessonStunde = stunde;

    if (currentFromSchedule && (!fach || isAusfall || now > (endMinsSensor ?? -1))) {
      // Sensor is stale — use schedule data
      fach         = currentFromSchedule.fach || '';
      startMins    = currentFromSchedule.startMins;
      endMins      = currentFromSchedule.endMins;
      lessonSub    = !!currentFromSchedule.ist_vertretung;
      lessonInfo   = currentFromSchedule.zusatzinfo || '';
      lessonLehrer = currentFromSchedule.lehrer || '';
      lessonRaum   = currentFromSchedule.raum   || '';
      lessonStunde = currentFromSchedule.stunde  || '';
    }

    // Next lesson — from nextEntity sensor (only if not cancelled) OR from schedule
    const nextEntityValid = nextEntity && nextEntity.attributes.fach && !nextEntity.attributes.ist_ausfall;
    let nextFach   = (nextEntityValid ? nextEntity.attributes.fach   : '') || (nextFromSchedule ? nextFromSchedule.fach   : '');
    let nextZeit   = (nextEntityValid ? nextEntity.attributes.zeit   : '') || (nextFromSchedule ? nextFromSchedule.zeit   : '');
    let nextLehrer = (nextEntityValid ? nextEntity.attributes.lehrer : '') || (nextFromSchedule ? nextFromSchedule.lehrer : '');
    let nextRaum   = (nextEntityValid ? nextEntity.attributes.raum   : '') || (nextFromSchedule ? nextFromSchedule.raum   : '');
    let nextStart  = this._parseMins(nextZeit ? nextZeit.split('-')[0] : '');

    // Determine current state
    const hasCurrentLesson = fach && !isAusfall && startMins !== null && endMins !== null && now >= startMins && now <= endMins;
    // If currentFromSchedule is a cancellation, treat as free period
    const scheduleIsCancelled = currentFromSchedule && (currentFromSchedule.ist_ausfall || currentFromSchedule.ist_entfall);

    if (hasCurrentLesson || (currentFromSchedule && !scheduleIsCancelled)) {
      const useFach = hasCurrentLesson ? fach : (currentFromSchedule ? currentFromSchedule.fach : '');
      const sm = hasCurrentLesson ? startMins : currentFromSchedule.startMins;
      const em = hasCurrentLesson ? endMins   : currentFromSchedule.endMins;
      const useType = (hasCurrentLesson ? lessonSub : !!currentFromSchedule.ist_vertretung) ? 'sub' : 'lesson';
      return {
        type: useType,
        fach: useFach, lehrer: lessonLehrer, raum: lessonRaum,
        stunde: lessonStunde, zeit: (hasCurrentLesson ? zeit : (currentFromSchedule.zeit || '')),
        info: lessonInfo, isSub: hasCurrentLesson ? lessonSub : !!currentFromSchedule.ist_vertretung,
        startMins: sm, endMins: em,
        progress: this._progress(sm, em, now),
        remaining: em - now,
        nextFach, nextZeit, nextLehrer, nextRaum, nextStart,
        gesamt, verbleibend, unterrichtsEnde, nVertretung,
      };
    }

    // No lesson running → check next lesson
    if (nextFach && nextStart !== null && now < nextStart) {
      return {
        type: 'free',
        nextFach, nextZeit, nextLehrer, nextRaum, nextStart,
        remaining: nextStart - now,
        gesamt, verbleibend, unterrichtsEnde, nVertretung,
        fach: '', lehrer: '', raum: '', stunde: '', zeit: '', info: '',
      };
    }

    // End of day
    return {
      type: 'done',
      unterrichtsEnde, gesamt, nVertretung,
      fach: '', lehrer: '', raum: '', stunde: '', zeit: '', info: '',
      nextFach, nextZeit,
    };
  }

  // ── Render ────────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass || !this._config) return;

    const entity     = this._hass.states[this._config.entity];
    const nextEntity = this._config.next_entity    ? this._hass.states[this._config.next_entity]    : null;
    const weekEntity = this._config.week_entity    ? this._hass.states[this._config.week_entity]    : null;
    // Auto-detect holiday entity from entity ID pattern, or use explicit config
    const holidayEntityId = this._config.holiday_entity
      || (this._config.entity ? this._config.entity.replace(/_aktueller_unterricht$/, '_ferien').replace(/_week_table$/, '_ferien') : null);
    const holidayEnt = holidayEntityId ? this._hass.states[holidayEntityId] : null;
    const isHoliday  = !!(holidayEnt && holidayEnt.attributes && holidayEnt.attributes.ist_ferien);
    const holidayName = isHoliday ? (holidayEnt.state || 'Ferien') : '';

    const tc         = this._getT();
    const rawTitle   = this._config.title || '';
    const title      = (rawTitle === '' || rawTitle === 'Aktueller Unterricht' || rawTitle === 'Current Lesson' || rawTitle === 'Cours actuel')
      ? tc.currentLesson
      : rawTitle;
    const showProg   = this._config.show_progress  !== false;
    const showCount  = this._config.show_countdown !== false;
    const showNext   = this._config.show_next      !== false;
    const showTeach  = this._config.show_teacher   !== false;
    const showRoom   = this._config.show_room      !== false;
    const showDay    = this._config.show_day_info  !== false;

    const s = this._getStatus(entity, nextEntity, weekEntity);

    // ── Colors & icons per type ───────────────────────────────────────────
    // Determine if 'free' is actually before school (>60min until first lesson)
    const isBeforeSchool = s.type === 'free' && s.remaining !== undefined && s.remaining > 60;
    const themes = {
      lesson:  { color:'#22c55e', bg:'rgba(34,197,94,.13)',  border:'rgba(34,197,94,.35)',  icon:'📖', label: tc.currentLesson },
      sub:     { color:'#f97316', bg:'rgba(249,115,22,.13)', border:'rgba(249,115,22,.35)', icon:'🔄', label: tc.sub },
      free:    { color: isBeforeSchool ? '#64748b' : '#3b82f6',
                 bg:    isBeforeSchool ? 'rgba(100,116,139,.1)' : 'rgba(59,130,246,.13)',
                 border:isBeforeSchool ? 'rgba(100,116,139,.25)' : 'rgba(59,130,246,.35)',
                 icon:  isBeforeSchool ? '🌙' : '⏸',
                 label: isBeforeSchool ? tc.beforeSchool : tc.freePause },
      done:    { color:'#64748b', bg:'rgba(100,116,139,.1)', border:'rgba(100,116,139,.25)',icon:'🏁', label: tc.done },
      holiday: { color:'#f59e0b', bg:'rgba(245,158,11,.13)', border:'rgba(245,158,11,.35)', icon:'🏖️', label: tc.holiday || 'Ferien' },
    };
    const effectiveType = isHoliday ? 'holiday' : s.type;
    const th = themes[effectiveType] || themes.done;

    // ── Main content ──────────────────────────────────────────────────────
    let mainHtml = '';

    if (isHoliday) {
      mainHtml += `<div class="vc-subject">${holidayName}</div>`;
      const nextHolStart = holidayEnt && holidayEnt.attributes.naechste_ferien_start;
      const nextHolName  = holidayEnt && holidayEnt.attributes.naechste_ferien_name;
      if (nextHolStart) {
        const d = new Date(nextHolStart);
        const haLang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
        const endAttr = holidayEnt.attributes.end;
        if (endAttr) {
          const endD = new Date(endAttr);
          const endStr = endD.toLocaleDateString(haLang === 'en' ? 'en-GB' : haLang === 'fr' ? 'fr-FR' : 'de-DE', {day:'2-digit',month:'2-digit'});
          mainHtml += `<div class="vc-meta"><span class="vc-chip">📅 ${haLang === 'en' ? 'Until' : haLang === 'fr' ? 'Jusqu\'au' : 'Bis'} ${endStr}</span></div>`;
        }
      }
    } else if (s.type === 'lesson' || s.type === 'sub') {
      mainHtml += `<div class="vc-subject">${s.fach}</div>`;
      mainHtml += `<div class="vc-meta">`;
      if (s.stunde) mainHtml += `<span class="vc-chip">${s.stunde}. ${tc.period}</span>`;
      if (s.zeit)   mainHtml += `<span class="vc-chip">🕐 ${s.zeit}</span>`;
      if (showTeach && s.lehrer) mainHtml += `<span class="vc-chip">👤 ${s.lehrer}</span>`;
      if (showRoom  && s.raum)   mainHtml += `<span class="vc-chip">🚪 ${s.raum}</span>`;
      mainHtml += `</div>`;
      if (s.info) mainHtml += `<div class="vc-info">ℹ️ ${s.info}</div>`;
      if (showCount && s.remaining !== undefined) {
        mainHtml += `<div class="vc-countdown">${tc.remaining} <strong>${this._fmtCountdown(s.remaining, tc)}</strong></div>`;
      }
      if (showProg && s.progress !== undefined) {
        mainHtml += `<div class="vc-progress-wrap">
          <div class="vc-progress-bar" style="width:${s.progress.toFixed(1)}%;background:${th.color}"></div>
          <span class="vc-progress-pct">${Math.round(s.progress)}%</span>
        </div>`;
      }
    } else if (s.type === 'free') {
      if (s.nextFach) {
        mainHtml += `<div class="vc-subject" style="font-size:1em;opacity:.7">${tc.nextLesson}</div>`;
        mainHtml += `<div class="vc-subject">${s.nextFach}</div>`;
        mainHtml += `<div class="vc-meta">`;
        if (s.nextZeit)   mainHtml += `<span class="vc-chip">🕐 ${s.nextZeit}</span>`;
        if (showTeach && s.nextLehrer) mainHtml += `<span class="vc-chip">👤 ${s.nextLehrer}</span>`;
        if (showRoom  && s.nextRaum)   mainHtml += `<span class="vc-chip">🚪 ${s.nextRaum}</span>`;
        mainHtml += `</div>`;
      }
      if (showCount && s.remaining !== undefined) {
        mainHtml += `<div class="vc-countdown">${tc.startsIn} <strong>${this._fmtCountdown(s.remaining, tc)}</strong></div>`;
      }
      if (showProg && s.nextStart !== undefined) {
        const now = this._nowMins();
        // Estimate break start from current time - 5min as fallback
        const breakProg = s.remaining <= 20 ? this._progress(now - (20 - s.remaining), s.nextStart, now) : 0;
        mainHtml += `<div class="vc-progress-wrap">
          <div class="vc-progress-bar" style="width:${breakProg.toFixed(1)}%;background:${th.color}"></div>
        </div>`;
      }
    } else {
      // Done
      if (s.unterrichtsEnde) {
        mainHtml += `<div class="vc-subject" style="font-size:1em">${tc.endedAt} ${s.unterrichtsEnde}</div>`;
      } else {
        mainHtml += `<div class="vc-subject" style="font-size:1em;opacity:.6">${tc.noLesson}</div>`;
      }
    }

    // ── Next lesson block ─────────────────────────────────────────────────
    let nextHtml = '';
    if (showNext && (s.type === 'lesson' || s.type === 'sub') && s.nextFach) {
      nextHtml = `<div class="vc-next">
        <span class="vc-next-label">${tc.next}</span>
        <span class="vc-next-fach">${s.nextFach}</span>
        ${s.nextZeit ? `<span class="vc-next-time">${s.nextZeit.split('-')[0]}</span>` : ''}
        ${showRoom && s.nextRaum ? `<span class="vc-chip" style="font-size:.68em">🚪 ${s.nextRaum}</span>` : ''}
      </div>`;
    }

    // ── Day info ──────────────────────────────────────────────────────────
    let dayHtml = '';
    if (showDay && (s.gesamt || s.nVertretung || s.unterrichtsEnde)) {
      dayHtml = `<div class="vc-day">`;
      if (s.gesamt)        dayHtml += `<span class="vc-chip vc-chip-sm">📚 ${s.gesamt} ${tc.lessons}</span>`;
      if (s.verbleibend)   dayHtml += `<span class="vc-chip vc-chip-sm">⏳ ${s.verbleibend} ${tc.remaining2}</span>`;
      if (s.nVertretung)   dayHtml += `<span class="vc-chip vc-chip-sm" style="color:#f97316">🔄 ${s.nVertretung}× ${tc.subst}</span>`;
      if (s.unterrichtsEnde) dayHtml += `<span class="vc-chip vc-chip-sm">🏁 ${tc.endAt} ${s.unterrichtsEnde}</span>`;
      dayHtml += `</div>`;
    }

    this.shadowRoot.innerHTML = `
<style>
:host { display: block; }
ha-card {
  background: #0f1729 !important;
  border-radius: 16px !important;
  overflow: hidden;
  border: 1px solid ${th.border} !important;
  box-shadow: 0 4px 24px rgba(0,0,0,.5), 0 0 0 1px ${th.border} !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0 !important;
  transition: border-color .4s, box-shadow .4s;
}
.vc-main {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px 12px;
  background: ${th.bg};
  border-left: 4px solid ${th.color};
  min-height: 80px;
}
.vc-icon {
  font-size: 2em; flex-shrink: 0;
  filter: drop-shadow(0 0 6px ${th.color}88);
  animation: ${s.type === 'lesson' || s.type === 'sub' ? 'vc-pulse-icon 3s ease-in-out infinite' : 'none'};
}
@keyframes vc-pulse-icon {
  0%,100% { filter: drop-shadow(0 0 4px ${th.color}88); }
  50%      { filter: drop-shadow(0 0 12px ${th.color}cc); }
}
.vc-body { flex: 1; min-width: 0; }
.vc-label {
  font-size: .68em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .8px; color: ${th.color}; margin-bottom: 4px;
  display: flex; align-items: center; gap: 6px;
}
.vc-title-badge {
  font-size: .7em; font-weight: 600; background: rgba(255,255,255,.08);
  border-radius: 12px; padding: 1px 8px; color: #94a3b8;
}
.vc-subject {
  font-size: 1.45em; font-weight: 800; color: #fff;
  line-height: 1.2; margin-bottom: 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.vc-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.vc-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: .72em; font-weight: 600; color: #94a3b8;
  background: rgba(255,255,255,.07); border-radius: 20px; padding: 2px 9px;
  border: 1px solid rgba(255,255,255,.08);
}
.vc-chip-sm { font-size: .68em; padding: 2px 7px; }
.vc-info { font-size: .75em; color: #f59e0b; margin-bottom: 5px; }
.vc-countdown {
  font-size: .82em; color: #94a3b8; margin-top: 2px;
}
.vc-countdown strong { color: ${th.color}; }
/* Progress bar */
.vc-progress-wrap {
  margin-top: 10px; height: 5px;
  background: rgba(255,255,255,.08); border-radius: 10px;
  overflow: hidden; position: relative;
}
.vc-progress-bar {
  height: 100%; border-radius: 10px;
  transition: width .8s ease;
  box-shadow: 0 0 8px ${th.color}88;
}
.vc-progress-pct {
  position: absolute; right: 0; top: -16px;
  font-size: .65em; color: ${th.color}; font-weight: 700;
}
/* Next lesson */
.vc-next {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 18px;
  background: rgba(255,255,255,.03);
  border-top: 1px solid rgba(255,255,255,.05);
  font-size: .78em;
}
.vc-next-label { font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
.vc-next-fach  { font-weight: 700; color: #e2e8f0; }
.vc-next-time  { color: ${th.color}; font-weight: 600; }
/* Day info */
.vc-day {
  display: flex; gap: 6px; flex-wrap: wrap;
  padding: 8px 18px 12px;
  border-top: 1px solid rgba(255,255,255,.04);
}
</style>
<ha-card>
  <div class="vc-main">
    <div class="vc-icon">${th.icon}</div>
    <div class="vc-body">
      <div class="vc-label">
        ${th.label}
        <span class="vc-title-badge">${title}</span>
      </div>
      ${mainHtml}
    </div>
  </div>
  ${nextHtml}
  ${dayHtml}
</ha-card>`;
  }
}

customElements.define('vpmobile24-current-card', VpMobile24CurrentCard);
window.customCards.push({ type:'vpmobile24-current-card', name:'VpMobile24 Aktueller Unterricht', description:'Zeigt den aktuell laufenden Unterricht', preview:true });

// ── VpMobile24 Multi-Class Card v2.5.1 ───────────────────────────────────
class VpMobile24MultiCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config   = {};
    this._hass     = null;
    this._weekOffset = 0;
    this._search   = '';
    this._collapsed = {};
    this._detail   = null;
    // CSP-safe: single persistent listener
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.id === 'mc-overlay') { this._closeDetail(); return; }      const t = e.target.closest('[data-mc]');
      if (!t) return;
      e.stopPropagation();
      const act = t.dataset.mc;
      if (act === 'close-detail') { this._closeDetail(); return; }
      if (act === 'next-week')    { this._switchWeek(1); return; }
      if (act === 'cur-week')     { this._switchWeek(0); return; }
      if (act === 'collapse')     { this._toggleCollapse(t.dataset.mcId); return; }
      if (act === 'detail') {
        try {
          const les = JSON.parse(t.dataset.mcLesson);
          this._showDetail(les, t.dataset.mcClass, Number(t.dataset.mcPeriod), t.dataset.mcTime, t.dataset.mcDay);
        } catch(err) {}
      }
    });
  }

  // ── Config form ──────────────────────────────────────────────────────────
  static getStubConfig() {
    return {
      entities: ['sensor.vpmobile24_week_table'],
      title: 'Stundenplan Übersicht',
      columns: 'auto',
      sort_order: 'custom',
      default_expanded: true,
    };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'title',    default: 'Stundenplan Übersicht', selector: { text: { type: 'text' } } },
        { name: 'entities', required: true,
          selector: { entity: { multiple: true, filter: [{ integration: 'vpmobile24' }] } } },
        { name: 'columns',  default: 'auto',
          selector: { select: { options: [
            { value: 'auto',  label: 'Automatisch' },
            { value: '1',     label: '1 Spalte'    },
            { value: '2',     label: '2 Spalten'   },
            { value: '3',     label: '3 Spalten'   },
          ]}}},
        { name: 'sort_order', default: 'custom',
          selector: { select: { options: [
            { value: 'custom',  label: 'Benutzerdefiniert' },
            { value: 'alpha',   label: 'Alphabetisch'      },
            { value: 'next',    label: 'Nächste Stunde'    },
          ]}}},
        { name: 'default_expanded', default: true, selector: { boolean: {} } },
        { name: 'show_week_nav',    default: true, selector: { boolean: {} } },
        { name: 'show_legend',      default: true, selector: { boolean: {} } },
      ],
      computeLabel: (s) => ({
        title:            'Kartentitel',
        entities:         'Klassen-Sensoren',
        columns:          'Spaltenanzahl',
        sort_order:       'Sortierung',
        default_expanded: 'Standardmäßig ausgeklappt',
        show_week_nav:    'Wochennavigation anzeigen',
        show_legend:      'Legende anzeigen',
      })[s.name] || s.name,
    };
  }

  setConfig(config) {
    if (!config || !config.entities || !Array.isArray(config.entities) || !config.entities.length)
      throw new Error('Mindestens eine Entity erforderlich');
    this._config = config;
    // init collapse state from localStorage
    this._loadCollapseState();
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const dow = new Date().getDay();
    // Auto-switch on weekends only if user hasn't navigated manually
    if ((dow === 0 || dow === 6) && this._weekOffset === 0 && !this._manualWeekOffset) this._weekOffset = 1;
    // Don't re-render while popup is open — would destroy popup DOM
    if (this._config && Object.keys(this._config).length && !this._detail) this._render();
  }

  get hass() { return this._hass; }
  getCardSize() { return 5; }

  // ── Collapse state (localStorage) ────────────────────────────────────────
  _storeKey() { return 'vpm24_multi_collapsed_' + (this._config.title || 'default'); }

  _loadCollapseState() {
    try {
      const raw = localStorage.getItem(this._storeKey());
      this._collapsed = raw ? JSON.parse(raw) : {};
    } catch(e) { this._collapsed = {}; }
  }

  _saveCollapseState() {
    try { localStorage.setItem(this._storeKey(), JSON.stringify(this._collapsed)); } catch(e) {}
  }

  _toggleCollapse(entityId) {
    const def = this._config.default_expanded !== false;
    // current state: if not in map use default
    const cur = this._collapsed[entityId] !== undefined ? this._collapsed[entityId] : !def;
    this._collapsed[entityId] = !cur;
    this._saveCollapseState();
    this._render();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  _isCancelled(fach) {
    if (!fach) return true;
    if (typeof fach !== 'string') return false;
    const f = fach.trim();
    return f === '' || f === '-' || f === '---' || f === '—' || f === '–' || /^[-—–\s]+$/.test(f);
  }

  _lessonType(lesson) {
    // returns: 'normal' | 'sub' | 'cancelled' | 'empty'
    if (!lesson) return 'empty';
    const fach = lesson.fach || '';
    if (this._isCancelled(fach)) return 'cancelled';
    if (lesson.ist_vertretung) return 'sub';
    return 'normal';
  }

  _statusColor(type) {
    return { normal:'#22c55e', sub:'#eab308', cancelled:'#ef4444', empty:'transparent' }[type] || '#22c55e';
  }

  _statusBg(type) {
    return { normal:'rgba(34,197,94,.12)', sub:'rgba(234,179,8,.13)', cancelled:'rgba(239,68,68,.15)', empty:'transparent' }[type] || 'rgba(34,197,94,.12)';
  }

  _className(entity, entityId) {
    return (entity.attributes && entity.attributes.class)
      || entityId.replace(/sensor\.vpmobile24_week_table_?/i, '').replace(/_/g,' ').trim()
      || entityId;
  }

  _getWeekTable(entity) {
    if (!entity || !entity.attributes) return null;
    return this._weekOffset === 1
      ? entity.attributes.next_week_table || null
      : entity.attributes.week_table || null;
  }

  _mondayOfWeek(offset) {
    const d = new Date();
    const dow = d.getDay() || 7; // make Sunday = 7
    d.setDate(d.getDate() - dow + 1 + offset * 7);
    d.setHours(0,0,0,0);
    return d;
  }

  _dayDates(offset) {
    const mon = this._mondayOfWeek(offset);
    return Array.from({length:5}, (_,i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
  }

  _kwNumber(offset) {
    const d = this._mondayOfWeek(offset);
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
    return Math.round((d - startOfWeek1) / 604800000) + 1;
  }

  // Find next upcoming lesson for a class (used for sorting & display)
  _nextLesson(weekTable) {
    if (!weekTable) return null;
    const dayKeys = ['monday','tuesday','wednesday','thursday','friday'];
    const now = new Date();
    const todayDow = now.getDay(); // 0=Sun
    const nowMins = now.getHours() * 60 + now.getMinutes();

    for (let di = 0; di < 5; di++) {
      const dayIdx = di + 1; // Mon=1..Fri=5
      if (dayIdx < todayDow) continue;
      const dayData = weekTable[dayKeys[di]] || {};
      const periods = Object.keys(dayData).map(Number).sort((a,b)=>a-b);
      for (const p of periods) {
        const lesson = dayData[String(p)];
        if (!lesson || this._isCancelled(lesson.fach)) continue;
        // If today: check time
        if (dayIdx === todayDow && lesson.zeit) {
          const parts = lesson.zeit.split('-');
          if (parts[0]) {
            const [h,m] = parts[0].split(':').map(Number);
            if ((h*60+m) <= nowMins) continue; // already passed
          }
        }
        return { day: dayKeys[di], dayIdx: di, period: p, lesson };
      }
    }
    return null;
  }

  // Sort entities
  _sortedEntities(entities) {
    const sort = this._config.sort_order || 'custom';
    if (sort === 'alpha') {
      return [...entities].sort((a, b) => {
        const ea = this._hass.states[a];
        const eb = this._hass.states[b];
        const na = ea ? this._className(ea, a) : a;
        const nb = eb ? this._className(eb, b) : b;
        return na.localeCompare(nb, 'de');
      });
    }
    if (sort === 'next') {
      return [...entities].sort((a, b) => {
        const ea = this._hass.states[a];
        const eb = this._hass.states[b];
        const ta = ea ? this._getWeekTable(ea) : null;
        const tb = eb ? this._getWeekTable(eb) : null;
        const na = this._nextLesson(ta);
        const nb = this._nextLesson(tb);
        if (!na && !nb) return 0;
        if (!na) return 1;
        if (!nb) return -1;
        if (na.dayIdx !== nb.dayIdx) return na.dayIdx - nb.dayIdx;
        return na.period - nb.period;
      });
    }
    return entities; // custom = as configured
  }

  // ── Translations for MultiCard ────────────────────────────────────────────
  _getMcT() {
    const lang = (this._hass && this._hass.language) ? this._hass.language.substring(0,2).toLowerCase() : 'de';
    const l = ['de','en','fr'].includes(lang) ? lang : 'de';
    return {
      de: { sub:'Vtg.', cancel:'Ausfall', lesson:'Unterricht', subFull:'Vertretung',
            nextLesson:'Nächste Stunde', period:'Stunde',
            curWeek:'‹ Aktuelle Woche', nextWeek:'Nächste Woche ›',
            noClasses:'Keine Klassen gefunden', kw:'KW', until:'bis' },
      en: { sub:'Sub.', cancel:'Cancel.', lesson:'Lesson', subFull:'Substitution',
            nextLesson:'Next Lesson', period:'Period',
            curWeek:'‹ Current Week', nextWeek:'Next Week ›',
            noClasses:'No classes found', kw:'CW', until:'until' },
      fr: { sub:'Remp.', cancel:'Annulé', lesson:'Cours', subFull:'Remplacement',
            nextLesson:'Prochain cours', period:'Heure',
            curWeek:'‹ Semaine actuelle', nextWeek:'Semaine suivante ›',
            noClasses:'Aucune classe trouvée', kw:'SC', until:'jusqu\'au' },
    }[l];
  }

  // ── Week navigation ───────────────────────────────────────────────────────
  _switchWeek(offset) {
    this._weekOffset = offset;
    this._manualWeekOffset = true;  // user navigated manually — disable auto-switch
    this._render();
  }

  // ── Search ────────────────────────────────────────────────────────────────
  _onSearch(val) {
    this._search = val.toLowerCase().trim();
    this._render();
  }

  // ── Detail popup — same style as main card ───────────────────────────────
  _showDetail(lesson, className, period, time, dayName) {
    this._detail = { lesson, className, period, time, dayName };
    const pop = this.shadowRoot.getElementById('mc-popup');
    const ov  = this.shadowRoot.getElementById('mc-overlay');
    if (!pop || !ov) return;

    const fach   = (lesson && lesson.fach && !this._isCancelled(lesson.fach)) ? lesson.fach : '—';
    const lehrer = (lesson && lesson.lehrer)     || '';
    const raum   = (lesson && lesson.raum)       || '';
    const zeit   = (lesson && lesson.zeit)       || time || '';
    const info   = (lesson && lesson.zusatzinfo) || '';
    const isActuallyCancelled = this._isCancelled(lesson ? lesson.fach : null);
    const isVertretung = !isActuallyCancelled && !!(lesson && lesson.ist_vertretung);

    if (isActuallyCancelled) {
      pop.className = 'vp-popup vp-popup-ausfall';
      pop.innerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center">'
        + '<div class="vp-ausfall-block">AUSFALL</div></div>'
        + '<div class="vp-popup-footer" style="border-top:none;padding:0 20px 20px">'
        + '<button class="vp-popup-btn" data-mc="close-detail">Schließen</button></div>';
      pop.classList.remove('hidden');
      ov.classList.remove('hidden');
      return;
    }

    let badge = '';
    if (isVertretung) badge = '<span class="vp-detail-badge vp-detail-sub">Vertretung</span>';

    let rows = '<div class="vp-detail-row"><span class="vp-detail-icon">🕐</span>'
      + '<span class="vp-detail-label">' + period + '. Stunde</span>'
      + '<span class="vp-detail-val">' + (zeit || '—') + '</span></div>';
    if (lehrer) rows += '<div class="vp-detail-row"><span class="vp-detail-icon">👤</span><span class="vp-detail-label">Lehrer</span><span class="vp-detail-val">' + lehrer + '</span></div>';
    if (raum)   rows += '<div class="vp-detail-row"><span class="vp-detail-icon">🚪</span><span class="vp-detail-label">Raum</span><span class="vp-detail-val">' + raum + '</span></div>';
    if (info)   rows += '<div class="vp-detail-row vp-detail-info-row"><span class="vp-detail-icon">ℹ️</span><span class="vp-detail-label">Info</span><span class="vp-detail-val">' + info + '</span></div>';
    if (!lehrer && !raum && !info) rows += '<div class="vp-detail-empty">Keine weiteren Details verfügbar.</div>';

    pop.className = 'vp-popup';
    pop.innerHTML = '<div class="vp-popup-title">'
      + '<span class="vp-detail-num">' + period + '. Stunde</span>'
      + '<span class="vp-detail-fach">' + fach + '</span>' + badge
      + '<span style="margin-left:auto;font-size:.72em;color:#64748b;background:rgba(255,255,255,.07);padding:2px 8px;border-radius:5px">' + className + '</span>'
      + '</div>'
      + '<div>' + rows + '</div>'
      + '<div class="vp-popup-footer"><button class="vp-popup-btn" data-mc="close-detail">Schließen</button></div>';
    pop.classList.remove('hidden');
    ov.classList.remove('hidden');
  }

  _closeDetail() {
    this._detail = null;
    const pop = this.shadowRoot.getElementById('mc-popup');
    const ov  = this.shadowRoot.getElementById('mc-overlay');
    if (pop) { pop.classList.add('hidden'); pop.classList.remove('vp-popup-ausfall'); }
    if (ov)  ov.classList.add('hidden');
  }

  // ── Main render ───────────────────────────────────────────────────────────
  _render() {
    if (!this._hass || !this._config) return;

    const entities      = this._sortedEntities(this._config.entities);
    const title         = this._config.title || 'Stundenplan Übersicht';
    const showSearch    = false;
    const showWeekNav   = this._config.show_week_nav  !== false;
    const showLegend    = this._config.show_legend    !== false;
    const defaultExpand = this._config.default_expanded !== false;
    const colsCfg       = this._config.columns || 'auto';
    const dayKeys       = ['monday','tuesday','wednesday','thursday','friday'];
    const dayNames      = ['Mo','Di','Mi','Do','Fr'];
    const dayFull       = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'];
    const mc = this._getMcT();

    // ── Auto-detect holiday entity from first entity's ID ─────────────
    const firstEntityId = (this._config.entities || [])[0] || '';
    const holidayEntityId = this._config.holiday_entity
      || (firstEntityId ? firstEntityId.replace(/_week_table$/, '_ferien').replace(/_wochentabelle$/, '_ferien') : null);
    const holidayEnt  = holidayEntityId ? this._hass.states[holidayEntityId] : null;
    const isHoliday   = !!(holidayEnt && holidayEnt.attributes && holidayEnt.attributes.ist_ferien);
    const holidayName = isHoliday ? (holidayEnt.state || 'Ferien') : '';

    const now       = new Date();
    const todayDow  = now.getDay();
    const nowMins   = now.getHours() * 60 + now.getMinutes();
    const todayIdx  = (this._weekOffset === 0 && todayDow >= 1 && todayDow <= 5) ? todayDow - 1 : -1;
    const dates     = this._dayDates(this._weekOffset);
    const kw        = this._kwNumber(this._weekOffset);

    // Filter by search
    const filtered = entities.filter(eid => {
      if (!this._search) return true;
      const ent = this._hass.states[eid];
      if (!ent) return true;
      const cn = this._className(ent, eid).toLowerCase();
      return cn.includes(this._search);
    });

    // Responsive columns CSS
    const colsMap = { '1':'1fr', '2':'repeat(2,1fr)', '3':'repeat(3,1fr)', 'auto':'repeat(auto-fill,minmax(320px,1fr))' };
    const gridCols = colsMap[colsCfg] || colsMap['auto'];

    // ── Build each class section ──────────────────────────────────────────
    let sectionsHtml = '';
    for (const entityId of filtered) {
      const entity    = this._hass.states[entityId];
      if (!entity) {
        sectionsHtml += `<div class="mc-section mc-error">⚠ Entity nicht gefunden: ${entityId}</div>`;
        continue;
      }
      const weekTable  = this._getWeekTable(entity);
      const className  = this._className(entity, entityId);
      const isCollapsed = this._collapsed[entityId] !== undefined
        ? this._collapsed[entityId]
        : !defaultExpand;

      // Next lesson for badge
      const nextL = this._nextLesson(weekTable);
      const nextBadge = nextL && this._weekOffset === 0
        ? `<span class="mc-next-badge">${mc.nextLesson}: ${dayNames[nextL.dayIdx]}, ${nextL.period}. ${mc.period}${nextL.lesson.fach ? ' · ' + nextL.lesson.fach : ''}</span>`
        : '';

      // Stats row: count per type across whole week
      let nNormal=0,nSub=0,nCancel=0;
      if (weekTable) {
        dayKeys.forEach(dk => {
          const day = weekTable[dk] || {};
          Object.values(day).forEach(les => {
            if (!les) return;
            const t = this._lessonType(les);
            if (t==='cancelled') nCancel++;
            else if (t==='sub') nSub++;
            else if (t!=='empty') nNormal++;
          });
        });
      }

      // Build the timetable grid for this class
      let gridHtml = '';
      if (!isCollapsed) {
        if (!weekTable) {
          gridHtml = '<div class="mc-no-data">Keine Wochendaten verfügbar</div>';
        } else {
          // Collect periods that have at least one lesson
          const maxPeriod = 10;
          const usedPeriods = [];
          for (let p = 1; p <= maxPeriod; p++) {
            if (dayKeys.some(dk => weekTable[dk] && weekTable[dk][String(p)])) {
              usedPeriods.push(p);
            }
          }

          // Table header
          gridHtml += '<div class="mc-grid-wrap"><table class="mc-tbl"><thead><tr><th class="mc-th-num">#</th>';
          dayNames.forEach((d, di) => {
            const isT = di === todayIdx;
            const dateStr = dates[di] ? dates[di].getDate() : '';
            if (isT) {
              gridHtml += `<th><div class="mc-th-today"><span>${d}</span><span class="mc-th-date">${dateStr}</span></div></th>`;
            } else {
              gridHtml += `<th><span class="mc-th-day">${d}</span><span class="mc-th-date">${dateStr}</span></th>`;
            }
          });
          gridHtml += '</tr></thead><tbody>';

          // Current lesson detection
          let currentPeriod = -1;
          if (todayIdx >= 0 && weekTable) {
            const todayData = weekTable[dayKeys[todayIdx]] || {};
            for (const p of usedPeriods) {
              const les = todayData[String(p)];
              if (les && les.zeit) {
                const parts = les.zeit.split('-');
                if (parts.length === 2) {
                  const [sh,sm] = parts[0].split(':').map(Number);
                  const [eh,em] = parts[1].split(':').map(Number);
                  if (nowMins >= sh*60+sm && nowMins <= eh*60+em) { currentPeriod = p; }
                }
              }
            }
          }

          for (const p of usedPeriods) {
            gridHtml += '<tr>';
            // Period number + time
            let timeStr = '';
            for (const dk of dayKeys) {
              const les = weekTable[dk] && weekTable[dk][String(p)];
              if (les && les.zeit) { timeStr = les.zeit; break; }
            }
            gridHtml += `<td class="mc-td-num"><div class="mc-pnum">${p}</div>${timeStr ? `<div class="mc-ptime">${timeStr}</div>` : ''}</td>`;

            dayNames.forEach((d, di) => {
              const isT    = di === todayIdx;
              const les    = weekTable[dayKeys[di]] && weekTable[dayKeys[di]][String(p)];
              const type   = this._lessonType(les);
              const color  = this._statusColor(type);
              const bg     = this._statusBg(type);
              const isCur  = isT && p === currentPeriod && type !== 'cancelled' && type !== 'empty';
              const fach   = (les && !this._isCancelled(les.fach)) ? les.fach : (les ? '—' : '');
              const clickable = !!les;
              const onclk = clickable
                ? `data-mc="detail" data-mc-lesson='${JSON.stringify(les).replace(/'/g,"&#39;").replace(/\\/g,"\\\\")}' data-mc-class='${className.replace(/'/g,"&#39;")}' data-mc-period='${p}' data-mc-time='${timeStr}' data-mc-day='${dayFull[di]}' style="cursor:pointer"`
                : '';
              let tileStyle = '';
              let tileCls   = 'mc-tile';
              if (isCur) {
                tileStyle = 'background:#14532d;color:#86efac;box-shadow:0 0 0 2px #22c55e;font-weight:700';
              } else if (type === 'empty' || !les) {
                tileStyle = `background:${isT ? 'rgba(37,99,235,.06)' : 'rgba(255,255,255,.03)'};color:#334155`;
              } else {
                tileStyle = `background:${bg};color:${type==='cancelled'?'#fca5a5':type==='sub'?'#fde68a':'#dcfce7'};border:1px solid ${color}35`;
              }
              if (les) tileCls += ' mc-tile-hover';
              const tooltip = les ? `title="${[les.fach, les.lehrer && '👤 '+les.lehrer, les.raum && '🚪 '+les.raum].filter(Boolean).join(' | ')}"` : '';
              gridHtml += `<td class="${isT?'mc-td-today':''}">
                <div class="mc-tile" style="${tileStyle}" ${onclk} ${tooltip}>${fach}</div>
              </td>`;
            });
            gridHtml += '</tr>';
          }
          gridHtml += '</tbody></table></div>';

          // Next lesson info bar (only current week)
          if (nextL && this._weekOffset === 0) {
            const nl = nextL.lesson;
            const ntype = this._lessonType(nl);
            const ncolor = this._statusColor(ntype);
            gridHtml += `<div class="mc-next-bar" style="border-left:3px solid ${ncolor}">
              <span class="mc-next-label">${mc.nextLesson}</span>
              <span class="mc-next-info">${dayFull[nextL.dayIdx]}, ${nextL.period}. ${mc.period}</span>
              ${nl.fach ? `<span class="mc-next-fach" style="color:${ncolor}">${nl.fach}</span>` : ''}
              ${nl.lehrer ? `<span class="mc-next-chip">👤 ${nl.lehrer}</span>` : ''}
              ${nl.raum   ? `<span class="mc-next-chip">🚪 ${nl.raum}</span>` : ''}
            </div>`;
          }
        }
      }

      sectionsHtml += `
        <div class="mc-section">
          <div class="mc-section-head" data-mc="collapse" data-mc-id="${entityId}">
            <div class="mc-section-left">
              <span class="mc-chevron${isCollapsed ? '' : ' mc-chevron-open'}">›</span>
              <span class="mc-class-name">${className}</span>
              ${nextBadge}
            </div>
            <div class="mc-section-stats">
              ${nNormal ? `<span class="mc-stat mc-stat-n">${nNormal}×</span>` : ''}
              ${nSub    ? `<span class="mc-stat mc-stat-s">${nSub}× ${mc.sub}</span>` : ''}
              ${nCancel ? `<span class="mc-stat mc-stat-c">${nCancel}× ${mc.cancel}</span>` : ''}
            </div>
          </div>
          <div class="mc-section-body${isCollapsed ? ' hidden' : ''}">
            ${gridHtml}
          </div>
        </div>`;
    }

    if (!filtered.length) {
      sectionsHtml = `<div class="mc-no-data">${mc.noClasses}.</div>`;
    }

    const weekLabel = `${mc.kw} ${kw}`;

    const legendHtml = showLegend ? `
      <div class="mc-legend">
        <span class="mc-leg-item"><span class="mc-leg-dot" style="background:#22c55e"></span>${mc.lesson}</span>
        <span class="mc-leg-item"><span class="mc-leg-dot" style="background:#eab308"></span>${mc.subFull}</span>
        <span class="mc-leg-item"><span class="mc-leg-dot" style="background:#ef4444"></span>${mc.cancel}</span>
      </div>` : '';

    // ── Full HTML ─────────────────────────────────────────────────────────
    this.shadowRoot.innerHTML = `
<style>
:host { display: block; }
ha-card {
  background: #0f1729 !important;
  border-radius: 16px !important;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,.55) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0 !important;
}
/* ── HEADER ── */
.mc-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px 10px;
  background: rgba(255,255,255,.02);
  border-bottom: 1px solid rgba(255,255,255,.07);
  flex-wrap: wrap; gap: 8px;
}
.mc-hdr-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  background: linear-gradient(135deg,#3b82f6,#1d4ed8);
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 1.2em;
  box-shadow: 0 3px 10px rgba(29,78,216,.45);
}
.mc-hdr-title {
  font-size: 1.05em; font-weight: 700; color: #fff;
  flex: 1; min-width: 100px;
}
.mc-hdr-kw {
  font-size: .75em; font-weight: 600; color: #64748b;
  background: rgba(255,255,255,.06); border-radius: 20px;
  padding: 4px 10px; white-space: nowrap;
}
/* ── CONTROLS ── */
.mc-controls {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  flex-wrap: wrap;
}
.mc-search {
  flex: 1; min-width: 120px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 6px 14px;
  color: #e2e8f0; font-size: .82em; font-family: inherit;
  outline: none; transition: border .2s;
}
.mc-search:focus { border-color: #3b82f6; background: rgba(59,130,246,.1); }
.mc-search::placeholder { color: #475569; }
.mc-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 5px 12px;
  font-size: .76em; font-weight: 500; color: #94a3b8;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: all .2s; line-height: 1.3;
}
.mc-pill:hover { background: rgba(255,255,255,.12); color: #e2e8f0; }
.mc-pill-blue { color: #93c5fd; border-color: rgba(59,130,246,.3); background: rgba(59,130,246,.08); }
.mc-pill-blue:hover { background: rgba(59,130,246,.18); border-color: #3b82f6; }
.mc-pill-green { color: #86efac; border-color: rgba(34,197,94,.3); background: rgba(34,197,94,.08); }
.mc-pill-green:hover { background: rgba(34,197,94,.18); border-color: #22c55e; }
/* ── GRID LAYOUT for sections ── */
.mc-sections-grid {
  display: grid;
  grid-template-columns: ${gridCols};
  gap: 10px;
  padding: 10px 12px 14px;
}
/* ── SECTION ── */
.mc-section {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px; overflow: hidden;
}
.mc-section-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; cursor: pointer;
  background: rgba(255,255,255,.04);
  transition: background .15s; user-select: none; gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.mc-section-head:hover { background: rgba(255,255,255,.07); }
.mc-section-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; flex-wrap: wrap; }
.mc-chevron {
  font-size: 1.1em; color: #475569; font-weight: 700;
  transition: transform .25s; display: inline-block; flex-shrink: 0;
}
.mc-chevron-open { transform: rotate(90deg); }
.mc-class-name { font-size: .95em; font-weight: 700; color: #e2e8f0; white-space: nowrap; }
.mc-next-badge {
  font-size: .68em; font-weight: 600; color: #93c5fd;
  background: rgba(59,130,246,.13); border: 1px solid rgba(59,130,246,.25);
  border-radius: 12px; padding: 2px 8px; white-space: nowrap;
}
.mc-section-stats { display: flex; gap: 5px; flex-shrink: 0; }
.mc-stat { font-size: .68em; font-weight: 700; border-radius: 10px; padding: 2px 7px; }
.mc-stat-n { background: rgba(34,197,94,.12);  color: #86efac; }
.mc-stat-s { background: rgba(234,179,8,.12);  color: #fde68a; }
.mc-stat-c { background: rgba(239,68,68,.12);  color: #fca5a5; }
.mc-section-body { padding: 0; transition: max-height .3s ease; }
.mc-section-body.hidden { display: none; }
.mc-no-data { padding: 14px 16px; color: #475569; font-size: .85em; font-style: italic; }
.mc-error { padding: 14px; color: #ef4444; font-size: .82em; border: 1px solid rgba(239,68,68,.2); border-radius: 12px; }
/* ── TIMETABLE ── */
.mc-grid-wrap { overflow-x: auto; }
.mc-tbl { width: 100%; border-collapse: separate; border-spacing: 0; padding: 6px 8px 8px; }
.mc-tbl thead th {
  font-size: .7em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .5px; color: #475569; padding: 5px 3px;
  text-align: center;
}
.mc-th-today { display: inline-flex; flex-direction: column; align-items: center; gap: 1px;
  background: #2563eb; color: #fff; border-radius: 7px; padding: 3px 9px;
  font-size: .88em; font-weight: 700; }
.mc-th-day  { display: block; font-size: .88em; }
.mc-th-date { display: block; font-size: .8em; color: #475569; font-weight: 500; }
.mc-th-today .mc-th-date { color: rgba(255,255,255,.75); }
.mc-td-num { width: 44px; min-width: 44px; padding: 3px 4px; text-align: center; }
.mc-pnum  { font-size: .82em; font-weight: 700; color: #94a3b8; line-height: 1.3; }
.mc-ptime { font-size: .58em; color: #334155; white-space: nowrap; margin-top: 1px; }
.mc-tbl td { padding: 3px 3px; vertical-align: middle; }
.mc-td-today { background: rgba(37,99,235,.05); }
.mc-tile {
  border-radius: 7px; padding: 4px 3px;
  font-size: .78em; font-weight: 600;
  min-height: 38px; display: flex; align-items: center; justify-content: center;
  text-align: center; transition: filter .12s, transform .12s;
  line-height: 1.2;
}
.mc-tile-hover:hover { filter: brightness(1.18); transform: scale(1.05); }
/* ── NEXT LESSON BAR ── */
.mc-next-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin: 0 8px 8px; padding: 7px 12px;
  background: rgba(255,255,255,.04); border-radius: 8px;
  font-size: .75em;
}
.mc-next-label { font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .5px; flex-shrink: 0; }
.mc-next-info  { color: #94a3b8; }
.mc-next-fach  { font-weight: 700; }
.mc-next-chip  { color: #64748b; background: rgba(255,255,255,.05); border-radius: 6px; padding: 1px 6px; }
/* ── LEGEND ── */
.mc-legend {
  display: flex; gap: 14px; flex-wrap: wrap;
  padding: 8px 16px 12px; font-size: .75em; color: #64748b;
  border-top: 1px solid rgba(255,255,255,.05);
}
.mc-leg-item { display: flex; align-items: center; gap: 5px; }
.mc-leg-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
/* ── POPUP — same style as main card ── */
.vp-popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 9998; backdrop-filter: blur(3px); }
.vp-popup {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: #162040; border-radius: 16px;
  box-shadow: 0 16px 64px rgba(0,0,0,.8);
  max-width: 400px; width: 94%; z-index: 9999;
  border: 1px solid rgba(255,255,255,.13); color: #e2e8f0; overflow: hidden;
}
.vp-popup-title {
  font-size: 1em; font-weight: 700; color: #fff;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.vp-detail-num  { font-size: .75em; font-weight: 700; color: #94a3b8; background: rgba(255,255,255,.07); padding: 3px 8px; border-radius: 6px; }
.vp-detail-fach { font-size: 1.1em; font-weight: 800; color: #fff; }
.vp-detail-badge{ font-size: .68em; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.vp-detail-sub  { background: rgba(234,179,8,.15); color: #fde68a; border: 1px solid rgba(234,179,8,.3); }
.vp-detail-row  { display: flex; align-items: center; gap: 12px; padding: 13px 20px; border-bottom: 1px solid rgba(255,255,255,.05); }
.vp-detail-row:last-child { border-bottom: none; }
.vp-detail-info-row { background: rgba(245,158,11,.06); }
.vp-detail-icon { font-size: 1.1em; width: 24px; text-align: center; flex-shrink: 0; }
.vp-detail-label{ font-size: .76em; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .5px; min-width: 54px; }
.vp-detail-val  { font-size: .92em; font-weight: 500; color: #e2e8f0; flex: 1; }
.vp-detail-empty{ padding: 16px 20px; color: #475569; font-size: .86em; font-style: italic; }
.vp-popup-footer{ padding: 12px 20px 16px; text-align: right; border-top: 1px solid rgba(255,255,255,.06); }
.vp-popup-btn   { background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 9px 24px; cursor: pointer; font-size: .88em; font-family: inherit; font-weight: 600; transition: background .18s; }
.vp-popup-btn:hover { background: #1d4ed8; }
.vp-popup-ausfall {
  background: linear-gradient(135deg,#7f1d1d,#991b1b) !important;
  border-color: rgba(239,68,68,.5) !important;
  box-shadow: 0 0 0 1px rgba(239,68,68,.3), 0 16px 56px rgba(239,68,68,.45) !important;
  display: flex !important; flex-direction: column !important; min-height: 200px;
}
.vp-popup-ausfall .vp-popup-footer { border-top: none !important; padding: 0 20px 20px; }
.vp-ausfall-block { color: #fca5a5; font-size: 2.6em; font-weight: 900; letter-spacing: 5px; text-align: center; padding: 24px 20px; text-shadow: 0 0 30px rgba(255,100,100,1); flex: 1; display: flex; align-items: center; justify-content: center; }
.hidden { display: none !important; }
</style>
<ha-card>
  <!-- Header -->
  <div class="mc-hdr">
    <div class="mc-hdr-icon">📅</div>
    <span class="mc-hdr-title">${title}</span>
    <span class="mc-hdr-kw">${weekLabel}</span>
    ${showWeekNav ? (this._weekOffset === 0
      ? `<button class="mc-pill mc-pill-blue" data-mc="next-week">${mc.nextWeek}</button>`
      : `<button class="mc-pill mc-pill-green" data-mc="cur-week">${mc.curWeek}</button>`)
      : ''}
  </div>

  <!-- Holiday banner -->
  ${isHoliday ? `<div style="margin:8px 16px 0;padding:10px 14px;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);border-radius:10px;display:flex;align-items:center;gap:8px;font-weight:700;color:#fde68a;font-size:.9em">🏖️ ${holidayName}${holidayEnt && holidayEnt.attributes.end ? ' · ' + (mc.until || 'bis') + ' ' + new Date(holidayEnt.attributes.end).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}) : ''}</div>` : ''}

  <!-- Class sections grid -->
  <div class="mc-sections-grid">
    ${sectionsHtml}
  </div>

  <!-- Legend -->
  ${legendHtml}
</ha-card>

<!-- Detail popup -->
<div id="mc-overlay" class="vp-popup-overlay hidden"></div>
<div id="mc-popup"  class="vp-popup hidden"></div>`;
  }
}

customElements.define('vpmobile24-multi-card', VpMobile24MultiCard);
window.customCards.push({ type:'vpmobile24-multi-card', name:'VpMobile24 Mehrere Klassen', description:'Moderne Mehrklassen-Stundenplankarte für Familien', preview:true });
console.log('✅ VpMobile24 Card v2.5.1 loaded');
