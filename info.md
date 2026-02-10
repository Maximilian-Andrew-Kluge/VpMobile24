# VpMobile24 - Stundenplan Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)

Eine leistungsstarke Home Assistant Integration für stundenplan24.de Stundenpläne.

## ✨ Hauptfeatures

### 🌍 Mehrsprachige Sensoren
- **🇩🇪 Deutsch**: Nächste Stunde, Wochenstundenplan, Zusatzinfos, Änderungen
- **🇺🇸 English**: Next Lesson, Week Schedule, Additional Info, Changes  
- **🇫🇷 Français**: Prochain Cours, Emploi du Temps, Infos Supplémentaires, Changements

### ⚙️ Einfache 3-Schritte Einrichtung
1. **Zugangsdaten** - Schulnummer, Nutzername, Passwort, Klasse
2. **Fächer auswählen** - Wähle nur die gewünschten Fächer aus
3. **Sprache wählen** - Deutsch, Englisch oder Französisch

### 📊 Vier intelligente Sensoren
- **⏰ Nächste Stunde** - Zeigt die kommende Unterrichtsstunde
- **📅 Wochenstundenplan** - Kompletter Tagesüberblick  
- **ℹ️ Zusatzinfos** - Wichtige Schulinformationen aus dem XML
- **🔄 Änderungen** - Vertretungen und Stundenplanänderungen

### 📅 Kalender-Integration
- Vollständige Wochenansicht in Home Assistant
- Vertretungen deutlich markiert
- Detaillierte Ereignisse mit Lehrer, Raum und Zeit

## 🎯 Intelligente Features

### 📋 ZusatzInfo-Parsing
Zeigt zusätzliche Informationen direkt aus dem stundenplan24.de XML:
- Allgemeine Schulinformationen
- Klassenspezifische Hinweise
- Prüfungstermine und Ankündigungen

### 🎨 Saubere Icons
- Material Design Icons für alle Sensoren
- Integration-Icon: ⏰📅 (calendar-clock)
- Konsistente Darstellung in Home Assistant

### 🔄 Automatische Updates
- Daten werden alle 15 Minuten aktualisiert
- Sichere HTTP Basic Authentication
- Zuverlässige XML-Verarbeitung

## 📱 Verwendung

### Lovelace Karten
```yaml
type: entities
title: Mein Stundenplan
entities:
  - sensor.vpmobile24_nachste_stunde
  - sensor.vpmobile24_wochenstundenplan
  - sensor.vpmobile24_zusatzinfos
  - sensor.vpmobile24_anderungen
