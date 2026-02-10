# VpMobile24 Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![GitHub license](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/blob/main/LICENSE)

Eine Custom Integration für Home Assistant, um Stundenpläne von stundenplan24.de einzubinden.

## 🚀 Features

- **Automatische Datenaktualisierung** alle 15 Minuten
- **HTTP Basic Authentication** für sichere Verbindung
- **XML-basierte Datenverarbeitung** für zuverlässige Stundenplan-Extraktion
- **Änderungserkennung** für Vertretungsstunden
- **Intelligente Fächerfilterung** - Wähle nur die gewünschten Fächer aus
- **Kalender-Integration** für Wochenansicht
- **Vier verschiedene Sensoren** für unterschiedliche Anwendungsfälle
- **Deutsche Benutzeroberfläche** mit vollständiger Lokalisierung

## 📦 Installation

### HACS (Empfohlen)

1. Öffne HACS in Home Assistant
2. Gehe zu "Integrationen"
3. Klicke auf die drei Punkte oben rechts und wähle "Benutzerdefinierte Repositories"
4. Füge diese Repository-URL hinzu: `https://github.com/DEIN-USERNAME/vpmobile24-ha`
5. Wähle Kategorie "Integration"
6. Suche nach "VpMobile24" und installiere es
7. Starte Home Assistant neu

### Manuelle Installation

1. Lade die neueste Version von [Releases](https://github.com/DEIN-USERNAME/vpmobile24-ha/releases) herunter
2. Entpacke die Datei
3. Kopiere den `custom_components/vpmobile24` Ordner in dein Home Assistant `custom_components` Verzeichnis
4. Starte Home Assistant neu
5. Gehe zu Einstellungen > Geräte & Dienste > Integration hinzufügen
6. Suche nach "VpMobile24" und folge den Anweisungen

## ⚙️ Konfiguration

### Benötigte Daten

Du benötigst folgende Informationen von deiner Schule:

- **Schulnummer**: Die ID deiner Schule (findest du in der URL: `https://www.stundenplan24.de/SCHULNUMMER/mobil/plankl.html`)
- **Nutzername**: Dein Benutzername für stundenplan24.de
- **Passwort**: Dein Passwort für stundenplan24.de
- **Klasse**: Die Klasse (z.B. "5a", "10b", "Q1") - **Pflichtfeld**

### Einrichtung

1. **Integration hinzufügen**:
   - Gehe zu Einstellungen > Geräte & Dienste
   - Klicke auf "Integration hinzufügen"
   - Suche nach "VpMobile24"

2. **Grunddaten eingeben**:
   - Schulnummer (z.B. "12345678")
   - Nutzername
   - Passwort
   - Klasse (z.B. "5a")

3. **Fächer auswählen**:
   - Die Integration scannt automatisch 4 Wochen nach allen verfügbaren Fächern
   - Wähle die Fächer ab, die du NICHT in den Sensoren sehen möchtest
   - Alle anderen Fächer werden in den Sensoren angezeigt

## 📊 Sensoren

Die Integration erstellt folgende Sensoren:

### 1. VpMobile24 Next Lesson
- **State**: Nächste Unterrichtsstunde
- **Icon**: 🏫
- **Attributes**: Klasse, Stunde, Fach, Lehrer, Raum, Zeit, Info

### 2. VpMobile24 Today Schedule
- **State**: Anzahl der Stunden heute
- **Icon**: 📅
- **Attributes**: Kompletter Stundenplan, Klassen, Datum, Timestamp

### 3. VpMobile24 Changes
- **State**: Anzahl der Änderungen/Vertretungen
- **Icon**: ⚠️
- **Attributes**: Liste aller Stundenplanänderungen

### 4. VpMobile24 Week Schedule
- **State**: Wochenübersicht
- **Icon**: 📊
- **Attributes**: Stunden nach Wochentagen, Wochenstatistiken

## 📅 Kalender

### VpMobile24 Week Calendar
- **Vollständige Kalender-Integration** in Home Assistant
- **Wochenansicht** aller Unterrichtsstunden
- **Vertretungen markiert** mit 🔄
- **Detaillierte Ereignisse** mit Lehrer, Raum und Zusatzinfos
- **Timezone-aware** Events

## 🎨 Verwendung in Lovelace

### Einfache Karten

```yaml
type: entities
title: Stundenplan
entities:
  - sensor.vpmobile24_next_lesson
  - sensor.vpmobile24_today_schedule
  - sensor.vpmobile24_changes
  - sensor.vpmobile24_week_schedule
```

### Kalender-Karte

```yaml
type: calendar
entities:
  - calendar.vpmobile24_week_calendar
```

### Erweiterte Karte mit Attributen

```yaml
type: custom:auto-entities
card:
  type: entities
  title: Heutiger Stundenplan
filter:
  include:
    - entity_id: sensor.vpmobile24_today_schedule
      options:
        type: attribute
        attribute: lessons
        format: table
```

## 🎯 Fächerfilterung

Die Integration bietet intelligente Fächerfilterung:

- **Erweiterte Suche**: Scannt 4 Wochen (7 Tage zurück + 21 Tage voraus) nach allen Fächern
- **Intelligente Filterung**: Entfernt automatisch Kurscodes, Pausen und administrative Einträge
- **Alle Fächer verfügbar**: Zeigt sowohl Standard-Fächer (MA, DE, EN) als auch Kurscodes (5Dac, 5ENabc)
- **Einfache Auswahl**: Checkboxen mit allen gefundenen Fächern
- **Echtzeitfilterung**: Abgewählte Fächer werden aus allen Sensoren und dem Kalender entfernt

## 🔧 Technische Details

- **Datenquelle**: XML-Dateien von stundenplan24.de
- **Authentifizierung**: HTTP Basic Auth
- **Update-Intervall**: 15 Minuten
- **Unterstützte Systeme**: Alle stundenplan24.de Installationen
- **Abhängigkeiten**: aiohttp, lxml
- **Plattformen**: Sensor, Calendar
- **Home Assistant Version**: 2023.1+

## 🐛 Troubleshooting

### Fächerauswahl wird nicht angezeigt

1. **Klasse korrekt eingegeben?** (z.B. "5a", nicht "5A")
2. **Stundenplan verfügbar?** Prüfe manuell auf stundenplan24.de
3. **Logs prüfen**: Aktiviere Debug-Logs für `custom_components.vpmobile24`

### Verbindungsfehler

1. **Zugangsdaten prüfen**: Teste die Anmeldung direkt auf stundenplan24.de
2. **Schulnummer korrekt?**: Überprüfe die URL deiner Schule
3. **Netzwerk**: Stelle sicher, dass Home Assistant Internetzugang hat

### Debug-Logs aktivieren

Füge folgendes zu deiner `configuration.yaml` hinzu:

```yaml
logger:
  default: warning
  logs:
    custom_components.vpmobile24: debug
```

## 🤝 Beitragen

Beiträge sind willkommen! Bitte:

1. Forke das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushe zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📝 Changelog

### Version 1.0.0
- Erste Veröffentlichung
- Vollständige stundenplan24.de Integration
- Vier Sensoren für verschiedene Anwendungsfälle
- Kalender-Integration
- Intelligente Fächerfilterung
- Deutsche Lokalisierung

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## ⭐ Support

Wenn dir diese Integration gefällt, gib dem Repository einen Stern! ⭐

Bei Problemen oder Fragen, öffne bitte ein [Issue](https://github.com/DEIN-USERNAME/vpmobile24-ha/issues).

