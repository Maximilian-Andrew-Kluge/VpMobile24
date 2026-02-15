# VpMobile24 Home Assistant Integration

Eine vollständige Home Assistant Integration für VpMobile24 Vertretungspläne mit moderner Lovelace Card.

## Version

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)

## Features

### Integration
- ✅ Automatischer Abruf von Vertretungsplänen
- ✅ Wochentabellen-Sensor mit allen Stunden
- ✅ Tägliche Sensoren für jeden Wochentag
- ✅ Unterstützung für mehrere Klassen
- ✅ Automatische Updates

### Lovelace Card
- ✅ Moderne visuelle Konfiguration über Home Assistant UI
- ✅ Automatische Card-Registrierung (kein manuelles Kopieren nötig!)
- ✅ Wochenansicht (Montag bis Freitag)
- ✅ Anpassbarer Header mit Titel und Klassenname
- ✅ Hervorhebung des heutigen Tages
- ✅ Anzeige von Vertretungen (rot markiert)
- ✅ Konfigurierbare Uhrzeiten (1-10 Stunden)
- ✅ Konfigurierbare Pausen (0-5 Pausen)
- ✅ Theme-Integration (nutzt Home Assistant Themes)
- ✅ Responsive Design
- ✅ Sauberes, modernes Design

## Installation

### Manuelle Installation

1. Kopiere den `custom_components/vpmobile24` Ordner in dein Home Assistant `custom_components` Verzeichnis
2. Starte Home Assistant neu
3. Gehe zu **Einstellungen** → **Geräte & Dienste** → **Integration hinzufügen**
4. Suche nach "VpMobile24"
5. Folge dem Konfigurationsassistenten

### HACS Installation (empfohlen)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge)

1. Klicke auf den Badge oben oder:
2. Öffne HACS in Home Assistant
3. Gehe zu "Integrationen"
4. Klicke auf die drei Punkte oben rechts
5. Wähle "Benutzerdefinierte Repositories"
6. Füge hinzu: `https://github.com/Maximilian-Andrew-Kluge/VpMobile24`
7. Kategorie: `Integration`
8. Klicke auf "Hinzufügen"
9. Suche nach "VpMobile24" und installiere es
10. Starte Home Assistant neu

### Card installieren

**Neu in v2.1.0:** Die Card wird beim Start automatisch nach `/config/www/vpmobile24/` kopiert!

Siehe [CARD_INSTALLATION.md](CARD_INSTALLATION.md) für detaillierte Anweisungen.

**Kurzanleitung:**

1. Stelle sicher, dass die Integration installiert ist
2. Starte Home Assistant neu (Card wird automatisch kopiert)
3. Füge die Ressource hinzu:
   - **Einstellungen** → **Dashboards** → **Ressourcen** (⋮)
   - **+ Ressource hinzufügen**
   - URL: `/local/vpmobile24/vpmobile24-card.js`
   - Typ: `JavaScript-Modul`
4. Füge die Card zu deinem Dashboard hinzu

**Wichtig:** Die Card wird beim Start automatisch nach `/config/www/vpmobile24/` kopiert. Du musst nichts manuell kopieren!

## Konfiguration

### Integration

Die Integration wird über die UI konfiguriert. Du benötigst:
- VpMobile24 Schul-ID
- Benutzername
- Passwort
- Klassenname(n)

### Card

Die Card kann vollständig über die visuelle Oberfläche konfiguriert werden:

#### Basis-Einstellungen
- Week Table Sensor auswählen
- Header anzeigen (Toggle)
- Theme auswählen
- Heutigen Tag hervorheben (Toggle)
- Uhrzeiten anzeigen (Toggle)
- Eigene Uhrzeiten verwenden (Toggle)

#### Header-Einstellungen (Expandable)
- Titel anpassen
- Klassenname anpassen

#### Uhrzeiten-Anpassung (Expandable)
- Anzahl der Stunden (1-10)
- Anzahl der Pausen (0-5)
- Individuelle Uhrzeiten für jede Stunde
- Pausenzeiten und Position konfigurieren

## Beispiel-Konfiguration

### Einfache Konfiguration

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
show_header: true
header_settings:
  title: Stundenplan
  class_name: 5a
custom_theme: auto
highlight_today: true
show_time: true
use_custom_times: false
```

### Erweiterte Konfiguration mit eigenen Uhrzeiten

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
show_header: true
header_settings:
  title: Mein Stundenplan
  class_name: 10b
custom_theme: auto
highlight_today: true
show_time: true
use_custom_times: true
time_settings:
  lesson_count: 8
  pause_count: 3
  time_1: '08:00-08:45'
  time_2: '08:50-09:35'
  time_3: '09:55-10:40'
  time_4: '10:45-11:30'
  time_5: '11:50-12:35'
  time_6: '12:40-13:25'
  time_7: '13:30-14:15'
  time_8: '14:20-15:05'
  pause_1: '09:35-09:55'
  pause_1_after: 2
  pause_2: '11:30-11:50'
  pause_2_after: 4
  pause_3: '13:25-13:30'
  pause_3_after: 6
```

