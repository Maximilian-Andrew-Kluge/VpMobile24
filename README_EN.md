🇩🇪 **[German Documentation](README.md)**

<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/EN%20Banner.png" alt="VpMobile24" width="100%"/>

<br/>
<br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Stable-v2.5.5-22c55e?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/latest)
[![License](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24?style=for-the-badge\&color=22c55e)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=for-the-badge\&logo=discord\&logoColor=white)](https://discord.gg/57uvCeRw43)

<br/>

[**📦 Install via HACS**](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge)
·
[**🌐 Website**](https://maximilian-andrew-kluge.github.io/VpMobile24/website/)
·
[**💬 Discord**](https://discord.gg/57uvCeRw43)
·
[**🐛 Report a Bug**](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

</div>

---

# 🚀 Latest Release

> [!IMPORTANT]
>
> 🎉 **VpMobile24 v2.5.5** — Stable Release
>
> 📅 Released on **July 14, 2026**
>
> 📥 Update now via HACS.
>
> 🔗 [Release Notes →](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/latest)

---

# 📅 Release Cycle

> [!IMPORTANT]
>
> 🚀 Regular updates are released on the **15th of every month**.
>
> Critical bugs or security issues are released immediately as hotfixes.

---

# 🔄 Issues after an update?

> [!TIP]
>
> If the integration doesn't work after an update:
>
> 1. Remove the integration
> 2. Re-configure
> 3. Restart Home Assistant
>
> If the problem persists, open a GitHub issue or visit the Discord server.

---

## 📌 Description

**VpMobile24** is a modern Home Assistant integration for **Stundenplan24.de / VpMobil24**.

The integration brings your school timetable directly into Home Assistant and automatically creates sensors for:

* Current lesson
* Next lesson
* Today's timetable
* Weekly timetable
* Changes & substitutions
* Additional information
* **School holidays** (automatically by federal state)

Additionally, modern Lovelace cards are included.

---

## ✨ Features

### 📡 Sensors

| Sensor               | Description                                  |
| -------------------- | -------------------------------------------- |
| week_table           | Full week timetable                          |
| naechste_stunde      | Next lesson                                  |
| heutiger_stundenplan | Today's timetable                            |
| zusatzinfos          | Additional information                       |
| aenderungen          | Changes & substitutions                      |
| aktueller_unterricht | Current lesson                               |
| ferien               | School holidays (automatic by federal state) |

### 🃏 Lovelace Cards

* Weekly overview with KW display and week navigation
* Multiple classes (collapsible sections, statistics badges)
* Current lesson (live progress bar, countdown, next lesson)
* **Holiday display** — all three cards show 🏖️ during school holidays
* Responsive design (desktop + mobile)
* Multilingual: DE / EN / FR
* Parallel course filter
* Smart status bar (cancellations, substitutions, end of day)
* Tooltips with teacher & room
* CSP-safe (nginx, DuckDNS, reverse proxy)
* Automatic updates every 15 minutes

### 🆕 New Features in v2.5.0 – v2.5.5

* **Holiday sensor** — automatic school holiday detection for all 16 German federal states (official KMK data)
* **Holidays in cards** — schedule card shows holiday screen, current lesson + multi-class show banner
* **Federal state selectable** — during setup or later via Configure
* **Current lesson** — real-time detection including substitutions
* **SmartHint** — next lesson shown during breaks, cancelled lessons filtered
* **Before school** — card shows `🌙 No lessons yet`
* **Info popup** — shows today's additional information correctly
* **Reload button** — spins green when refreshing
* **Parallel course filter** — cancellations of other course groups filtered automatically
* **Sensors** — now detect substitution lessons

---

# 📸 Screenshots

### 🗓️ Weekly Overview

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

---

# 🚀 Installation

### Install via HACS

<div>

[![Open your Home Assistant instance and open the repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Maximilian-Andrew-Kluge&repository=VpMobile24&category=integration)

</div>

---

### Manual Installation

Copy folder `custom_components/vpmobile24` to `config/custom_components/vpmobile24` and restart Home Assistant.

---

# ⚙️ Setup

1. Settings → Devices & Services → Add Integration → **VpMobile24**
2. Enter School ID, Username, Password
3. Select your class
4. Select subjects (select parallel course groups individually)
5. **Select your federal state** (for automatic holiday detection)

---

# 🃏 Lovelace Card Examples

### Schedule Card

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
```

### Multi-Class Card

```yaml
type: custom:vpmobile24-multi-card
entities:
  - sensor.vpmobile24_7a_week_table
  - sensor.vpmobile24_7b_week_table
```

### Current Lesson Card

```yaml
type: custom:vpmobile24-current-card
entity: sensor.vpmobile24_aktueller_unterricht
next_entity: sensor.vpmobile24_naechste_stunde
week_entity: sensor.vpmobile24_heutiger_stundenplan
```

---

# 📡 Sensors

| Sensor               | State      | Attributes                         |
| -------------------- | ---------- | ---------------------------------- |
| week_table           | Count      | week_table, next_week_table        |
| naechste_stunde      | Subject    | zeit, lehrer, raum                 |
| heutiger_stundenplan | Count      | stunden_heute                      |
| zusatzinfos          | Count      | allgemeine_infos                   |
| aenderungen          | Count      | alle_aenderungen                   |
| aktueller_unterricht | Subject    | fach, lehrer, raum                 |
| ferien               | HolidayName| ist_ferien, start, end, bundesland |

---

# ❓ FAQ

### Which schools are supported?

All schools using Stundenplan24.de or VpMobil24.

### Do I need to write YAML?

No — everything can be configured through the Home Assistant UI.

### Does the integration support multiple classes?

Yes — multiple classes and parallel course groups are supported.

### What is the parallel course filter?

In the subject selection, all course groups appear (e.g. `789WB10`, `7INb1`). Select only your own course — then cancellations from other groups won't be shown.

### How does holiday detection work?

Select your federal state during setup or via Configure. Data comes from the official KMK holiday schedules, kept up-to-date via [ferien-api.de](https://ferien-api.de).

---

# 🔧 Diagnostics

Settings → Devices & Services → VpMobile24 → Download Diagnostics

---

# 🤝 Contributing

* 🐛 Report a bug → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)
* 💬 Community → [Discord](https://discord.gg/57uvCeRw43)
* 🔧 Pull Request → [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Developed with ❤️ for the Home Assistant Community**

⭐ Leave a star on GitHub if you like this project.

</div>
