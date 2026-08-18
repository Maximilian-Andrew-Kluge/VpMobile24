🇬🇧 **[English Documentation](README_EN.md)**

<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/DE%20Banner.png" alt="VpMobile24" width="100%"/>

<br/><br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Stable-v2.5.5-22c55e?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/latest)
[![License](https://img.shields.io/github/license/Maximilian-Andrew-Kluge/VpMobile24?style=for-the-badge\&color=22c55e)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=for-the-badge\&logo=discord\&logoColor=white)](https://discord.gg/57uvCeRw43)

<br/>

[**📦 Via HACS installieren**](https://my.home-assistant.io/redirect/hacs_repository/?repository=VpMobile24&category=Integration&owner=Maximilian-Andrew-Kluge)
·
[**🌐 Website**](https://maximilian-andrew-kluge.github.io/VpMobile24/website/)
·
[**💬 Discord**](https://discord.gg/57uvCeRw43)
·
[**🐛 Bug melden**](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

</div>

---

> [!IMPORTANT]
> 🎉 **VpMobile24 v2.5.5** ist jetzt verfügbar — [Release Notes →](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/latest)

---

## 📖 Inhaltsverzeichnis

- [📌 Beschreibung](#-beschreibung)
- [✨ Funktionen](#-funktionen)
- [🚀 Installation](#-installation)
- [⚙️ Einrichtung](#️-einrichtung)
- [🃏 Lovelace Card Beispiele](#-lovelace-card-beispiele)
- [📡 Sensoren](#-sensoren)
- [❓ FAQ](#-faq)
- [🤝 Mitmachen](#-mitmachen)

---

## 📌 Beschreibung

**VpMobile24** bringt deinen Schulstundenplan direkt in Home Assistant — mit automatischen Sensoren, modernen Lovelace-Karten und Schulferien-Erkennung für alle 16 Bundesländer.

**Unterstützte Plattformen:** Stundenplan24.de · VpMobil24

---

## ✨ Funktionen

<table>
<tr>
<td width="50%" valign="top">

**📡 Sensoren**
| Sensor | Beschreibung |
|--------|-------------|
| `week_table` | Wochentabelle |
| `naechste_stunde` | Nächste Stunde |
| `heutiger_stundenplan` | Heute |
| `zusatzinfos` | Zusatzinformationen |
| `aenderungen` | Vertretungen |
| `aktueller_unterricht` | Aktuelle Stunde |
| `ferien` | 🏖️ Schulferien |

</td>
<td width="50%" valign="top">

**🃏 Karten**
- Stundenplan (Desktop + Mobile)
- Mehrere Klassen
- Aktueller Unterricht
- 🏖️ Ferien-Screen
- Smart Status Bar
- DE / EN / FR

**🆕 Neu in v2.5.5**
- Ferien-Sensor (alle 16 Bundesländer)
- Reload-Button mit Animation
- Echtzeit Vertretungs-Erkennung
- Parallelkurs-Filter

</td>
</tr>
</table>

---

## 🚀 Installation

### Via HACS (empfohlen)

[![Open your Home Assistant instance and open the repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Maximilian-Andrew-Kluge&repository=VpMobile24&category=integration)

### Manuell

`custom_components/vpmobile24` → `config/custom_components/vpmobile24` kopieren → HA neu starten.

---

## ⚙️ Einrichtung

1. **Einstellungen → Geräte & Dienste → Integration hinzufügen → VpMobile24**
2. Schul-ID, Benutzername, Passwort eingeben
3. Klasse auswählen
4. Fächer auswählen *(Parallelkurse einzeln wählen)*
5. **Bundesland auswählen** *(für automatische Ferienerkennung)*

> [!TIP]
> Bundesland lässt sich nachträglich unter **Konfigurieren** ändern.

---

## 🃏 Lovelace Card Beispiele

<details>
<summary>📅 Stundenplan-Karte</summary>

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
```
</details>

<details>
<summary>👥 Mehrere Klassen-Karte</summary>

```yaml
type: custom:vpmobile24-multi-card
entities:
  - sensor.vpmobile24_7a_week_table
  - sensor.vpmobile24_7b_week_table
```
</details>

<details>
<summary>⏱️ Aktueller Unterricht-Karte</summary>

```yaml
type: custom:vpmobile24-current-card
entity: sensor.vpmobile24_aktueller_unterricht
next_entity: sensor.vpmobile24_naechste_stunde
week_entity: sensor.vpmobile24_heutiger_stundenplan
```
</details>

---

## 📡 Sensoren

| Sensor | State | Wichtige Attribute |
|--------|-------|--------------------|
| `week_table` | Anzahl | `week_table`, `next_week_table` |
| `naechste_stunde` | Fach | `zeit`, `lehrer`, `raum` |
| `heutiger_stundenplan` | Anzahl | `stunden_heute` |
| `zusatzinfos` | Anzahl | `allgemeine_infos` |
| `aenderungen` | Anzahl | `alle_aenderungen` |
| `aktueller_unterricht` | Fach | `fach`, `lehrer`, `raum` |
| `ferien` | Ferienname | `ist_ferien`, `start`, `end`, `bundesland` |

---

## ❓ FAQ

<details>
<summary>Welche Schulen werden unterstützt?</summary>

Alle Schulen die Stundenplan24.de oder VpMobil24 verwenden.
</details>

<details>
<summary>Muss ich YAML schreiben?</summary>

Nein — alles über die Home Assistant UI konfigurierbar.
</details>

<details>
<summary>Wie funktioniert die Ferienerkennung?</summary>

Bundesland beim Einrichten oder unter Konfigurieren auswählen. Daten kommen aus den offiziellen KMK-Ferienplänen.
</details>

<details>
<summary>Was ist der Parallelkurs-Filter?</summary>

In der Fächerauswahl erscheinen alle Kursgruppen (z.B. `789WB10`). Wähle nur deinen Kurs — Ausfälle anderer Gruppen werden ausgeblendet.
</details>

<details>
<summary>Probleme nach einem Update?</summary>

1. Integration entfernen
2. Neu konfigurieren
3. Home Assistant neu starten

Bei anhaltenden Problemen → [GitHub Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) oder [Discord](https://discord.gg/57uvCeRw43).
</details>

---

## 📸 Screenshots

<table>
<tr>
  <td align="center" width="50%"><b>Wochenübersicht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png" width="100%"/>
  </td>
  <td align="center" width="50%"><b>Lovelace Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png" width="100%"/>
  </td>
</tr>
<tr>
  <td align="center" width="50%"><b>Mehrere Klassen</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/multi-card.png" width="100%"/>
  </td>
  <td align="center" width="50%"><b>Aktueller Unterricht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/current-card.png" width="100%"/>
  </td>
</tr>
</table>

---

## 🤝 Mitmachen

> [!NOTE]
> 🐛 **Bug melden?** Bitte füge die XML-Rohdaten von stundenplan24.de bei — das hilft uns das Problem schnell zu lösen.
>
> 📋 **[→ Anleitung: XML-Daten abrufen](docs/xml-tutorial.md)**

| | |
|---|---|
| 🐛 Bug melden | [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) |
| 💬 Community | [Discord](https://discord.gg/57uvCeRw43) |
| 🌐 Website | [maximilian-andrew-kluge.github.io/VpMobile24](https://maximilian-andrew-kluge.github.io/VpMobile24/website/) |
| 🔧 Pull Request | [CONTRIBUTING.md](CONTRIBUTING.md) |
| 🔧 Diagnose | Einstellungen → Geräte & Dienste → VpMobile24 → Diagnose |

---

<div align="center">

**Mit ❤️ für die Home-Assistant Community entwickelt**

⭐ Hinterlasse einen Stern auf GitHub, wenn dir das Projekt gefällt.

</div>
