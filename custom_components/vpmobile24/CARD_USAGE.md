# VpMobile24 Stundenplan Card

Eine benutzerdefinierte Lovelace-Karte, die den Wochenstundenplan als Tabelle anzeigt - genau wie im Foto!

## Features

- **Wochenstundenplan-Tabelle**: Zeigt alle Wochentage (Mo-Fr) in einer übersichtlichen Tabelle
- **Heutiger Tag hervorgehoben**: Der aktuelle Tag wird blau hervorgehoben
- **Echte Stundendaten**: Zeigt die tatsächlichen Stunden für heute an
- **Pausen angezeigt**: Große Pausen (09:20-09:40, 11:15-11:40) werden korrekt dargestellt
- **Vertretungen markiert**: Vertretungsstunden werden rot hervorgehoben
- **Doppelstunden markiert**: Auto-generierte Doppelstunden werden gelb markiert
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **Theme-Integration**: Passt sich automatisch an das Home Assistant Theme an

## Installation

### Schritt 1: Card-Datei kopieren
Die Card ist bereits in der Integration enthalten. Nach der Installation der Integration ist die Card automatisch verfügbar.

### Schritt 2: Card zum Dashboard hinzufügen

1. Gehe zu deinem Home Assistant Dashboard
2. Klicke auf "Bearbeiten" (Stift-Symbol)
3. Klicke auf "Karte hinzufügen"
4. Scrolle nach unten zu "Benutzerdefinierte Karten"
5. Wähle "VpMobile24 Stundenplan Card"

### Schritt 3: Card konfigurieren

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_heutiger_stundenplan
title: "Stundenplan - Klasse 5a"
class_name: "5a"
```

## Konfiguration

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `entity` | string | **Erforderlich** | Die Entity-ID des Heutiger Stundenplan Sensors |
| `title` | string | "Stundenplan - Klasse 5a" | Titel der Karte |
| `class_name` | string | "5a" | Klassenname für die Anzeige |

## Beispiel-Konfigurationen

### Basis-Konfiguration
```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_heutiger_stundenplan
```

### Erweiterte Konfiguration
```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_heutiger_stundenplan
title: "Stundenplan - Klasse 2c"
class_name: "2c"
```

### Mehrere Klassen
```yaml
# Karte für Klasse 5a
type: custom:vpmobile24-card
entity: sensor.vpmobile24_heutiger_stundenplan
title: "Stundenplan - Klasse 5a"
class_name: "5a"

---

# Karte für Klasse 6b (falls mehrere Integrationen)
type: custom:vpmobile24-card
entity: sensor.vpmobile24_heutiger_stundenplan_2
title: "Stundenplan - Klasse 6b"
class_name: "6b"
```

## Aussehen

Die Card zeigt eine Tabelle mit:

- **Header**: "Stundenplan - Klasse [Name]" (blauer Hintergrund)
- **Spalten**: Stunde | Mo | Di | Mi | Do | Fr
- **Zeiten**: 
  - 1. 07:45-08:30
  - 2. 08:35-09:20
  - gr. Pause 09:20-09:40
  - 3. 09:40-10:25
  - 4. 10:30-11:15
  - gr. Pause 11:15-11:40
  - 5. 11:40-12:25
  - 6. 12:30-13:15

- **Heutiger Tag**: Blau hervorgehoben
- **Fächer**: Kurze Bezeichnungen (D, M, EN, etc.)
- **Vertretungen**: Rot markiert
- **Doppelstunden**: Gelb markiert

## Farb-Kodierung

- **Blau**: Heutiger Tag
- **Rot**: Vertretungsstunden (`ist_vertretung: true`)
- **Gelb**: Auto-generierte Doppelstunden (`ist_doppelstunde: true`)
- **Grau**: Pausen
- **Normal**: Reguläre Stunden

## Responsive Design

Die Card passt sich automatisch an verschiedene Bildschirmgrößen an:

- **Desktop**: Vollständige Tabelle mit allen Details
- **Tablet**: Kompaktere Darstellung
- **Mobile**: Minimale Padding, kleinere Schrift

## Fehlerbehebung

### Card wird nicht angezeigt
1. Stelle sicher, dass die VpMobile24 Integration installiert ist
2. Überprüfe, ob der Sensor `sensor.vpmobile24_heutiger_stundenplan` existiert
3. Leere den Browser-Cache (Strg+F5)

### Keine Daten in der Tabelle
1. Überprüfe, ob die Integration Daten empfängt
2. Schaue in die Sensor-Attribute: `stunden_heute`
3. Prüfe die Logs auf Fehler

### Falscher Tag hervorgehoben
Die Card erkennt automatisch den heutigen Tag. Bei Problemen:
1. Überprüfe die Systemzeit von Home Assistant
2. Stelle sicher, dass die Zeitzone korrekt ist

## Anpassungen

### Andere Zeiten
Du kannst die Zeiten in der Card anpassen, indem du die `timeSlots` Array in der JavaScript-Datei bearbeitest.

### Andere Fächer
Die Platzhalter-Fächer für andere Tage können in der `getPlaceholderSubject` Methode angepasst werden.

### Styling
Das Aussehen kann über CSS-Variablen angepasst werden:
- `--primary-color`: Hauptfarbe (Header, heutiger Tag)
- `--card-background-color`: Hintergrundfarbe
- `--divider-color`: Linienfarbe

## Version

**v2.0.0** - Komplette Neugestaltung als Wochenstundenplan-Tabelle

## Support

Bei Problemen oder Fragen:
1. Überprüfe die Home Assistant Logs
2. Stelle sicher, dass alle Sensoren funktionieren
3. Teste die Card mit der Basis-Konfiguration