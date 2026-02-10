# 📝 VpMobile24 Version History

## 🚀 Version 1.4.5 (Aktuell)
**Release Date**: Februar 2026

### ✨ Neue Features
- **📅 Kalender-Wochenansicht**: Vollständige Wochenansicht (Montag-Freitag) mit Fächerfilterung
- **🎨 Custom Dashboard Card**: Speziell entwickelte Lovelace-Karte für optimale Darstellung
- **🎯 Heute-fokussierte Sensoren**: Alle Sensoren zeigen nur noch heutige Daten
- **⚡ Optimierte API-Aufrufe**: Ein API-Call für Woche, heute wird daraus extrahiert

### 🔧 Verbesserungen
- **Sensor-Umbenennung**: "Wochenstundenplan" → "Heutiger Stundenplan"
- **Intelligente Filterung**: Änderungen nur für ausgewählte Fächer
- **Bessere Fehlerbehandlung**: Detaillierte Debug-Logs
- **Performance-Optimierung**: Weniger API-Calls, bessere Stabilität

### 🌍 Mehrsprachigkeit
- **Deutsch**: VpMobile24 Heutiger Stundenplan
- **English**: VpMobile24 Today Schedule
- **Français**: VpMobile24 Emploi Aujourd'hui

---

## 📊 Version 1.4.4
**Release Date**: Februar 2026

### 🔧 Fixes
- **Device Entity Linking**: Alle Sensoren und Kalender sind jetzt korrekt mit dem VpMobile24 Gerät verknüpft
- **Gerät-Anzeige**: Entitäten erscheinen unter "Steuerelemente" statt "Dieses Gerät hat keine Entitäten"
- **Version-Update**: Alle Komponenten auf einheitliche Version aktualisiert

---

## 🎯 Version 1.4.3
**Release Date**: Februar 2026

### ✨ Neue Features
- **Multi-Day Support**: API unterstützt jetzt mehrere Tage (heute + morgen)
- **Erweiterte Next Lesson**: Zeigt morgen's Stunden wenn heute alle vorbei sind
- **Verbesserte Wochenansicht**: Heute/Morgen Trennung im Wochenstundenplan
- **Gefilterte Änderungen**: Changes-Sensor zeigt nur Änderungen für ausgewählte Fächer

### 🔧 Verbesserungen
- **Bessere Zeitlogik**: Intelligente Erkennung vergangener Stunden
- **Erweiterte Attribute**: Mehr Details in Sensor-Attributen
- **Stabilere API**: Robustere Fehlerbehandlung

---

## 🧹 Version 1.4.2
**Release Date**: Februar 2026

### 🔧 Fixes
- **ZusatzInfo Cleanup**: Entfernung von unnötigen "text:" und "typ:" Feldern
- **Saubere Attribute**: ZusatzInfo zeigt jetzt direkte Text-Arrays
- **Verbesserte Darstellung**: Klarere Struktur in den Sensor-Attributen

---

## 🌍 Version 1.4.1
**Release Date**: Februar 2026

### ✨ Neue Features
- **Mehrsprachige Unterstützung**: Deutsch, English, Français
- **Sprachauswahl**: 3-Schritt Konfiguration mit Sprachauswahl
- **Standard Englisch**: Englisch als Standardsprache
- **Deutsche Sensoren**: Vollständige deutsche Lokalisierung

### 🔧 Verbesserungen
- **ZusatzInfo Fix**: Korrekte XML-Parsing von `<ZiZeile>` Tags
- **Icon Support**: Schul-Icon wird korrekt angezeigt
- **Translation Fixes**: Korrigierte Übersetzungsfehler

---

## 🎨 Version 1.4.0
**Release Date**: Februar 2026

### ✨ Neue Features
- **Deutsche Sensoren**: Komplette Neuentwicklung mit 4 deutschen Sensoren
  - "Nächste Stunde"
  - "Wochenstundenplan" 
  - "Zusatzinfos"
  - "Änderungen"
- **ZusatzInfo Integration**: XML-Parsing für zusätzliche Schulinformationen
- **Erweiterte Attribute**: Detaillierte Informationen in allen Sensoren

### 🔧 Verbesserungen
- **Bessere API**: Erweiterte `api_new.py` mit ZusatzInfo-Support
- **Robuste Parsing**: Verbesserte XML-Verarbeitung
- **Fehlerbehandlung**: Graceful Fallbacks bei fehlenden Daten

---

## 📅 Version 1.3.0
**Release Date**: Februar 2026

### ✨ Neue Features
- **Kalender-Integration**: Vollständige Home Assistant Kalender-Unterstützung
- **Wochenansicht**: Alle Unterrichtsstunden in der Kalender-App
- **Vertretungs-Markierung**: Änderungen mit 🔄 Symbol
- **Timezone-Aware**: Korrekte Zeitzonenbehandlung

### 🔧 Verbesserungen
- **Erweiterte Fächersuche**: 28 Tage Scan-Bereich
- **Bessere Filterung**: Intelligente Fächer-Erkennung
- **Custom Icon**: Schul-Icon für bessere Erkennbarkeit

---

## 🔧 Version 1.2.0
**Release Date**: Februar 2026

### 🔧 Fixes
- **Config Flow Reparatur**: Behebung kritischer Konfigurationsfehler
- **Fächer-Auswahl**: Funktionsfähige Fächerfilterung
- **UI Verbesserungen**: Deutsche Benutzeroberfläche
- **Stabilität**: Robustere Fehlerbehandlung

---

## 🎉 Version 1.0.0
**Release Date**: Februar 2026

### ✨ Erste Veröffentlichung
- **Grundfunktionalität**: Vollständige stundenplan24.de Integration
- **HTTP Basic Auth**: Sichere Authentifizierung
- **XML-Parsing**: Zuverlässige Datenextraktion
- **Sensor-Platform**: Grundlegende Sensoren für Stundenplan-Daten
- **Config Flow**: Benutzerfreundliche Konfiguration

---

## 🔮 Geplante Features

### Version 1.5.0 (Geplant)
- **Push-Benachrichtigungen**: Erinnerungen für nächste Stunden
- **Hausaufgaben-Integration**: Unterstützung für Hausaufgaben-Tracking
- **Erweiterte Filterung**: Lehrer- und Raum-basierte Filter
- **Export-Funktionen**: iCal/CSV Export

### Version 1.6.0 (Geplant)
- **Offline-Modus**: Lokale Datenspeicherung
- **Statistiken**: Wöchentliche/monatliche Auswertungen
- **Themes**: Anpassbare Karten-Themes
- **Widgets**: Home Screen Widgets

---

## 📊 Statistiken

- **Aktuelle Version**: 1.4.5
- **Unterstützte HA Versionen**: 2023.1+
- **Sprachen**: 3 (Deutsch, English, Français)
- **Sensoren**: 4
- **Kalender**: 1
- **Custom Cards**: 1

## 🙏 Danksagungen

Vielen Dank an alle Benutzer für Feedback und Bug-Reports, die diese Integration kontinuierlich verbessern!

**Entwickelt mit ❤️ für die Home Assistant Community**