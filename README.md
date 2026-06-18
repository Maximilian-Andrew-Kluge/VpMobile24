<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/DE%20Banner.png" alt="VpMobile24" width="100%"/>

<br/>
<br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Version-2.5.0-3b82f6?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Status](https://img.shields.io/badge/Status-Stable-22c55e?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24)
[![License](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24?style=for-the-badge&color=22c55e)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/57uvCeRw43)

<br/>

[**📦 Via HACS installieren**](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge) &nbsp;&nbsp;·&nbsp;&nbsp;
[**🌐 Website**](https://maximilian-andrew-kluge.github.io/VpMobile24/website/) &nbsp;&nbsp;·&nbsp;&nbsp;
[**💬 Discord**](https://discord.gg/57uvCeRw43) &nbsp;&nbsp;·&nbsp;&nbsp;
[**🐛 Bug melden**](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

</div>

<br/>

## 🚀 Aktuelles Release

> [!IMPORTANT]
>
> 🎉 **VpMobile24 v2.5.0 ist jetzt verfügbar**
>
> 📅 **Veröffentlicht am:** 08.06.2026
>
> 📥 **Jetzt über HACS aktualisieren**
>
> 🔗 **Release Notes:**
> https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/tag/v2.5.0

---

## 📅 Release-Zyklus

> [!IMPORTANT]
>
> 🚀 **Reguläre Updates erscheinen immer am 15. eines Monats**
>
> Neue Funktionen, Verbesserungen und Optimierungen werden gesammelt und als stabiles Release veröffentlicht.
>
> 🛠️ **Kritische Fehler oder schwerwiegende Bugs**
>
> Diese werden sofort als **Hotfix** veröffentlicht und warten nicht bis zum nächsten regulären Update.
>
> **Beispiele:**
>
> * `v2.5.1` → Kritischer Bugfix
> * `v2.5.2` → Sicherheits- oder Stabilitätsupdate
>
> 🔒 **Unser Ziel:** Eine stabile, moderne und zuverlässige Home Assistant Integration.

---

## 🔄 Probleme nach einem Update?

> [!TIP]
>
> Falls die Integration nach einem Update nicht korrekt funktioniert, führe bitte die folgenden Schritte aus:
>
> 1. 🗑️ **Die Integration aus Home Assistant entfernen**
> 2. ➕ **Die Integration erneut konfigurieren**
> 3. 🔄 **Home Assistant vollständig neu starten**
>
> ✅ In den meisten Fällen werden dadurch Konfigurations- oder Aktualisierungsprobleme automatisch behoben.
>
> 💬 Falls das Problem weiterhin besteht, erstelle bitte ein GitHub-Issue oder besuche unseren Discord-Server.



<br/>

## 🇩🇪 Deutsch

> [!WARNING]
> **Veröffentlichte Version** — Feedback und Fehlerberichte sind jederzeit willkommen — als [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) oder auf [Discord](https://discord.gg/57uvCeRw43).

<br/>

### Inhaltsverzeichnis

- [Beschreibung](#-beschreibung)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Einrichtung](#️-einrichtung)
- [Lovelace Card](#-lovelace-card)
- [Sensoren](#-sensoren)
- [Mitmachen](#-mitmachen)

<br/>

---

### 📌 Beschreibung

**VpMobile24** ist eine Home Assistant Custom Integration, die Stundenplandaten von [Stundenplan24.de](https://www.stundenplan24.de) direkt in dein Smart Home bringt.

Stundenpläne sollen ohne Umwege in Home Assistant sichtbar sein — als strukturierte Sensoren für Automationen, Dashboards und Benachrichtigungen. Die mitgelieferte Lovelace Card macht alles sofort nutzbar, ohne eine Zeile YAML.

<br/>

---

### ✨ Features

<table>
<tr>
<td valign="top" width="50%">

#### 📡 Sensoren

| Sensor | Beschreibung |
|--------|-------------|
| `sensor.vpmobile24_week_table` | Vollständige Wochentabelle |
| `sensor.vpmobile24_naechste_stunde` | Nächste Unterrichtsstunde |
| `sensor.vpmobile24_heutiger_stundenplan` | Heutiger Stundenplan |
| `sensor.vpmobile24_zusatzinfos` | Zusätzliche Informationen |
| `sensor.vpmobile24_aenderungen` | Vertretungen & Änderungen |
| `sensor.vpmobile24_aktueller_unterricht` | Aktuell laufende Stunde |

</td>
<td valign="top" width="50%">

#### 🃏 Lovelace Card

| | |
|--|--|
| 📅 | Wochenansicht mit Navigation |
| 🔄 | Automatische Aktualisierung |
| 📱 | Responsive (Desktop + Mobile) |
| 🌍 | DE / EN / FR |
| 👥 | Mehrere Klassen gleichzeitig |
| ⏱️ | Aktueller Unterricht Widget |
| 🎓 | Parallelkurs-Filter |

</td>
</tr>
</table>

<br/>

---

### 📸 Screenshots

#### 🗓️ Stundenplan-Karte

<table>
<tr>
  <td align="center" width="50%">
    <b>Wochenübersicht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png" alt="Wochenübersicht" width="100%"/>
  </td>
  <td align="center" width="50%">
    <b>Lovelace Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png" alt="Lovelace Card" width="100%"/>
  </td>
</tr>
</table>

#### ⚙️ Konfiguration

<table>
<tr>
  <td align="center" width="50%">
    <b>Einrichtung</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png" alt="Konfiguration" width="100%"/>
  </td>
  <td align="center" width="50%">
    <b>Fächerauswahl (inkl. Parallelkurse)</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/subject-select.png" alt="Konfiguration" width="100%"/>
  </td>
</tr>
</table>

#### 👥 Mehrere Klassen-Karte · ⏱️ Aktueller Unterricht-Karte

<table>
<tr>
  <td align="center" width="50%">
    <b>Mehrere Klassen</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/multi-card.png" alt="Konfiguration" width="100%"/>
  </td>
  <td align="center" width="50%">
    <b>Aktueller Unterricht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/current-card.png" alt="Konfiguration" width="100%"/>
  </td>
</tr>
</table>

<br/>

---

### 🚀 Installation

#### ✅ Via HACS (empfohlen)

<a href="https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge">
  <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="In HACS öffnen"/>
</a>

1. **HACS öffnen** — in Home Assistant zu HACS navigieren
2. **Custom Repository hinzufügen** — Menü `⋮` → Benutzerdefinierte Repositories
3. **URL eingeben** und Kategorie `Integration` wählen:
   ```
   https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
4. **VpMobile24** suchen und **Herunterladen** klicken
5. **Home Assistant neu starten**

#### 🔧 Manuelle Installation

1. Dieses Repository klonen oder als ZIP herunterladen
2. Den Ordner `custom_components/vpmobile24` nach `/config/custom_components/vpmobile24` kopieren
3. Home Assistant neu starten

<br/>

---

### ⚙️ Einrichtung

1. **Einstellungen** → **Integrationen** → **+ Integration hinzufügen**
2. Nach **VpMobile24** suchen
3. Eingeben:
   - **Schul-ID** (z.B. `10213745`)
   - **Benutzername** und **Passwort** von Stundenplan24.de
4. **Klasse auswählen** (z.B. `7b`, `10a`)
5. **Fächer auswählen** — Parallelkurse (z.B. `789WB10`) einzeln wählen
6. Fertig — alle Sensoren werden automatisch erstellt

<br/>

---

### 🃏 Lovelace Card

Die Card wird beim HA-Start automatisch nach `/config/www/vpmobile24/` kopiert.

**Stundenplan-Karte** hinzufügen:
```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
```

**Mehrere Klassen** hinzufügen:
```yaml
type: custom:vpmobile24-multi-card
entities:
  - sensor.vpmobile24_7a_week_table
  - sensor.vpmobile24_7b_week_table
```

**Aktueller Unterricht** hinzufügen:
```yaml
type: custom:vpmobile24-current-card
entity: sensor.vpmobile24_aktueller_unterricht
next_entity: sensor.vpmobile24_naechste_stunde
week_entity: sensor.vpmobile24_heutiger_stundenplan
```

<br/>

---

### 📡 Sensoren

| Sensor | State | Wichtige Attribute |
|--------|-------|-------------------|
| `week_table` | Anzahl Stunden | `week_table`, `next_week_table`, `next_next_week_table` |
| `naechste_stunde` | Fach + Zeit | `fach`, `zeit`, `lehrer`, `raum`, `countdown_minuten` |
| `heutiger_stundenplan` | Anzahl Stunden | `stunden_heute`, `gesamt_stunden` |
| `zusatzinfos` | Anzahl Infos | `allgemeine_infos`, `stunden_infos` |
| `aenderungen` | Anzahl Änderungen | `alle_aenderungen` |
| `aktueller_unterricht` | Fach | `fach`, `zeit`, `lehrer`, `raum`, `ist_ausfall`, `ist_vertretung` |

<br/>

---

### 🤝 Mitmachen

Beiträge sind herzlich willkommen!

- 🐛 **Bugs melden** → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)
- 💡 **Feature vorschlagen** → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)
- 🔧 **Pull Request** → [CONTRIBUTING.md](CONTRIBUTING.md)
- 💬 **Community** → [Discord](https://discord.gg/57uvCeRw43)

<br/>

---

## 🇬🇧 English

## 🚀 Latest Release

> [!IMPORTANT]
>
> 🎉 **VpMobile24 v2.5.0 is now available**
>
> 📅 **Released on:** June 8, 2026
>
> 📥 **Update now via HACS**
>
> 🔗 **Release Notes:**
> https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/tag/v2.5.0

---

## 📅 Release Cycle

> [!IMPORTANT]
>
> 🚀 **Regular updates are released on the 15th of each month**
>
> New features, improvements, and optimizations are collected and released as a stable version.
>
> 🛠️ **Critical errors or major bugs**
>
> These are released immediately as a **hotfix** and do not wait for the next regular update.
>
> **Examples:**
>
> * `v2.5.1` → Critical bug fix
> * `v2.5.2` → Security or stability update
>
> 🔒 **Our goal:** A stable, modern, and reliable Home Assistant integration.

---

## 🔄 Issues after an update?

> [!TIP]
>
> If the integration does not work correctly after an update, please follow these steps:
>
> 1. 🗑️ **Remove the integration from Home Assistant**
> 2. ➕ **Reconfigure the integration**
> 3. 🔄 **Restart Home Assistant completely**
>
> ✅ In most cases, this automatically resolves configuration or update issues.
>
> 💬 If the problem persists, please create a GitHub issue or visit our Discord server.


<br/>

> [!WARNING]
> **Released version** — Feedback and bug reports are always welcome — as a [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) or on [Discord](https://discord.gg/57uvCeRw43).

<br/>

### Table of Contents

- [Description](#-description)
- [Features](#-features-1)
- [Screenshots](#-screenshots-1)
- [Installation](#-installation-1)
- [Setup](#️-setup)
- [Lovelace Card](#-lovelace-card-1)
- [Sensors](#-sensors-1)
- [Contributing](#-contributing-1)

<br/>

---

### 📌 Description

**VpMobile24** is a Home Assistant custom integration that brings school timetable data from [Stundenplan24.de](https://www.stundenplan24.de) directly into your smart home.

Timetables should be available in Home Assistant without friction — as structured sensors for automations, dashboards, and notifications. The included Lovelace card makes everything usable immediately, without writing a single line of YAML.

<br/>

---

### ✨ Features

<table>
<tr>
<td valign="top" width="50%">

#### 📡 Sensors

| Sensor | Description |
|--------|-------------|
| `sensor.vpmobile24_week_table` | Full week table |
| `sensor.vpmobile24_naechste_stunde` | Next lesson |
| `sensor.vpmobile24_heutiger_stundenplan` | Today's schedule |
| `sensor.vpmobile24_zusatzinfos` | Additional info |
| `sensor.vpmobile24_aenderungen` | Changes & substitutions |
| `sensor.vpmobile24_aktueller_unterricht` | Currently running lesson |

</td>
<td valign="top" width="50%">

#### 🃏 Lovelace Card

| | |
|--|--|
| 📅 | Week view with navigation |
| 🔄 | Automatic updates |
| 📱 | Responsive (Desktop + Mobile) |
| 🌍 | DE / EN / FR |
| 👥 | Multiple classes at once |
| ⏱️ | Current lesson widget |
| 🎓 | Parallel course filter |

</td>
</tr>
</table>

<br/>

---

### 📸 Screenshots

#### 🗓️ Timetable Card

<table>
<tr>
  <td align="center" width="50%">
    <b>Weekly Overview</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/overview.png" alt="Weekly Overview" width="100%"/>
  </td>
  <td align="center" width="50%">
    <b>Lovelace Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/card.png" alt="Lovelace Card" width="100%"/>
  </td>
</tr>
</table>

#### ⚙️ Configuration

<table>
<tr>
  <td align="center" width="50%">
    <b>Setup</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/config.png" alt="Configuration" width="100%"/>
  </td>
  <td align="center" width="50%">
    <b>Subject selection (incl. parallel courses)</b><br/><br/>
      <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/subject-select.png" alt="Lovelace Card" width="100%"/>
  </td>
</tr>
</table>

#### 👥 Multi-Class Card · ⏱️ Current Lesson Card

<table>
<tr>
  <td align="center" width="50%">
    <b>Multi-Class</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/multi-card.png" alt="Multi-Class Card" width="100%"/>
  </td>
  <td align="center" width="50%">
    <b>Current Lesson</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/current-card.png" alt="Current Lesson" width="100%"/>
  </td>
</tr>
</table>

<br/>

---

### 🚀 Installation

#### ✅ Via HACS (recommended)

<a href="https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge">
  <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open in HACS"/>
</a>

1. **Open HACS** — navigate to HACS in Home Assistant
2. **Add Custom Repository** — menu `⋮` → Custom Repositories
3. **Enter URL** and select category `Integration`:
   ```
   https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
4. Search for **VpMobile24** and click **Download**
5. **Restart Home Assistant**

#### 🔧 Manual Installation

1. Clone or download this repository as ZIP
2. Copy the folder `custom_components/vpmobile24` to `/config/custom_components/vpmobile24`
3. Restart Home Assistant

<br/>

---

### ⚙️ Setup

1. **Settings** → **Integrations** → **+ Add Integration**
2. Search for **VpMobile24**
3. Enter:
   - **School ID** (e.g. `10213745`)
   - **Username** and **Password** from Stundenplan24.de
4. **Select class** (e.g. `7b`, `10a`)
5. **Select subjects** — select parallel courses (e.g. `789WB10`) individually
6. Done — all sensors are created automatically

<br/>

---

### 🃏 Lovelace Card

The card is automatically copied to `/config/www/vpmobile24/` on every HA start.

**Timetable Card**:
```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
```

**Multi-Class Card**:
```yaml
type: custom:vpmobile24-multi-card
entities:
  - sensor.vpmobile24_7a_week_table
  - sensor.vpmobile24_7b_week_table
```

**Current Lesson Card**:
```yaml
type: custom:vpmobile24-current-card
entity: sensor.vpmobile24_aktueller_unterricht
next_entity: sensor.vpmobile24_naechste_stunde
week_entity: sensor.vpmobile24_heutiger_stundenplan
```

<br/>

---

### 📡 Sensors

| Sensor | State | Key Attributes |
|--------|-------|----------------|
| `week_table` | Lesson count | `week_table`, `next_week_table`, `next_next_week_table` |
| `naechste_stunde` | Subject + time | `fach`, `zeit`, `lehrer`, `raum`, `countdown_minuten` |
| `heutiger_stundenplan` | Lesson count | `stunden_heute`, `gesamt_stunden` |
| `zusatzinfos` | Info count | `allgemeine_infos`, `stunden_infos` |
| `aenderungen` | Change count | `alle_aenderungen` |
| `aktueller_unterricht` | Subject | `fach`, `zeit`, `lehrer`, `raum`, `ist_ausfall`, `ist_vertretung` |

<br/>

---

### 🤝 Contributing

Contributions are welcome!

- 🐛 **Report bugs** → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)
- 💡 **Suggest features** → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)
- 🔧 **Pull Request** → [CONTRIBUTING.md](CONTRIBUTING.md)
- 💬 **Community** → [Discord](https://discord.gg/57uvCeRw43)

<br/>

---

<div align="center">

Made with ❤️ for the Home Assistant community

[![GitHub Stars](https://img.shields.io/github/stars/Maximilian-Andrew-Kluge/VpMobile24?style=for-the-badge&color=f59e0b)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Maximilian-Andrew-Kluge/VpMobile24?style=for-the-badge&color=3b82f6)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/network)

</div>