## Sensoren

Die Integration erstellt folgende Sensoren:

- `sensor.vpmobile24_week_table` - Komplette Wochentabelle
- `sensor.vpmobile24_monday` - Montag
- `sensor.vpmobile24_tuesday` - Dienstag
- `sensor.vpmobile24_wednesday` - Mittwoch
- `sensor.vpmobile24_thursday` - Donnerstag
- `sensor.vpmobile24_friday` - Freitag

## Troubleshooting

### Integration

**Problem**: Integration kann nicht hinzugefügt werden
- Überprüfe die Zugangsdaten
- Stelle sicher, dass die Schul-ID korrekt ist
- Prüfe die Logs unter **Einstellungen** → **System** → **Protokolle**

### Card

**Problem**: Card wird nicht angezeigt
1. Überprüfe, ob die VpMobile24 Integration installiert ist
2. Überprüfe, ob die Ressource korrekt hinzugefügt wurde
3. Versuche eine andere URL:
   - `/hacsfiles/vpmobile24/vpmobile24-card.js`
   - `/local/community/vpmobile24/vpmobile24-card.js`
   - `/local/vpmobile24/vpmobile24-card.js`
4. Leere den Browser-Cache (Strg+F5)
5. Starte Home Assistant neu

**Problem**: Änderungen werden nicht übernommen
1. Leere den Browser-Cache (Strg+F5)
2. Öffne die Browser-Konsole (F12) und prüfe auf Fehler
3. Stelle sicher, dass die neueste Version (v2.1.0) geladen wurde

**Problem**: Entity nicht gefunden
- Stelle sicher, dass die VpMobile24 Integration korrekt installiert ist
- Überprüfe, ob der Sensor `sensor.vpmobile24_week_table` existiert

## Design

Die Card verwendet ein schlichtes, modernes Design:
- 8px Border-Radius
- Keine Box-Shadow, nur Border
- Horizontale Trennlinien zwischen Zeilen
- 3px vertikale Trennlinie zwischen Stunden-Spalte und Tages-Spalten
- 1px vertikale Trennlinien zwischen Tages-Spalten
- Vollständige Theme-Integration
- Responsive für Mobile und Desktop

## Changelog

### v2.1.0 (2024)
**Card - Automatisches Deployment**

#### Neu
- Automatisches Kopieren der Card nach `/config/www/vpmobile24/` beim Start
- Keine manuelle Installation mehr nötig
- Einfache Ressourcen-URL: `/local/vpmobile24/vpmobile24-card.js`
- Ordner wird automatisch erstellt
- Card wird bei jedem Start aktualisiert

#### Verbessert
- Vereinfachte Installation
- Besseres Logging
- Zuverlässigere Deployment-Methode

### v2.0.1 (2024)
**Card - Automatische Registrierung (experimentell)**
- Versuch der automatischen Card-Registrierung
- Unterstützung für mehrere URL-Pfade

### v2.0.0 (2024)
**Integration & Card - Major Release**

#### Card Features
- Visuelle Konfiguration mit getConfigForm()
- Expandable Sektionen für Header und Uhrzeiten
- Unterstützung für verschachtelte Config-Objekte
- Theme-Integration (nutzt Home Assistant Themes)
- Vertikale Trennlinien zwischen Spalten
- Konfigurierbare Uhrzeiten (1-10 Stunden)
- Konfigurierbare Pausen (0-5 Pausen)
- Hervorhebung des heutigen Tages
- Vertretungen rot markiert
- Responsive Design
- Optimierte Performance

#### Integration Features
- Automatischer Abruf von Vertretungsplänen
- Wochentabellen-Sensor
- Tägliche Sensoren für jeden Wochentag
- Verbesserte Fehlerbehandlung
- Optimierte API-Aufrufe

## Support

Bei Problemen oder Fragen:
- Erstelle ein Issue auf GitHub: https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues
- Prüfe die Logs in Home Assistant
- Öffne die Browser-Konsole (F12) für Card-Probleme
- 💬 Discord Support Server: [Hier beitreten](https://discord.gg/24csAgGAhf)

## Lizenz

Siehe LICENSE Datei im Repository.

## Credits

Entwickelt für die VpMobile24 Plattform.


