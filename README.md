<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Banner.png" alt="VpMobile24 Logo"/>

<br />

# VpMobile24

### Home Assistant Integration für Stundenpläne

Verbinde dein Schulportal mit Home Assistant — automatisch aktualisiert,<br/>
mehrere Klassen, vollständig anpassbare Lovelace Card. Kein YAML nötig.

<br />

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![Release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg?style=flat-square&label=Release)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Version](https://img.shields.io/badge/Version-2.4.2-blue?style=flat-square)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Status](https://img.shields.io/badge/Status-Beta-orange?style=flat-square)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24)
[![License](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24?style=flat-square)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/57uvCeRw43)

<br />

[📦 Via HACS installieren](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge) &nbsp;·&nbsp;
[🌐 Website](https://maximilian-andrew-kluge.github.io/VpMobile24/website/) &nbsp;·&nbsp;
[💬 Discord](https://discord.gg/57uvCeRw43) &nbsp;·&nbsp;
[🐛 Bug melden](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

<br />

---

**[🇩🇪 Deutsch](#-deutsch)** &nbsp;|&nbsp; **[🇬🇧 English](#-english)**

---

</div>

<br />

## 🇩🇪 Deutsch

> [!WARNING]
> **Beta-Version** — aktiv in Entwicklung. Feedback, Fehlerberichte und Ideen sind jederzeit willkommen — gerne als [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) oder auf [Discord](https://discord.gg/57uvCeRw43).

<br />

### Inhaltsverzeichnis

- [Beschreibung](#-beschreibung)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Einrichtung](#️-einrichtung)
- [Sensoren](#-sensoren)
- [Mitmachen](#-mitmachen)

<br />

---

### 📌 Beschreibung

**VpMobile24** ist eine Home Assistant Custom Integration, die Stundenplandaten direkt in dein Smart Home bringt.

Das Ziel: Stundenpläne sollen ohne Umwege in Home Assistant sichtbar sein — als strukturierte Sensoren, die du in Automationen, Dashboards und Benachrichtigungen nutzen kannst. Die mitgelieferte Lovelace Card macht alles sofort nutzbar, ohne eine Zeile YAML.

<br />

---

### ✨ Features

<table>
<tr>
<td width="50%">

**Integration**

- 📅 Wochenübersicht (Mo–Fr)
- 🔄 Automatischer Datenabruf alle 15 Minuten
- 👥 Mehrere Klassen gleichzeitig unterstützt
- 📊 Strukturierte Tages- und Wochensensoren
- ⚡ Automatische Updates via HACS

</td>
<td width="50%">

**Lovelace Card**

- 🎨 Visuelle Konfiguration (kein YAML)
- 📱 Responsives Design für Mobile & Desktop
- 🔥 Heutiger Tag wird hervorgehoben
- ⛔ Vertretungen farblich markiert
- ⚙️ Vollständig anpassbar

</td>
</tr>
</table>

<br />

---

### 📸 Screenshots

<table>
<tr>
  <td align="center"><b>Übersicht</b></td>
  <td align="center"><b>Lovelace Card</b></td>
  <td align="center"><b>Konfiguration</b></td>
</tr>
<tr>
  <td><img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png" alt="Overview" /></td>
  <td><img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png" alt="Card" /></td>
  <td><img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png" alt="Config" /></td>
</tr>
</table>

<br />

---

### 📦 Installation

#### Via HACS (empfohlen)

[![HACS installieren](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge)

1. **HACS öffnen** — in Home Assistant zu HACS navigieren
2. **Custom Repository hinzufügen** — Menü (⋮) → Custom Repositories
3. **URL eingeben:**
   ```
   https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
   Kategorie: `Integration`
4. **Installieren** — Integration suchen und installieren
5. **Neu starten** — Home Assistant neu starten

#### Manuelle Installation

1. Repository als ZIP herunterladen oder klonen:
   ```bash
   git clone https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
2. Inhalt von `custom_components/vpmobile24/` nach `/config/custom_components/vpmobile24/` kopieren
3. Home Assistant neu starten

<br />

---

### ⚙️ Einrichtung

1. **Einstellungen** → **Geräte & Dienste**
2. Unten rechts auf **Integration hinzufügen** klicken
3. **VpMobile24** suchen und auswählen
4. Zugangsdaten eingeben:

| Feld | Beschreibung |
|------|--------------|
| `Schule` | Schulkennung im VpMobile24-Portal |
| `Benutzername` | Dein Anmeldename |
| `Passwort` | Dein Passwort |
| `Klasse` | Klassenkennung (z.B. `10a`) |

> [!TIP]
> Mehrere Klassen können durch das erneute Hinzufügen der Integration mit anderen Zugangsdaten eingebunden werden.

<br />

---

### 📊 Sensoren

Nach der Einrichtung werden folgende Sensoren automatisch erstellt:

| Sensor | Beschreibung |
|--------|--------------|
| `sensor.vpmobile24_week_table` | Vollständige Wochenübersicht |
| `sensor.vpmobile24_monday` | Stundenplan Montag |
| `sensor.vpmobile24_tuesday` | Stundenplan Dienstag |
| `sensor.vpmobile24_wednesday` | Stundenplan Mittwoch |
| `sensor.vpmobile24_thursday` | Stundenplan Donnerstag |
| `sensor.vpmobile24_friday` | Stundenplan Freitag |

Alle Sensoren werden automatisch alle **15 Minuten** aktualisiert.

<br />

---

### 🤝 Mitmachen

Contributions sind herzlich willkommen! So kannst du beitragen:

- 🐛 **Bug gefunden?** → [Issue erstellen](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)
- 💡 **Idee?** → [Diskussion starten](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/discussions)
- 🔧 **Code beitragen** → Fork → Branch → Pull Request
- 💬 **Community** → [Discord beitreten](https://discord.gg/57uvCeRw43)

<br />

---

<br />
<br />

## 🇬🇧 English

<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Discord%20Banner/Banner%20Neu%20dark%20en.png" alt="VpMobile24 Logo"/>

<br />

# VpMobile24

### Home Assistant Integration for Timetables

Connect your school portal to Home Assistant — automatically updated,<br/>
multiple classes, fully customizable Lovelace Card. No YAML required.

<br />

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![Release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg?style=flat-square&label=Release)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Version](https://img.shields.io/badge/Version-2.4.2-blue?style=flat-square)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Status](https://img.shields.io/badge/Status-Beta-orange?style=flat-square)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24)
[![License](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24?style=flat-square)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/57uvCeRw43)

[📦 Install via HACS](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge) &nbsp;·&nbsp;
[🌐 Website](https://maximilian-andrew-kluge.github.io/VpMobile24/website/) &nbsp;·&nbsp;
[💬 Discord](https://discord.gg/57uvCeRw43) &nbsp;·&nbsp;
[🐛 Report a bug](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

</div>

<br />

> [!WARNING]
> **Beta version** — actively in development. Feedback, bug reports, and ideas are always welcome — open a [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) or join [Discord](https://discord.gg/57uvCeRw43).

<br />

### Table of contents

- [Description](#-description)
- [Features](#-features-1)
- [Screenshots](#-screenshots-1)
- [Installation](#-installation-1)
- [Setup](#️-setup)
- [Sensors](#-sensors)
- [Contributing](#-contributing)

<br />

---

### 📌 Description

**VpMobile24** is a Home Assistant custom integration that brings school timetable data directly into your smart home.

The goal: timetables should be available in Home Assistant without friction — as structured sensors you can use in automations, dashboards, and notifications. The included Lovelace card makes everything usable immediately, without writing a single line of YAML.

<br />

---

### ✨ Features

<table>
<tr>
<td width="50%">

**Integration**

- 📅 Weekly overview (Mon–Fri)
- 🔄 Automatic data refresh every 15 minutes
- 👥 Multiple classes supported simultaneously
- 📊 Structured daily and weekly sensors
- ⚡ Automatic updates via HACS

</td>
<td width="50%">

**Lovelace Card**

- 🎨 Visual configuration (no YAML)
- 📱 Responsive design for mobile & desktop
- 🔥 Current day highlighted
- ⛔ Substitutions marked with color
- ⚙️ Fully customizable

</td>
</tr>
</table>

<br />

---

### 📸 Screenshots

<table>
<tr>
  <td align="center"><b>Overview</b></td>
  <td align="center"><b>Lovelace Card</b></td>
  <td align="center"><b>Configuration</b></td>
</tr>
<tr>
  <td><img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png" alt="Overview" /></td>
  <td><img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png" alt="Card" /></td>
  <td><img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png" alt="Config" /></td>
</tr>
</table>

<br />

---

### 📦 Installation

#### Via HACS (recommended)

[![Install via HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge)

1. **Open HACS** — navigate to HACS in Home Assistant
2. **Add custom repository** — menu (⋮) → Custom Repositories
3. **Enter URL:**
   ```
   https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
   Category: `Integration`
4. **Install** — find the integration and install it
5. **Restart** — restart Home Assistant

#### Manual installation

1. Download the repository as ZIP or clone it:
   ```bash
   git clone https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
2. Copy the contents of `custom_components/vpmobile24/` to `/config/custom_components/vpmobile24/`
3. Restart Home Assistant

<br />

---

### ⚙️ Setup

1. **Settings** → **Devices & Services**
2. Click **Add Integration** in the bottom right
3. Search for **VpMobile24** and select it
4. Enter your credentials:

| Field | Description |
|-------|-------------|
| `School` | School identifier in the VpMobile24 portal |
| `Username` | Your login name |
| `Password` | Your password |
| `Class` | Class identifier (e.g. `10a`) |

> [!TIP]
> Multiple classes can be added by repeating the integration setup with different credentials.

<br />

---

### 📊 Sensors

After setup, the following sensors are created automatically:

| Sensor | Description |
|--------|-------------|
| `sensor.vpmobile24_week_table` | Full weekly timetable |
| `sensor.vpmobile24_monday` | Monday timetable |
| `sensor.vpmobile24_tuesday` | Tuesday timetable |
| `sensor.vpmobile24_wednesday` | Wednesday timetable |
| `sensor.vpmobile24_thursday` | Thursday timetable |
| `sensor.vpmobile24_friday` | Friday timetable |

All sensors refresh automatically every **15 minutes**.

<br />

---

### 🤝 Contributing

Contributions of all kinds are welcome!

- 🐛 **Found a bug?** → [Open an issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)
- 💡 **Have an idea?** → [Start a discussion](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/discussions)
- 🔧 **Want to code?** → Fork → branch → pull request
- 💬 **Community** → [Join Discord](https://discord.gg/57uvCeRw43)

<br />

---

<div align="center">

<br />

Made with ❤️ by [Maximilian-Andrew Kluge](https://github.com/Maximilian-Andrew-Kluge)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Maximilian-Andrew-Kluge/VpMobile24?style=flat-square)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/stargazers)

</div>
