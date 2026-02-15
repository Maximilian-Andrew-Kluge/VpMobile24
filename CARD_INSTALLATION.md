# VpMobile24 Stundenplan Card - Installation

Eine moderne Lovelace Card für Home Assistant zur Anzeige des Wochenstundenplans mit visueller Konfiguration.

## Version

**v2.1.0** - Automatic Card Deployment

## Features

- ✅ Visuelle Konfiguration über Home Assistant UI
- ✅ Wochenansicht (Montag bis Freitag)
- ✅ Anpassbarer Header mit Titel und Klassenname
- ✅ Hervorhebung des heutigen Tages
- ✅ Anzeige von Vertretungen (rot markiert)
- ✅ Konfigurierbare Uhrzeiten (1-10 Stunden)
- ✅ Konfigurierbare Pausen (0-5 Pausen)
- ✅ Theme-Integration (nutzt Home Assistant Themes)
- ✅ Responsive Design
- ✅ Sauberes, modernes Design ohne Animationen

## Installation

### Schritt 1: Integration installieren

Die Card wird automatisch mit der VpMobile24 Integration installiert. Stelle sicher, dass die Integration korrekt eingerichtet ist.

### Schritt 2: Ressource in Home Assistant hinzufügen

Die Card wird beim Start von Home Assistant automatisch nach `/config/www/vpmobile24/` kopiert!

1. Gehe zu **Einstellungen** → **Dashboards** → **Ressourcen** (oben rechts, 3 Punkte)
2. Klicke auf **+ Ressource hinzufügen**
3. Trage ein:
   - **URL**: `/local/vpmobile24/vpmobile24-card.js`
   - **Ressourcentyp**: `JavaScript-Modul`
4. Klicke auf **Erstellen**

**Wichtig:** Die Card wird beim Start automatisch kopiert. Du musst NICHTS manuell kopieren!

### Schritt 3: Card hinzufügen

1. Öffne dein Dashboard
2. Klicke auf **Bearbeiten** (oben rechts)
3. Klicke auf **+ Karte hinzufügen**
4. Suche nach **VpMobile24 Card** oder wähle **Benutzerdefiniert: VpMobile24 Card**
5. Konfiguriere die Card über die visuelle Oberfläche

## Konfiguration

### Basis-Einstellungen

| Option | Beschreibung | Standard |
|--------|--------------|----------|
| **Week Table Sensor** | Der VpMobile24 Week Table Sensor | `sensor.vpmobile24_week_table` |
| **Header anzeigen** | Zeigt den Header mit Titel und Klassenname | `true` |
| **Theme** | Wähle ein installiertes Theme | `auto` |
| **Heutigen Tag hervorheben** | Hebt die Spalte des heutigen Tages hervor | `true` |
| **Uhrzeiten anzeigen** | Zeigt die Uhrzeiten für jede Stunde | `true` |
| **Eigene Uhrzeiten verwenden** | Aktiviert die Uhrzeiten-Anpassung | `false` |

### Header-Einstellungen

Expandable Sektion, nur sichtbar wenn "Header anzeigen" aktiviert ist.

| Option | Beschreibung | Standard |
|--------|--------------|----------|
| **Titel** | Titel der Card | `Stundenplan` |
| **Klassenname** | Name der Klasse | `5a` |

### Uhrzeiten-Anpassung

Expandable Sektion, nur sichtbar wenn "Eigene Uhrzeiten verwenden" aktiviert ist.

| Option | Beschreibung | Standard |
|--------|--------------|----------|
| **Anzahl der Stunden** | Wie viele Stunden angezeigt werden (1-10) | `6` |
| **Anzahl der Pausen** | Wie viele Pausen angezeigt werden (0-5) | `2` |
| **1.-10. Stunde** | Uhrzeiten im Format HH:MM-HH:MM | `07:45-08:30` etc. |
| **1.-5. Pause - Zeit** | Pausenzeiten im Format HH:MM-HH:MM | `09:20-09:40` etc. |
| **1.-5. Pause - Nach Stunde** | Nach welcher Stunde die Pause kommt | `2`, `4`, etc. |

## Standard-Uhrzeiten

Wenn "Eigene Uhrzeiten verwenden" deaktiviert ist, werden folgende Standard-Uhrzeiten verwendet:

| Stunde | Zeit |
|--------|------|
| 1. Stunde | 07:45-08:30 |
| 2. Stunde | 08:35-09:20 |
| **Pause** | 09:20-09:40 |
| 3. Stunde | 09:40-10:25 |
| 4. Stunde | 10:30-11:15 |
| **Pause** | 11:15-11:40 |
| 5. Stunde | 11:40-12:25 |
| 6. Stunde | 12:30-13:15 |

## Beispiel-Konfiguration (YAML)

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

## Beispiel mit eigenen Uhrzeiten

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

## Troubleshooting

### Card wird nicht angezeigt

1. Überprüfe, ob die VpMobile24 Integration installiert ist
2. Überprüfe, ob die Ressource korrekt hinzugefügt wurde
3. Versuche eine andere URL aus der Liste oben
4. Leere den Browser-Cache (Strg+F5)
5. Starte Home Assistant neu

### Änderungen werden nicht übernommen

1. Leere den Browser-Cache (Strg+F5)
2. Öffne die Browser-Konsole (F12) und prüfe auf Fehler
3. Stelle sicher, dass die neueste Version (v2.1.0) geladen wurde

### Entity nicht gefunden

Stelle sicher, dass die VpMobile24 Integration korrekt installiert ist und der Sensor `sensor.vpmobile24_week_table` existiert.

### Ressource nicht gefunden (404 Fehler)

Wenn du einen 404-Fehler bekommst:
1. Stelle sicher, dass die Integration installiert und geladen ist
2. Starte Home Assistant neu
3. Versuche eine andere URL aus der Liste oben
4. Prüfe die Logs unter Einstellungen → System → Protokolle

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
- **Automatisches Kopieren der Card**: Card wird beim Start automatisch nach `/config/www/vpmobile24/` kopiert
- Keine manuelle Installation mehr nötig
- Einfache Ressourcen-URL: `/local/vpmobile24/vpmobile24-card.js`
- Verbesserte Fehlerbehandlung
- Besseres Logging

### v2.0.1 (2024)
- Versuch der automatischen Card-Registrierung
- Unterstützung für mehrere URL-Pfade
- Verbesserte Dokumentation

### v2.0.0 (2024)
- Production Release
- Visuelle Konfiguration mit getConfigForm()
- Expandable Sektionen für Header und Uhrzeiten
- Unterstützung für verschachtelte Config-Objekte
- Theme-Integration
- Vertikale Trennlinien
- Konfigurierbare Uhrzeiten (1-10 Stunden)
- Konfigurierbare Pausen (0-5 Pausen)
- Verbesserte Abwärtskompatibilität
- Optimierte Performance

## Support

Bei Problemen oder Fragen erstelle bitte ein Issue auf GitHub:
https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues

## Lizenz

Siehe LICENSE Datei im Repository.
