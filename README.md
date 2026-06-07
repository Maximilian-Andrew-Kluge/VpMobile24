﻿﻿<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/DE%20Banner.png" alt="VpMobile24" width="100%"/>

<br/>
<br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Version-2.4.9-3b82f6?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Status](https://img.shields.io/badge/Status-Beta-f59e0b?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24)
[![License](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24?style=for-the-badge&color=22c55e)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/57uvCeRw43)

<br/>

[**📦 Via HACS installieren**](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge) &nbsp;&nbsp;·&nbsp;&nbsp;
[**🌐 Website**](https://maximilian-andrew-kluge.github.io/VpMobile24/website/) &nbsp;&nbsp;·&nbsp;&nbsp;
[**💬 Discord**](https://discord.gg/57uvCeRw43) &nbsp;&nbsp;·&nbsp;&nbsp;
[**🐛 Bug melden**](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

</div>

<br/>

---

<br/>

> [!IMPORTANT]
> 🎉 **Großes Update angekündigt – VpMobile24 v2.5.0**
>
> 🚀 **Geplante Veröffentlichung:** *08.06.2026 / 12:00Uhr*
>
> ### Neue Features in v2.5.0
>
> #### 🃏 Karten
> - 📅 **Erweiterte Wochennavigation** — KW anzeigen, Nächste/Aktuelle Woche
> - 🔮 **Wochenvorschau am Wochenende** — Karte zeigt automatisch die nächste Woche Sa/So
> - 📊 **Smart Status Bar** — zeigt Ausfälle, Vertretungen und Unterrichtsende heute
> - 🟢🟡🔴 **Neue Statusfarben** — Grün = normal, Gelb = Vertretung, Rot = Ausfall (statt einheitlichem Blau)
> - 💡 **Tooltips** — Lehrer & Raum beim Hover über eine Stunde
>
> #### 👥 Mehrere Klassen Card
> - 🔄 **Komplett neu** — Nächste Stunde, KW anzeigen
> - ✅ **Einklappbar** — Zustand wird gespeichert
> - 🔢 **Statistik-Badges** — Stunden / Vertretungen / Ausfälle pro Klasse auf einen Blick
> - 📅 **Nächste-Stunde-Anzeige** — pro Klasse direkt sichtbar
>
> #### ⏱️ Aktueller Unterricht Card
> - 🔄 **Komplett neu** — Echtzeit-Fortschrittsbalken, Countdown, Nächste Stunde, Tagesinfos
> - 🏁 **Unterrichtsende** — berechnet automatisch aus echten (nicht-ausgefallenen) Stunden
>
> #### 🔧 Integration Backend
> - 🎓 **Parallelkurs-Filter** — `789WB12`, `7INb1` etc. erscheinen jetzt in der Fächerauswahl; nur ausgewählte Kurse werden angezeigt
> - 🚫 **Fremde Ausfälle gefiltert** — Ausfall von `789WB2` erscheint nicht mehr wenn du `789WB12` hast
> - 📅 **Übernächste Woche vorgeladen** — `next_next_week_table` im Sensor verfügbar

<br/>

## 🇩🇪 Deutsch

> [!WARNING]
> **Beta-Version** — aktiv in Entwicklung. Feedback und Fehlerberichte sind jederzeit willkommen — als [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) oder auf [Discord](https://discord.gg/57uvCeRw43).

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

#### 🔌 Integration

| | |
|---|---|
| 📅 | Wochenübersicht Mo–Fr + nächste Woche |
| 🔄 | Automatischer Datenabruf alle 15 Min. |
| 👥 | Mehrere Klassen mit gleichen Zugangsdaten |
| 🌍 | Vollständig mehrsprachig (DE / EN / FR) |
| 📊 | Strukturierte Tages- und Wochensensoren |
| ⚡ | Automatische Updates via HACS |
| 🔧 | Klasse & Fächer nachträglich änderbar |
| 📋 | Klassenauswahl automatisch aus XML |
| ⏱️ | Countdown bis zur nächsten Stunde |
| 🏫 | Sensor „Aktueller Unterricht" |

</td>
<td valign="top" width="50%">

#### 🃏 Lovelace Card

| | |
|---|---|
| 🎨 | Navy Dark Design — unabhängig vom HA-Theme |
| 📱 | Responsiv: Desktop-Tabelle & Handy-Modus |
| 🟢 | Aktuelle Stunde grün hervorgehoben |
| 🔴 | Ausfallstunden immer rot (alle Spalten) |
| 🖱️ | Klick-Popup mit Lehrer, Raum & Uhrzeit |
| ⓘ | Zusatzinfos pro Tag per Button |
| ⏰ | Eigene Uhrzeiten konfigurierbar |
| 📆 | Nächste Woche anzeigen (Button) |
| 🏫 | Widget „Aktueller Unterricht" |
| 👥 | Mehrere Klassen in einer Card |

</td>
</tr>
</table>

<br/>

---

### Screenshots

<table>
<tr>
  <td align="center" width="33%">
    <b>Wochenübersicht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png" alt="Wochenübersicht" width="100%"/>
  </td>
  <td align="center" width="33%">
    <b>Lovelace Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png" alt="Lovelace Card" width="100%"/>
  </td>
  <td align="center" width="33%">
    <b>Konfiguration</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png" alt="Konfiguration" width="100%"/>
  </td>
</tr>
</table>

<br/>

---

### 📦 Installation

#### ⭐ Via HACS (empfohlen)

<a href="https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge">
  <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="In HACS öffnen"/>
</a>

1. **HACS öffnen** — in Home Assistant zu HACS navigieren
2. **Custom Repository hinzufügen** — Menü `⋮` → Benutzerdefinierte Repositories
3. **URL eingeben** und Kategorie `Integration` wählen:
   ```
   https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
4. **Installieren** — Integration suchen und installieren
5. **Home Assistant neu starten**

#### 📦 Installation

1. Repository klonen oder als ZIP herunterladen:
   ```bash
   git clone https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
2. Ordner `custom_components/vpmobile24/` nach `/config/custom_components/vpmobile24/` kopieren
3. Home Assistant neu starten

<br/>

---

### ⚙️ Einrichtung

**Einstellungen → Geräte & Dienste → Integration hinzufügen → VpMobile24**

| Feld | Beschreibung | Beispiel |
|------|--------------|---------|
| `Schulnummer` | ID aus der Stundenplan24-URL | `10001329` |
| `Benutzername` | Dein Anmeldename | `schueler` |
| `Passwort` | Dein Passwort | `••••••••` |
| `Klasse` | Klassenkennung | `10a` |

> [!TIP]
> **Mehrere Klassen** lassen sich durch erneutes Hinzufügen der Integration einrichten — auch mit denselben Zugangsdaten. Jede Klasse erhält ein eigenes Gerät mit eigenen Sensoren (`VpMobile24 – 10a (12345)`).

> [!TIP]
> **Klasse oder Fächer nachträglich ändern:** Einstellungen → Geräte & Dienste → VpMobile24 → ⚙️ Konfigurieren. Dort kannst du unabhängig voneinander **Fächer wechseln** (Auswahl anpassen) oder **Klasse wechseln** (neue Klasse eingeben, Fächerliste wird neu geladen).

<br/>

---

### 🃏 Lovelace Card

Die Card wird beim HA-Start automatisch nach `/config/www/vpmobile24/` kopiert.

**Schritt 1 — Ressource registrieren:**

Einstellungen → Dashboards → `⋮` → Ressourcen → `+ Hinzufügen`

| Feld | Wert |
|------|------|
| URL | `/local/vpmobile24/vpmobile24-card.js` |
| Ressourcentyp | JavaScript-Modul |

**Schritt 2 — Card hinzufügen:**

Dashboard bearbeiten → `+ Karte hinzufügen` → **VpMobile24 Card** suchen

Oder direkt per YAML:

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
additional_info_entity: sensor.vpmobile24_zusatzinfos
reload_entity: button.vpmobile24_daten_neu_laden
show_header: true
header_settings:
  title: Stundenplan
  class_name: 10b
highlight_today: true
show_time: true
```

> [!TIP]
> **Widget „Aktueller Unterricht"** — zeigt die gerade laufende Stunde kompakt an. Hinzufügen per YAML:
> ```yaml
> type: custom:vpmobile24-current-card
> entity: sensor.vpmobile24_aktueller_unterricht
> title: Aktueller Unterricht
> ```

> [!TIP]
> **Mehrere Klassen Card** — vergleicht mehrere Klassen auf einen Blick:
> ```yaml
> type: custom:vpmobile24-multi-card
> title: Stundenplan Übersicht
> entities:
>   - sensor.vpmobile24_week_table_10a
>   - sensor.vpmobile24_week_table_10b
> ```

> [!NOTE]
> Die Sprache der Card wird automatisch aus der HA-Systemsprache erkannt (DE / EN / FR). Keine manuelle Einstellung nötig.

<br/>

---

### 📊 Sensoren

Nach der Einrichtung werden folgende Entitäten automatisch erstellt:

| Entität | Beschreibung |
|---------|--------------|
| `sensor.vpmobile24_week_table` | Vollständige Wochenübersicht — wird von der Card verwendet |
| `sensor.vpmobile24_naechste_stunde` | Nächste Unterrichtsstunde heute + Countdown |
| `sensor.vpmobile24_aktueller_unterricht` | Gerade laufende Stunde mit Fach, Lehrer & Raum |
| `sensor.vpmobile24_wochenstundenplan` | Heutiger Stundenplan mit allen Stunden |
| `sensor.vpmobile24_zusatzinfos` | Zusatzinformationen und Hinweise pro Tag |
| `sensor.vpmobile24_aenderungen` | Aktuelle Vertretungen und Änderungen |
| `calendar.vpmobile24_wochenkalender` | Wochenkalender für die HA-Kalender-Ansicht |
| `button.vpmobile24_daten_neu_laden` | Manuelles Neuladen der Stundenplandaten |

> [!NOTE]
> Bei mehreren Klassen werden die Entitäts-IDs mit der Klasse ergänzt. Die genauen IDs findest du unter **Einstellungen → Geräte & Dienste → VpMobile24**.

Alle Sensoren werden automatisch alle **15 Minuten** aktualisiert.

<br/>

---

### 🤝 Mitmachen

Contributions sind herzlich willkommen!

| | |
|---|---|
| 🐛 **Bug gefunden?** | [Issue erstellen](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new) |
| 💡 **Idee?** | [Diskussion starten](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/discussions) |
| 🔧 **Code beitragen** | Fork → Branch → Pull Request |
| 💬 **Community** | [Discord beitreten](https://discord.gg/57uvCeRw43) |

<br/>

---

> [!IMPORTANT]
> 🎉 **Major Update Announced – VpMobile24 v2.5.0**
>
> 🚀 **Scheduled Release:** *June 8, 2026 at 12:00 PM (CEST)*
>
> ### New Features in v2.5.0
>
> - 📅 **Next Week** — button to preview next week's schedule, auto on weekends
> - 🏫 **Current Lesson sensor & widget** — shows the currently running lesson
> - 👥 **Multi-class card** — compare multiple classes in one card
> - ⏱️ **Countdown** — sensor shows "in 23 min." to next lesson
> - 📋 **Class selection from XML** — auto-load all classes during setup
> - 🔧 **Change class & subjects independently** — via ⚙️ Configure
> - ⚡ **Parallel data fetching** — setup up to 10× faster
> - 🐛 Fixed duplicate device after class change
> - 🃏 Card: cleaner config UI, lesson times auto-read from XML

<br/>
<br/>

## 🇬🇧 English

<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/EN%20Banner.png" alt="VpMobile24" width="100%"/>

<br/>
<br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Version-2.4.9-3b82f6?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Status](https://img.shields.io/badge/Status-Beta-f59e0b?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24)
[![License](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24?style=for-the-badge&color=22c55e)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/57uvCeRw43)

<br/>

[**📦 Install via HACS**](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge) &nbsp;&nbsp;·&nbsp;&nbsp;
[**🌐 Website**](https://maximilian-andrew-kluge.github.io/VpMobile24/website/) &nbsp;&nbsp;·&nbsp;&nbsp;
[**💬 Discord**](https://discord.gg/57uvCeRw43) &nbsp;&nbsp;·&nbsp;&nbsp;
[**🐛 Report a bug**](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

</div>

<br/>

> [!WARNING]
> **Beta version** — actively in development. Feedback and bug reports are always welcome — open a [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) or join [Discord](https://discord.gg/57uvCeRw43).

<br/>

### Table of contents

- [Description](#-description)
- [Features](#-features-1)
- [Screenshots](#-screenshots-1)
- [Installation](#-installation-1)
- [Setup](#️-setup-1)
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

#### 🔌 Integration

| | |
|---|---|
| 📅 | Weekly overview Mon–Fri + next week |
| 🔄 | Automatic data refresh every 15 min. |
| 👥 | Multiple classes with same credentials |
| 🌍 | Fully multilingual (DE / EN / FR) |
| 📊 | Structured daily and weekly sensors |
| ⚡ | Automatic updates via HACS |
| 🔧 | Change class & subjects after setup |
| 📋 | Class selection auto-loaded from XML |
| ⏱️ | Countdown to next lesson |
| 🏫 | "Current Lesson" sensor |

</td>
<td valign="top" width="50%">

#### 🃏 Lovelace Card

| | |
|---|---|
| 🎨 | Navy dark design — independent of HA theme |
| 📱 | Responsive: desktop table & mobile mode |
| 🟢 | Current lesson highlighted in green |
| 🔴 | Cancelled lessons always red (all columns) |
| 🖱️ | Click popup with teacher, room & time |
| ⓘ | Daily additional info via button |
| ⏰ | Custom period times configurable |
| 📆 | Next week view (button) |
| 🏫 | "Current Lesson" widget card |
| 👥 | Multi-class comparison card |

</td>
</tr>
</table>

<br/>

---

### Screenshots

<table>
<tr>
  <td align="center" width="33%">
    <b>Weekly Overview</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/overview.png" alt="Weekly Overview" width="100%"/>
  </td>
  <td align="center" width="33%">
    <b>Lovelace Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/card.png" alt="Lovelace Card" width="100%"/>
  </td>
  <td align="center" width="33%">
    <b>Configuration</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/config.png" alt="Configuration" width="100%"/>
  </td>
</tr>
</table>

<br/>

---

### 📦 Installation

#### ⭐ Via HACS (recommended)

<a href="https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge">
  <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open in HACS"/>
</a>

1. **Open HACS** — navigate to HACS in Home Assistant
2. **Add custom repository** — menu `⋮` → Custom Repositories
3. **Enter URL** and select category `Integration`:
   ```
   https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
4. **Install** — find the integration and install it
5. **Restart Home Assistant**

#### 🔧 Manual installation

1. Clone or download the repository as ZIP:
   ```bash
   git clone https://github.com/Maximilian-Andrew-Kluge/VpMobile24
   ```
2. Copy `custom_components/vpmobile24/` to `/config/custom_components/vpmobile24/`
3. Restart Home Assistant

<br/>

---

### ⚙️ Setup

**Settings → Devices & Services → Add Integration → VpMobile24**

| Field | Description | Example |
|-------|-------------|---------|
| `School ID` | ID from the Stundenplan24 URL | `10001329` |
| `Username` | Your login name | `student` |
| `Password` | Your password | `••••••••` |
| `Class` | Class identifier | `10a` |

> [!TIP]
> **Multiple classes** can be added by re-adding the integration — even with the same credentials. Each class gets its own device with its own sensors (`VpMobile24 – 10a (12345)`).

> [!TIP]
> **Change class or subjects after setup:** Settings → Devices & Services → VpMobile24 → ⚙️ Configure. You can independently **change subjects** (adjust selection) or **change class** (enter new class, subject list reloads automatically).

<br/>

---

### 🃏 Lovelace Card

The card is automatically copied to `/config/www/vpmobile24/` on every HA start.

**Step 1 — Register resource:**

Settings → Dashboards → `⋮` → Resources → `+ Add`

| Field | Value |
|-------|-------|
| URL | `/local/vpmobile24/vpmobile24-card.js` |
| Resource type | JavaScript module |

**Step 2 — Add card:**

Edit dashboard → `+ Add card` → search for **VpMobile24 Card**

Or directly via YAML:

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
additional_info_entity: sensor.vpmobile24_zusatzinfos
reload_entity: button.vpmobile24_daten_neu_laden
show_header: true
header_settings:
  title: Timetable
  class_name: 10b
highlight_today: true
show_time: true
```

> [!NOTE]
> The card language is automatically detected from your HA system language (DE / EN / FR). No manual configuration needed.

<br/>

---

### 📊 Sensors

After setup, the following entities are created automatically:

| Entity | Description |
|--------|-------------|
| `sensor.vpmobile24_week_table` | Full weekly timetable — used by the card |
| `sensor.vpmobile24_naechste_stunde` | Next lesson today + countdown |
| `sensor.vpmobile24_aktueller_unterricht` | Currently running lesson with subject, teacher & room |
| `sensor.vpmobile24_wochenstundenplan` | Today's full schedule |
| `sensor.vpmobile24_zusatzinfos` | Additional info and notices per day |
| `sensor.vpmobile24_aenderungen` | Current substitutions and changes |
| `calendar.vpmobile24_wochenkalender` | Weekly calendar for HA calendar view |
| `button.vpmobile24_daten_neu_laden` | Manual data reload |

> [!NOTE]
> With multiple classes, entity IDs are suffixed with the class name. Find the exact IDs under **Settings → Devices & Services → VpMobile24**.

All sensors refresh automatically every **15 minutes**.

<br/>

---

### 🤝 Contributing

Contributions of all kinds are welcome!

| | |
|---|---|
| 🐛 **Found a bug?** | [Open an issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new) |
| 💡 **Have an idea?** | [Start a discussion](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/discussions) |
| 🔧 **Want to code?** | Fork → branch → pull request |
| 💬 **Community** | [Join Discord](https://discord.gg/57uvCeRw43) |

<br/>

---

<div align="center">

<br/>

Made with ❤️ by [Maximilian-Andrew Kluge](https://github.com/Maximilian-Andrew-Kluge)

[![MIT License](https://img.shields.io/badge/License-MIT-22c55e.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Maximilian-Andrew-Kluge/VpMobile24?style=flat-square&color=f59e0b)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/stargazers)
[![GitHub Release](https://img.shields.io/github/release/Maximilian-Andrew-Kluge/VpMobile24.svg?style=flat-square&label=Latest)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)

</div>
