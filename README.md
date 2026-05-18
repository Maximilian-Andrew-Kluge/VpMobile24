# VpMobile24 Home Assistant Integration

<p align="center">
  <a href="#english">
    <img src="https://img.shields.io/badge/⬇️_Jump_to_English-blue?style=for-the-badge" alt="English Button">
  </a>
</p>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
![Version](https://img.shields.io/badge/Version-2.4.2-blue.svg)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/57uvCeRw43)

![VpMobile24 Banner](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Banner.png)

<p align="center">
  <a href="https://maximilian-andrew-kluge.github.io/VpMobile24/website/">
    <img src="https://img.shields.io/badge/🌐_Visit_the_Website-blue?style=for-the-badge" alt="Website">
  </a>
</p>

---

## 🇩🇪 Deutsch

## 🚀 Installation über HACS (empfohlen)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge)

---

## ⚠️ Status

👉 **Beta-Version – aktiv in Entwicklung**

Diese Integration befindet sich in aktiver Entwicklung. Feedback, Fehlerberichte und Tests sind ausdrücklich erwünscht.

---

## 📌 Beschreibung

VpMobile24 ist eine Home Assistant Integration zur Verarbeitung von Stundenplan-Daten.

Ziel ist es, Stundenpläne direkt in Home Assistant verfügbar zu machen und übersichtlich darzustellen.

---

## 📸 Screenshots

### Übersicht

![Overview](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png)

### Lovelace Card

![Card](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png)

### Konfiguration

![Config](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png)

---

## ✨ Funktionen

### Integration
- 📅 Wochenübersicht (Mo–Fr)
- 🔄 automatischer Datenabruf (alle 15 Minuten)
- 👥 mehrere Klassen möglich
- 📊 strukturierte Tages- und Wochensensoren
- ⚡ automatische Updates

### Lovelace Card
- 🎨 visuelle Konfiguration (kein YAML)
- 📱 responsiv (Mobile & Desktop)
- 🔥 heutiger Tag hervorgehoben
- ⛔ Vertretungen farblich markiert
- ⚙️ vollständig anpassbar

---

## 📦 Installation

### HACS

1. HACS öffnen
2. Menü (⋮) → Custom Repository
3. Repository hinzufügen: https://github.com/Maximilian-Andrew-Kluge/VpMobile24
4. Kategorie: Integration
5. Installieren
6. Neustart

### Manuell

1. Repo herunterladen
2. nach `/config/custom_components/vpmobile24/` kopieren
3. Neustart

---

## ⚙️ Einrichtung

- Einstellungen → Geräte & Dienste
- Integration hinzufügen
- VpMobile24 auswählen
- Zugangsdaten eingeben (Schule, User, Passwort, Klasse)

---

## 📊 Sensoren

- `sensor.vpmobile24_week_table`
- `sensor.vpmobile24_monday`
- `sensor.vpmobile24_tuesday`
- `sensor.vpmobile24_wednesday`
- `sensor.vpmobile24_thursday`
- `sensor.vpmobile24_friday`

---

---

<a name="english"></a>

## 🇬🇧 English

## 🚀 Installation via HACS (recommended)

Follow the same steps as above using HACS.

---

## ⚠️ Status

👉 **Beta version – actively in development**

This integration is under active development. Feedback, bug reports, and testing are welcome.

---

## 📌 Description

VpMobile24 is a Home Assistant integration for processing timetable data.

The goal is to bring school timetables directly into Home Assistant and display them in a clear structured way.

---

## 📸 Screenshots

### Overview

![Overview](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png)

### Lovelace Card

![Card](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png)

### Configuration

![Config](https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png)

---

## ✨ Features

### Integration
- 📅 Weekly overview (Mon–Fri)
- 🔄 automatic refresh (every 15 minutes)
- 👥 multiple classes supported
- 📊 structured sensors per day/week
- ⚡ automatic updates

### Lovelace Card
- 🎨 visual configuration (no YAML)
- 📱 responsive design
- 🔥 highlights current day
- ⛔ marks substitutions
- ⚙️ fully customizable

---

## 📦 Installation

### HACS

1. Open HACS
2. Go to Custom Repositories
3. Add: https://github.com/Maximilian-Andrew-Kluge/VpMobile24
4. Install Integration
5. Restart Home Assistant

### Manual

1. Download repository
2. Copy to `/config/custom_components/vpmobile24/`
3. Restart Home Assistant

---

## ⚙️ Setup

- Settings → Devices & Services
- Add Integration
- Select VpMobile24
- Enter credentials (school, user, password, class)

---

## 📊 Sensors

- `sensor.vpmobile24_week_table`
- `sensor.vpmobile24_monday`
- `sensor.vpmobile24_tuesday`
- `sensor.vpmobile24_wednesday`
- `sensor.vpmobile24_thursday`
- `sensor.vpmobile24_friday`

