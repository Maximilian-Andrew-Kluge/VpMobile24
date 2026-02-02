# Installation der VpMobile24 Integration

## 📋 Voraussetzungen

- Home Assistant 2023.1.0 oder höher
- Zugang zu einer stundenplan24.de Installation
- Gültige Anmeldedaten für stundenplan24.de

## 🚀 Installationsmethoden

### Methode 1: HACS (Empfohlen)

1. **HACS installieren** (falls noch nicht vorhanden):
   - Folge der [HACS Installationsanleitung](https://hacs.xyz/docs/setup/download)

2. **Repository hinzufügen**:
   - Öffne HACS in Home Assistant
   - Gehe zu "Integrationen"
   - Klicke auf die drei Punkte (⋮) oben rechts
   - Wähle "Benutzerdefinierte Repositories"
   - Füge die Repository-URL hinzu: `https://github.com/Maximilian-Andrew-Kluge/VpMobile24`
   - Wähle Kategorie: "Integration"
   - Klicke "Hinzufügen"

3. **Integration installieren**:
   - Suche nach "VpMobile24" in HACS
   - Klicke "Herunterladen"
   - Starte Home Assistant neu

### Methode 2: Manuelle Installation

1. **Download**:
   - Lade die neueste Version von [Releases](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases) herunter
   - Oder klone das Repository: `git clone https://github.com/Maximilian-Andrew-Kluge/VpMobile24.git`

2. **Dateien kopieren**:
   ```bash
   # Erstelle das custom_components Verzeichnis falls es nicht existiert
   mkdir -p /config/custom_components
   
   # Kopiere die Integration
   cp -r VpMobile24/custom_components/vpmobile24 /config/custom_components/
   ```

3. **Home Assistant neustarten**:
   - Gehe zu Entwicklertools > YAML > Neu starten
   - Oder starte Home Assistant über dein System neu

## ⚙️ Konfiguration

### Schritt 1: Integration hinzufügen

1. Gehe zu **Einstellungen** > **Geräte & Dienste**
2. Klicke auf **"Integration hinzufügen"**
3. Suche nach **"VpMobile24"**
4. Klicke auf die Integration

### Schritt 2: Zugangsdaten eingeben

Du benötigst folgende Informationen:

#### Schulnummer finden
1. Gehe auf die stundenplan24.de Seite deiner Schule
2. Die URL sieht so aus: `https://www.stundenplan24.de/SCHULNUMMER/mobil/plankl.html`
3. Die **SCHULNUMMER** ist die Zahl in der URL (z.B. "12345678")

#### Anmeldedaten
- **Nutzername**: Dein Benutzername für stundenplan24.de
- **Passwort**: Dein Passwort für stundenplan24.de
- **Klasse**: Deine Klasse (z.B. "5a", "10b", "Q1")

### Schritt 3: Fächer auswählen

1. Die Integration scannt automatisch **4 Wochen** nach allen verfügbaren Fächern
2. Du siehst eine Liste aller gefundenen Fächer
3. **Deaktiviere** die Fächer, die du **NICHT** in den Sensoren sehen möchtest
4. Alle anderen Fächer werden in den Sensoren und im Kalender angezeigt

## 🔍 Verifizierung

Nach der Installation solltest du folgende Entitäten sehen:

### Sensoren
- `sensor.vpmobile24_next_lesson`
- `sensor.vpmobile24_today_schedule`
- `sensor.vpmobile24_changes`
- `sensor.vpmobile24_week_schedule`

### Kalender
- `calendar.vpmobile24_week_calendar`

## 🐛 Problembehandlung

### Integration wird nicht gefunden
- Stelle sicher, dass du Home Assistant nach der Installation neugestartet hast
- Überprüfe, dass die Dateien im richtigen Verzeichnis sind: `/config/custom_components/vpmobile24/`

### Anmeldung schlägt fehl
1. **Teste deine Anmeldedaten** direkt auf stundenplan24.de
2. **Überprüfe die Schulnummer** in der URL
3. **Aktiviere Debug-Logs**:
   ```yaml
   # configuration.yaml
   logger:
     default: warning
     logs:
       custom_components.vpmobile24: debug
   ```

### Keine Fächer gefunden
1. **Überprüfe die Klasse**: Groß-/Kleinschreibung beachten (z.B. "5a" nicht "5A")
2. **Prüfe den Stundenplan**: Ist für deine Klasse ein Stundenplan verfügbar?
3. **Warte auf Schultage**: Die Integration scannt nur Schultage, nicht Wochenenden

## 📞 Support

Bei Problemen:
1. Überprüfe die [Troubleshooting Sektion](README.md#-troubleshooting)
2. Aktiviere Debug-Logs und überprüfe die Logs
3. Öffne ein [Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) mit detaillierten Informationen