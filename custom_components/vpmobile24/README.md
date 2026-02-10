# 🎓 VpMobile24 Home Assistant Integration

Eine vollständige Home Assistant Integration für stundenplan24.de Stundenpläne.

## ✨ Features

### 📊 **4 Intelligente Sensoren**
- **🕐 Nächste Stunde**: Zeigt die nächste Unterrichtsstunde mit Details
- **📅 Heutiger Stundenplan**: Alle verbleibenden Stunden des Tages
- **ℹ️ Zusatzinfos**: Wichtige Schulinformationen und Ankündigungen
- **🔄 Änderungen**: Vertretungen und Stundenplanänderungen

### 📅 **Wochenkalender**
- **Vollständige Kalender-Integration** in Home Assistant
- **Wochenansicht** aller Unterrichtsstunden (Montag-Freitag)
- **Vertretungen markiert** mit 🔄 Symbol
- **Detaillierte Ereignisse** mit Lehrer, Raum und Zusatzinfos

### 🎯 **Intelligente Fächerfilterung**
- **Erweiterte Suche**: Scannt 4 Wochen nach allen verfügbaren Fächern
- **Individuelle Auswahl**: Wähle nur die Fächer die du sehen möchtest
- **Automatische Filterung**: Abgewählte Fächer werden aus allen Sensoren entfernt

### 🌍 **Mehrsprachig**
- **Deutsch** (Standard): Vollständige deutsche Lokalisierung
- **English**: Complete English localization
- **Français**: Localisation française complète

### 🎨 **Custom Dashboard Card**
- **Speziell entwickelte Lovelace-Karte** für optimale Darstellung
- **Responsive Design**: Desktop und Mobile optimiert
- **Theme-Integration**: Verwendet automatisch dein Home Assistant Theme
- **Interaktiv**: Klickbare Bereiche für Details

## 🚀 Installation

### HACS (Empfohlen)
1. Öffne HACS in Home Assistant
2. Gehe zu "Integrationen"
3. Klicke auf die drei Punkte oben rechts → "Benutzerdefinierte Repositories"
4. Füge diese Repository-URL hinzu: `https://github.com/Maximilian-Andrew-Kluge/VpMobile24`
5. Wähle Kategorie "Integration"
6. Suche nach "VpMobile24" und installiere es
7. Starte Home Assistant neu

### Manuelle Installation
1. Lade die neueste Version herunter
2. Entpacke die Datei
3. Kopiere den `custom_components/vpmobile24` Ordner in dein Home Assistant `custom_components` Verzeichnis
4. Starte Home Assistant neu

## ⚙️ Konfiguration

### Benötigte Daten
- **Schulnummer**: Die ID deiner Schule (findest du in der URL)
- **Nutzername**: Dein Benutzername für stundenplan24.de
- **Passwort**: Dein Passwort für stundenplan24.de
- **Klasse**: Die Klasse (z.B. "5a", "10b", "Q1") - **Pflichtfeld**

### Einrichtung
1. **Integration hinzufügen**: Einstellungen → Geräte & Dienste → "Integration hinzufügen" → "VpMobile24"
2. **Grunddaten eingeben**: Schulnummer, Nutzername, Passwort, Klasse
3. **Fächer auswählen**: Wähle die Fächer ab, die du NICHT sehen möchtest
4. **Sprache wählen**: Deutsch, English oder Français

## 📱 Custom Dashboard Card

### Installation der Karte
1. Kopiere `card.js` nach `config/www/vpmobile24/vpmobile24-card.js`
2. Füge Ressource hinzu: Einstellungen → Dashboards → Ressourcen
3. URL: `/local/vpmobile24/vpmobile24-card.js`, Typ: JavaScript-Modul
4. Home Assistant neu starten

### Verwendung
```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_nachste_stunde
title: "📚 Mein Stundenplan"
```

## 📊 Sensoren

### VpMobile24 Nächste Stunde
- **State**: Nächste Unterrichtsstunde
- **Attributes**: Fach, Zeit, Lehrer, Raum, Zusatzinfo, Vertretung

### VpMobile24 Heutiger Stundenplan
- **State**: Anzahl verbleibender Stunden heute
- **Attributes**: Liste aller heutigen Stunden mit Details

### VpMobile24 Zusatzinfos
- **State**: Anzahl verfügbarer Zusatzinformationen
- **Attributes**: Allgemeine Infos und stundenspezifische Informationen

### VpMobile24 Änderungen
- **State**: Anzahl der Änderungen/Vertretungen
- **Attributes**: Liste aller Änderungen (nur für ausgewählte Fächer)

## 📅 Kalender

### VpMobile24 Week Calendar
- **Vollständige Wochenansicht** (Montag-Freitag)
- **Nur ausgewählte Fächer** werden angezeigt
- **Vertretungen** mit 🔄 Symbol markiert
- **Detaillierte Ereignisse** mit allen Informationen

## 🎨 Dashboard-Beispiele

### Einfache Entities-Karte
```yaml
type: entities
title: 🎒 Stundenplan
entities:
  - sensor.vpmobile24_nachste_stunde
  - sensor.vpmobile24_heutiger_stundenplan
  - sensor.vpmobile24_anderungen
  - sensor.vpmobile24_zusatzinfos
```

### Kalender-Karte
```yaml
type: calendar
entities:
  - calendar.vpmobile24_week_calendar
initial_view: listWeek
```

### Custom VpMobile24 Card
```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_nachste_stunde
title: "📚 Stundenplan - Klasse 5a"
```

## 🔧 Technische Details

- **Datenquelle**: XML-Dateien von stundenplan24.de
- **Authentifizierung**: HTTP Basic Auth
- **Update-Intervall**: 15 Minuten
- **Unterstützte Systeme**: Alle stundenplan24.de Installationen
- **Home Assistant Version**: 2023.1+

## 🐛 Troubleshooting

### Fächerauswahl wird nicht angezeigt
1. Klasse korrekt eingegeben? (z.B. "5a", nicht "5A")
2. Stundenplan verfügbar? Prüfe manuell auf stundenplan24.de
3. Logs prüfen: `custom_components.vpmobile24: debug`

### Verbindungsfehler
1. Zugangsdaten prüfen: Teste die Anmeldung direkt auf stundenplan24.de
2. Schulnummer korrekt? Überprüfe die URL deiner Schule
3. Netzwerk: Stelle sicher, dass Home Assistant Internetzugang hat

### Debug-Logs aktivieren
```yaml
logger:
  default: warning
  logs:
    custom_components.vpmobile24: debug
```

## 📝 Changelog

### Version 1.4.5
- ✅ Kalender-Wochenansicht mit Fächerfilterung
- ✅ Heute-fokussierte Sensoren
- ✅ Custom Dashboard Card
- ✅ Optimierte API-Aufrufe
- ✅ Verbesserte Fehlerbehandlung

## 📄 Lizenz

MIT License - siehe LICENSE Datei für Details.

## ⭐ Support

Wenn dir diese Integration gefällt, gib dem Repository einen Stern! ⭐

Bei Problemen oder Fragen, öffne bitte ein Issue auf GitHub.

---

**Entwickelt mit ❤️ für die Home Assistant Community**