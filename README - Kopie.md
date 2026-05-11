# VpMobile24 Home Assistant Integration

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
![Version](https://img.shields.io/badge/Version-2.4.0-blue.svg)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/57uvCeRw43)

![VpMobile24 Banner](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Banner.png)

<p align="center">
  <a href="https://maximilian-andrew-kluge.github.io/VpMobile24/website/">
    <img src="https://img.shields.io/badge/🌐_Besuche_die_Website-blue?style=for-the-badge" alt="Website">
  </a>
</p>

---

## 🚀 Installation über HACS (empfohlen)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge)

---

## ⚠️ Status

👉 **Beta-Version – aktiv in Entwicklung**

Diese Integration befindet sich in aktiver Entwicklung.  
Feedback, Fehlerberichte und Tests sind ausdrücklich erwünscht.

---

## 📌 Beschreibung

VpMobile24 ist eine Home Assistant Integration zur Verarbeitung von Stundenplan-Daten.

Ziel ist es, Stundenpläne direkt in Home Assistant verfügbar zu machen und übersichtlich darzustellen.

---

## 📸 Screenshots

### Übersicht

![Overview](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png)

---

### Lovelace Card

![Card](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png)

---

### Konfiguration

![Config](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png)

---

## ✨ Funktionen

### Integration
- 📅 Wochenübersicht (Mo–Fr)
- 🔄 automatischer Datenabruf (alle 15 Minuten)
- 👥 mehrere Klassen gleichzeitig möglich
- 📊 strukturierte Tages- und Wochensensoren
- ⚡ automatische Aktualisierung

### Lovelace Card
- 🎨 visuelle Konfiguration (kein YAML erforderlich)
- 📱 responsive Design (Mobile & Desktop)
- 🔥 heutiger Tag hervorgehoben
- ⛔ Vertretungen farblich markiert
- ⚙️ vollständig anpassbar
- 🌗 Theme-Unterstützung

---

## 📦 Installation

### HACS (empfohlen)

1. HACS öffnen
2. Menü (⋮) → „Benutzerdefiniertes Repository“
3. Repository hinzufügen: https://github.com/Maximilian-Andrew-Kluge/VpMobile24
4. Kategorie: **Integration**
5. Installieren
6. Home Assistant neu starten

---

### Manuelle Installation

1. Repository herunterladen
2. nach `/config/custom_components/vpmobile24/` kopieren
3. Home Assistant neu starten

---

## ⚙️ Einrichtung

1. Einstellungen → Geräte & Dienste
2. „Integration hinzufügen“
3. „VpMobile24“ auswählen
4. Zugangsdaten eingeben:
- Schul-ID
- Benutzername
- Passwort
- Klasse

---

## 📊 Erstellte Sensoren

- `sensor.vpmobile24_week_table`
- `sensor.vpmobile24_monday`
- `sensor.vpmobile24_tuesday`
- `sensor.vpmobile24_wednesday`
- `sensor.vpmobile24_thursday`
- `sensor.vpmobile24_friday`

---

## 🧩 Lovelace Card

Die Card wird automatisch installiert und kann über Ressourcen eingebunden werden:
