[![HACS Badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![GitHub license](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/blob/main/LICENSE)

# VpMobile24 Home Assistant Integration

**Aktuelle Version:** `1.2.2`  
**Integrationstyp:** HACS Custom Integration  

Eine **Custom Integration** für Home Assistant, um Stundenpläne von [stundenplan24.de](https://www.stundenplan24.de) in Home Assistant einzubinden.

---

## Features

- Automatische Datenaktualisierung alle 15 Minuten  
- HTTP Basic Authentication für sichere Verbindung  
- XML-basierte Datenverarbeitung für zuverlässige Stundenplan-Extraktion  
- Änderungserkennung für Vertretungsstunden  
- Intelligente Fächerfilterung – wähle nur die gewünschten Fächer aus  
- Kalender-Integration für Wochenansicht  
- Vier verschiedene Sensoren für unterschiedliche Anwendungsfälle:  
- Deutsche Benutzeroberfläche mit vollständiger Lokalisierung  

---

## Installation

### Über HACS (empfohlen)

1. Öffne HACS in Home Assistant  
2. Gehe zu **Integrationen**  
3. Klicke auf die drei Punkte oben rechts → **Benutzerdefinierte Repositories**  
4. Füge die Repository-URL hinzu: `https://github.com/Maximilian-Andrew-Kluge/VpMobile24`  
5. Wähle Kategorie **Integration**  
6. Suche nach **VpMobile24** und installiere die Integration  
7. Starte Home Assistant neu  

### Manuell

1. Lade die neueste Version von den [Releases](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases) herunter  
2. Entpacke die Datei  
3. Kopiere den Ordner `custom_components/vpmobile24` in dein Home Assistant Verzeichnis `custom_components`  
4. Starte Home Assistant neu  
5. Gehe zu **Einstellungen > Geräte & Dienste > Integration hinzufügen**  
6. Suche nach **VpMobile24** und folge den Anweisungen  

---

## Konfiguration

### Benötigte Daten

- **Schulnummer**: ID deiner Schule (zu finden in der URL auf stundenplan24.de)  
- **Benutzername & Passwort**: Für die Authentifizierung  

### Optionen

- Auswahl der Fächer, die angezeigt werden sollen   
- Wahl der Sensoren für verschiedene Anwendungsfälle  

---

### Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

### Support

Wenn dir diese Integration gefällt, gib dem Repository einen Stern! ⭐

Bei Problemen oder Fragen, öffne bitte ein [Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues).





