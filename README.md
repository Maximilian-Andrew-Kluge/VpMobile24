<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/DE%20Banner.png" alt="VpMobile24" width="100%"/>

<br/>
<br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Version-2.5.0-3b82f6?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
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
> 🚀 **Geplante Veröffentlichung:** *08.06.2026 um 12:00 Uhr (MESZ)*
>
> ### Neue Features in v2.5.0
>
> #### 🃏 Karten
> - 📅 **Erweiterte Wochennavigation** — KW anzeigen, Nächste/Aktuelle Woche mit manuellem Override (kein automatisches Zurückspringen mehr)
> - 📆 **Übernächste Woche** — Button navigiert unbegrenzt weiter in die Zukunft
> - 🔮 **Wochenvorschau am Wochenende** — Karte zeigt automatisch die nächste Woche Sa/So
> - 📊 **Smart Status Bar** — zeigt Ausfälle, Vertretungen und Unterrichtsende heute
> - 🟢🟡🔴 **Neue Statusfarben** — Grün = normal, Gelb = Vertretung, Rot = Ausfall
> - 💡 **Tooltips** — Lehrer & Raum beim Hover über eine Stunde
>
> #### 👥 Mehrere Klassen Card
> - 📋 **Komplett neu geschrieben** — moderne kollabierbare Abschnitte pro Klasse
> - ✅ **Einklappbar** — Zustand wird in localStorage gespeichert
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
> - 🐛 **Popup-Bug behoben** — kein Konfigurationsfehler mehr beim Öffnen von Stunden-Details

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

> [!IMPORTANT]
> 🎉 **Major Update Announced – VpMobile24 v2.5.0**
>
> 🚀 **Scheduled Release:** *June 8, 2026 at 12:00 PM (CEST)*
>
> ### New Features in v2.5.0
>
> #### 🃏 Cards
> - 📅 **Extended week navigation** — KW display, Next/Current Week with manual override (no more auto-reset)
> - 📆 **Week after next** — button navigates unlimited weeks into the future
> - 🔮 **Weekend preview** — card automatically shows next week on Sat/Sun
> - 📊 **Smart Status Bar** — shows cancellations, substitutions and end of school today
> - 🟢🟡🔴 **New status colors** — Green = normal, Yellow = substitution, Red = cancelled
> - 💡 **Tooltips** — teacher & room on hover over a lesson
>
> #### 👥 Multi-Class Card
> - 📋 **Completely rewritten** — modern collapsible sections per class
> - ✅ **Collapsible** — state saved in localStorage
> - 🔢 **Statistics badges** — lessons / substitutions / cancellations per class at a glance
> - 📅 **Next lesson display** — visible per class directly
>
> #### ⏱️ Current Lesson Card
> - 🔄 **Completely new** — real-time progress bar, countdown, next lesson, daily info
> - 🏁 **End of school** — calculated automatically from real (non-cancelled) lessons
>
> #### 🔧 Integration Backend
> - 🎓 **Parallel course filter** — `789WB12`, `7INb1` etc. now appear in subject selection; only selected courses are shown
> - 🚫 **Foreign cancellations filtered** — cancellation of `789WB2` no longer appears if you have `789WB12`
> - 📅 **Week after next preloaded** — `next_next_week_table` available in sensor
> - 🐛 **Popup bug fixed** — no more configuration error when opening lesson details

<br/>

> [!WARNING]
> **Beta version** — actively in development. Feedback and bug reports are always welcome — as a [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) or on [Discord](https://discord.gg/57uvCeRw43).

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
