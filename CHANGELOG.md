# Changelog

All notable changes to VpMobile24 are documented here.

---

## [v2.5.0] – 2026-06-08

### 🎉 Highlights

Das bisher größte Update für VpMobile24 — drei überarbeitete Karten, ein wichtiger CSP-Fix für Reverse-Proxy-Nutzer und ein intelligenter Parallelkurs-Filter.

### 🃏 Stundenplan-Karte
- Erweiterte Wochennavigation mit KW-Anzeige
- Manueller Override: kein automatisches Zurückspringen am Wochenende mehr
- Unterstützung für übernächste Woche (`next_next_week_table`)
- Neue Statusfarben: Grün = normal, Gelb = Vertretung, Rot = Ausfall
- Smart Status Bar: Ausfälle, Vertretungen & Unterrichtsende heute
- Tooltips mit Lehrer & Raum beim Hover über eine Stunde
- Vollständige Übersetzung DE/EN/FR aller UI-Texte

### 👥 Mehrere Klassen-Karte
- Komplett neu geschrieben — moderne kollabierbare Abschnitte pro Klasse
- Statistik-Badges: Stunden / Vertretungen / Ausfälle auf einen Blick
- Nächste-Stunde-Anzeige direkt im Klassen-Header
- Einklappbar mit localStorage-Persistenz
- Übersetzt: DE/EN/FR

### ⏱️ Aktueller Unterricht-Karte
- Neu: Echtzeit-Fortschrittsbalken & Countdown
- Nächste Stunde & Tagesinformationen
- Unterrichtsende wird aus echten (nicht-ausgefallenen) Stunden berechnet
- Automatische Übersetzung DE/EN/FR

### 🔧 Integration Backend
- **Parallelkurs-Filter**: `789WB12`, `7INb1` etc. erscheinen in der Fächerauswahl — nur ausgewählte Kurse werden angezeigt
- **Fremde Ausfälle gefiltert**: Ausfall von `789WB2` erscheint nicht wenn man `789WB12` hat
- **Übernächste Woche** wird automatisch vorgeladen
- **CSP-sicher**: alle `onclick`-Handler durch Event-Delegation ersetzt — funktioniert mit nginx, DuckDNS, Reverse Proxy
- Popup-Bug behoben: kein Konfigurationsfehler mehr

### 🐛 Bugfixes
- Popup schließt sich nicht mehr automatisch nach wenigen Sekunden
- Wochennavigation springt am Wochenende nicht mehr automatisch zurück nach manueller Navigation
- Parallelkurs-Ausfälle (z.B. Reli wenn man Ethik hat) werden korrekt gefiltert

---

## [v2.4.9] – 2026-05-xx

- Wochentabellen-Sensor mit `next_week_table`
- Aktueller Unterricht Sensor (`ist_ausfall`, `zeit_start`, `zeit_ende`)
- Optionsflow: Klasse und Fächer unabhängig änderbar
- Doppeltes Gerät nach Klassenwechsel behoben
- Unterrichtszeiten werden automatisch aus dem XML gelesen

---

## [v2.4.8] – 2026-04-xx

- OptionsFlow: Klasse und Fächer nach Setup änderbar
- Paralleler Datenabruf (bis zu 10× schneller)
- Klassenauswahl aus XML beim Setup
- AG-Ausfall-Bug behoben

---

## [v2.4.7] – 2026-03-xx

- Kalender-Integration
- Verbesserte Fehlerbehandlung
- Mehrsprachigkeit DE/EN/FR

---

*Ältere Versionen siehe [GitHub Releases](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)*
