🇩🇪 **[German Documentation](README.md)**

<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/EN%20Banner.png" alt="VpMobile24" width="100%"/>

<br/>
<br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Stable-v2.5.0-22c55e?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/latest)
[![Beta](https://img.shields.io/badge/Beta-v2.5.1-f59e0b?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
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
> 🎉 **VpMobile24 v2.5.0** — Stable Release
>
> 📅 Released on **June 8, 2026**
>
> 📥 Update now via HACS.
>
> 🔗 [Release Notes →](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/latest)

> [!NOTE]
>
> 🧪 **v2.5.1** — Beta / Pre-Release available
>
> Contains bug fixes and improvements. Suitable for testers.
>
> 🔗 [Beta Release →](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)

---

# 📅 Release Cycle

> [!IMPORTANT]
>
> 🚀 Regular updates are released on the **15th of every month**.
>
> New features, improvements and optimizations are bundled into stable releases.
>
> Critical bugs and security issues are released immediately as hotfixes.

Examples:

* `v2.5.1` → Critical bug fix
* `v2.5.2` → Security update
* `v2.6.0` → New features

---

# 🔄 Issues after an update?

> [!TIP]
>
> If the integration is not working after an update:
>
> 1. Remove the integration
> 2. Reconfigure it
> 3. Restart Home Assistant
>
> If the issue persists, please open a GitHub issue or visit our Discord server.

---

# 📌 Description

**VpMobile24** is a modern Home Assistant custom integration for **Stundenplan24.de / VpMobil24**.

The integration brings your school timetable directly into Home Assistant and automatically creates sensors for:

* Current lesson
* Next lesson
* Today's timetable
* Weekly timetable
* Schedule changes
* Additional information

Additionally, modern Lovelace cards are included.

---

# ✨ Features

## 📡 Sensors

| Sensor               | Description             |
| -------------------- | ----------------------- |
| week_table           | Full week timetable     |
| naechste_stunde      | Next lesson             |
| heutiger_stundenplan | Today's timetable       |
| zusatzinfos          | Additional information  |
| aenderungen          | Changes & substitutions |
| aktueller_unterricht | Current lesson          |

## 🃏 Lovelace Cards

* Weekly overview with KW display and week navigation
* Multiple classes (collapsible sections, statistics badges)
* Current lesson (live progress bar, countdown, next lesson)
* Responsive design (desktop + mobile)
* Multilingual: DE / EN / FR
* Parallel course filter
* Smart status bar (cancellations, substitutions, end of school day)
* Tooltips with teacher & room
* CSP-safe (nginx, DuckDNS, reverse proxy)
* Automatic updates every 15 minutes

## 🆕 New in v2.5.0 / v2.5.1

* **Current lesson** — real-time detection including substitutions
* **SmartHint** — next lesson shown during breaks, cancelled lessons filtered out
* **Before school** — card shows `🌙 No lessons yet` instead of `⏸ Break`
* **Info popup** — additional info for the day displayed correctly
* **Reload button** — arrow spins when refreshing
* **Parallel course filter** — cancellations of other course groups filtered automatically
* **Sensors** — `aktueller_unterricht` and `naechste_stunde` now detect substitutions
* Parallel course support
* Automatic updates

---

## 📸 Screenshots

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

### ⚙️ Configuration

<table>
<tr>
  <td align="center" width="50%">
    <b>Setup</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/config.png" alt="Configuration" width="100%"/>
  </td>

  <td align="center" width="50%">
    <b>Subject Selection (incl. Parallel Courses)</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/subject-select.png" alt="Subject Selection" width="100%"/>
  </td>
</tr>
</table>

### 👥 Multi-Class Card · ⏱️ Current Lesson Card

<table>
<tr>
  <td align="center" width="50%">
    <b>Multi-Class Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/multi-card.png" alt="Multi-Class Card" width="100%"/>
  </td>

  <td align="center" width="50%">
    <b>Current Lesson Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/en/current-card.png" alt="Current Lesson Card" width="100%"/>
  </td>
</tr>
</table>


---

# 🚀 Installation

## Via HACS

1. Open HACS
2. Add a custom repository:

```text
https://github.com/Maximilian-Andrew-Kluge/VpMobile24
```

3. Select category:

```text
Integration
```

4. Install **VpMobile24**
5. Restart Home Assistant

---

## Manual Installation

Copy:

```text
custom_components/vpmobile24
```

to:

```text
config/custom_components/vpmobile24
```

and restart Home Assistant.

---

# ⚙️ Setup

1. Settings
2. Devices & Services
3. Add Integration
4. Select **VpMobile24**

Then enter:

* School ID
* Username
* Password
* Select class
* Select subjects

---

# 🃏 Lovelace Card Examples

### Timetable Card

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

| Sensor               | State   | Attributes             |
| -------------------- | ------- | ---------------------- |
| week_table           | Count   | week_table             |
| naechste_stunde      | Subject | time, teacher, room    |
| heutiger_stundenplan | Count   | lessons_today          |
| zusatzinfos          | Count   | general_information    |
| aenderungen          | Count   | all_changes            |
| aktueller_unterricht | Subject | subject, teacher, room |

---

# ❓ FAQ

### Which schools are supported?

All schools using Stundenplan24.de or VpMobil24.

### Do I need YAML?

No.

Everything can be configured via the Home Assistant UI.

### Does the integration support multiple classes?

Yes.

Multiple classes and parallel courses are supported.

---

# 🔧 Diagnostics

Diagnostics are supported.

Available here:

```text
Settings
→ Devices & Services
→ VpMobile24
→ Download Diagnostics
```

The following data is automatically removed:

* Password
* Access Token
* Refresh Token
* Session IDs

---

# 🗺️ Roadmap

Planned:

* More sensors
* Additional cards
* Improved diagnostics
* More languages
* Additional filters
* Better error handling

---

# 🤝 Contributing

Contributions are welcome.

* 🐛 Report bugs
* 💡 Suggest features
* 🔧 Submit pull requests
* 💬 Join our Discord community

---

# 💬 Community

Discord:

https://discord.gg/57uvCeRw43

GitHub:

https://github.com/Maximilian-Andrew-Kluge/VpMobile24

Issues:

https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues

---

# 🔒 Security

Please do not report security issues publicly.

See:

```text
SECURITY.md
```

---

# 📜 Changelog

All changes:

```text
CHANGELOG.md
```

---

<div align="center">

**Made with ❤️ for the Home Assistant Community**

⭐ Leave a star on GitHub if you like this project.

</div>
