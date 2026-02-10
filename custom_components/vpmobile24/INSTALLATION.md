# 🚀 VpMobile24 Installation Guide

## 📦 Schnelle Installation

### Schritt 1: Integration installieren
1. Kopiere den kompletten `custom_components/vpmobile24` Ordner in dein Home Assistant `config/custom_components/` Verzeichnis
2. Starte Home Assistant neu

### Schritt 2: Integration konfigurieren
1. Gehe zu **Einstellungen** → **Geräte & Dienste**
2. Klicke auf **+ INTEGRATION HINZUFÜGEN**
3. Suche nach **"VpMobile24"**
4. Folge dem Konfigurationsassistenten:
   - **Schulnummer**: z.B. "10213745"
   - **Nutzername**: Dein stundenplan24.de Benutzername
   - **Passwort**: Dein stundenplan24.de Passwort
   - **Klasse**: z.B. "5a" (Pflichtfeld!)
   - **Fächer auswählen**: Wähle ab, was du NICHT sehen möchtest
   - **Sprache**: Deutsch, English oder Français

### Schritt 3: Custom Card installieren (Optional)
1. Kopiere `card.js` nach `config/www/vpmobile24/vpmobile24-card.js`
2. Gehe zu **Einstellungen** → **Dashboards** → **Ressourcen**
3. Klicke **+ RESSOURCE HINZUFÜGEN**
4. URL: `/local/vpmobile24/vpmobile24-card.js`
5. Typ: **JavaScript-Modul**
6. Home Assistant neu starten

## 📊 Verfügbare Entitäten

Nach der Installation sind folgende Entitäten verfügbar:

### Sensoren
- `sensor.vpmobile24_nachste_stunde` - Nächste Unterrichtsstunde
- `sensor.vpmobile24_heutiger_stundenplan` - Heutiger Stundenplan
- `sensor.vpmobile24_zusatzinfos` - Zusätzliche Informationen
- `sensor.vpmobile24_anderungen` - Änderungen und Vertretungen

### Kalender
- `calendar.vpmobile24_week_calendar` - Wochenkalender

### Gerät
- `VpMobile24 (Schulnummer)` - Hauptgerät mit allen Entitäten

## 🎨 Dashboard-Karten

### Standard Entities-Karte
```yaml
type: entities
title: 📚 Stundenplan
entities:
  - sensor.vpmobile24_nachste_stunde
  - sensor.vpmobile24_heutiger_stundenplan
  - sensor.vpmobile24_zusatzinfos
  - sensor.vpmobile24_anderungen
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
title: "📚 Mein Stundenplan - Klasse 5a"
```

## 🔧 Erweiterte Konfiguration

### Debug-Logs aktivieren
Füge das in deine `configuration.yaml` ein:
```yaml
logger:
  default: warning
  logs:
    custom_components.vpmobile24: debug
```

### Update-Intervall ändern
Das Update-Intervall ist standardmäßig auf 15 Minuten eingestellt und kann nicht über die UI geändert werden.

## 🐛 Häufige Probleme

### "Integration nicht gefunden"
- ✅ Home Assistant neu gestartet?
- ✅ Ordner `custom_components/vpmobile24` existiert?
- ✅ Alle Dateien korrekt kopiert?

### "Fächerauswahl wird nicht angezeigt"
- ✅ Klasse korrekt eingegeben? (z.B. "5a", nicht "5A")
- ✅ Zugangsdaten korrekt?
- ✅ Stundenplan auf stundenplan24.de verfügbar?

### "Sensoren nicht verfügbar"
- ✅ Integration korrekt konfiguriert?
- ✅ Logs auf Fehler prüfen
- ✅ Netzwerkverbindung zu stundenplan24.de?

### "Custom Card funktioniert nicht"
- ✅ Ressource hinzugefügt?
- ✅ Home Assistant nach Ressource neu gestartet?
- ✅ Datei unter `/local/vpmobile24/vpmobile24-card.js` erreichbar?

## 📁 Datei-Struktur

Nach der Installation sollte deine Struktur so aussehen:

```
config/
├── custom_components/
│   └── vpmobile24/
│       ├── __init__.py
│       ├── sensor.py
│       ├── calendar.py
│       ├── config_flow.py
│       ├── const.py
│       ├── api_new.py
│       ├── manifest.json
│       ├── strings.json
│       ├── card.js
│       ├── translations/
│       │   ├── de.json
│       │   ├── en.json
│       │   └── fr.json
│       └── README.md
└── www/                          # Für Custom Card
    └── vpmobile24/
        └── vpmobile24-card.js    # Kopie von card.js
```

## ✅ Installation erfolgreich?

Nach erfolgreicher Installation solltest du:
- ✅ 4 Sensoren sehen
- ✅ 1 Kalender haben
- ✅ 1 Gerät mit allen Entitäten
- ✅ Die Custom Card verwenden können

## 🎉 Fertig!

Deine VpMobile24 Integration ist jetzt einsatzbereit! 

**Viel Spaß mit deinem intelligenten Stundenplan in Home Assistant!** 📚✨