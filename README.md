🇬🇧 **[English Documentation](README_EN.md)**

<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/DE%20Banner.png" alt="VpMobile24" width="100%"/>

<br/><br/>

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Stable-v2.5.5-22c55e?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases/latest)
[![Beta](https://img.shields.io/badge/Beta-v2.6.6-f59e0b?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
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

## 🚀 Was ist neu in v2.6.x?

> [!IMPORTANT]
> **VpMobile24 v2.5.5** ist das aktuelle Stable Release. Die neuen Funktionen unten sind in den aktuellen Beta-Versionen (v2.6.x) verfügbar.
>
> 🔗 [Alle Release Notes →](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)

| Neu | Beschreibung |
|-----|-------------|
| 👨‍🏫 Lehrermodus | Eigener Modus für Lehrer — Plan nach Lehrerkürzel, Kürzel per Dropdown wählbar |
| 🛡️ Pausenaufsichten | Aufsichten werden im Lehrermodus erkannt und farblich hervorgehoben |
| 📢 Tagesinfos pro Tag | Zusatzinfos direkt pro Wochentag in der Tabelle — Hover für vollen Text, Klick für alle Details |
| 🎓 Oberstufenkurse | Kurze Kurskürzel (z.B. `la1`) werden jetzt korrekt erkannt und angezeigt |
| 0️⃣ Nullte Stunde | Stunde 0 (z.B. 07:50–08:35) wird abgerufen und angezeigt |
| 🔑 Reauth-Flow | Bei Passwortänderung erscheint direkt ein Dialog — kein Löschen/Neu-Einrichten mehr nötig |
| 📐 Kartengröße | Karten frei skalierbar in der Section-/Grid-Ansicht |
| 🔄 Zuverlässige Aktualisierung | Wochentabelle & Reload-Button laden nachträgliche Änderungen jetzt korrekt nach |

<details>
<summary>Frühere Highlights (v2.5.x)</summary>

| Neu | Beschreibung |
|-----|-------------|
| 🏖️ Ferien-Sensor | Automatische Ferienerkennung für alle 16 Bundesländer |
| 🔄 Reload-Animation | Pfeil dreht sich grün beim Aktualisieren |
| 📚 Echtzeit-Erkennung | Aktueller Unterricht erkennt auch Vertretungsstunden |
| 🌙 Vor Schulbeginn | Karte zeigt „Noch kein Unterricht" statt „Pause" |
| 🔵 Parallelkurs-Filter | Ausfälle fremder Kurse werden ausgeblendet |
| 🌐 Zusatzserver | Unterstützung für zusatz1–10 (z.B. für Schulen mit eigenem Server) |
| 🔑 Zugangsdaten ändern | Schul-ID, Passwort & Server nachträglich änderbar |

</details>

---

## 📖 Inhaltsverzeichnis

- [📌 Beschreibung](#-beschreibung)
- [✨ Funktionen](#-funktionen)
- [🚀 Installation](#-installation)
- [⚙️ Einrichtung](#️-einrichtung)
- [🃏 Lovelace Card Beispiele](#-lovelace-card-beispiele)
- [📸 Screenshots](#-screenshots)
- [📋 Hilfe & Tutorial](#-hilfe--tutorial)
- [❓ FAQ](#-faq)
- [🤝 Mitmachen](#-mitmachen)

---

## 📌 Beschreibung

**VpMobile24** bringt deinen Schulstundenplan direkt in Home Assistant — mit automatischen Sensoren, modernen Lovelace-Karten und Schulferien-Erkennung für alle 16 Bundesländer.

**Unterstützt:** Stundenplan24.de · VpMobil24

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

**🃏 Lovelace Karten**

- 📅 Wochenansicht (Desktop + Mobile)
- 👥 Mehrere Klassen
- ⏱️ Aktueller Unterricht
- 🏖️ Ferien-Screen
- 📢 Tagesinfos pro Tag (Hover + Klick)
- 🛡️ Pausenaufsichten (Lehrermodus)
- 📐 Frei skalierbar (Grid-Ansicht)
- 🌍 Mehrsprachig: DE / EN / FR
- 🔵 Parallelkurs-Filter
- 🛡️ CSP-sicher (nginx, DuckDNS)

</td>
</tr>
</table>

> [!NOTE]
> **👨‍🏫 Lehrermodus:** Neben dem Schülermodus gibt es jetzt einen eigenen Lehrermodus. Statt einer Klasse wählst du dein Lehrerkürzel (per Dropdown), und die Integration zeigt alle deine Stunden, Vertretungen und Pausenaufsichten.

---

## 🚀 Installation

### Via HACS *(empfohlen)*

[![In HACS öffnen](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Maximilian-Andrew-Kluge&repository=VpMobile24&category=integration)

### Manuell

1. Ordner `custom_components/vpmobile24` herunterladen
2. Nach `config/custom_components/vpmobile24` kopieren
3. Home Assistant neu starten

---

## ⚙️ Einrichtung

1. **Einstellungen → Geräte & Dienste → Integration hinzufügen → VpMobile24**
2. **Benutzertyp wählen:** Schüler, Lehrer oder Demo
3. Schul-ID, Passwort (und ggf. Server) eingeben
4. **Schülermodus:** Klasse + Fächer wählen *(Parallel- und Oberstufenkurse einzeln)* · **Lehrermodus:** Lehrerkürzel wählen
5. **Bundesland auswählen** *(für automatische Ferienerkennung)*

> [!TIP]
> Bundesland, Fächer/Kurse, Klasse, Lehrerkürzel und Zugangsdaten lassen sich nachträglich unter **Einstellungen → VpMobile24 → Konfigurieren** ändern. Bei geändertem Passwort erscheint automatisch ein Reauth-Dialog.

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

## 📸 Screenshots

<table>
<tr>
  <td align="center" width="50%"><b>📅 Wochenübersicht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/overview.png" width="100%"/>
  </td>
  <td align="center" width="50%"><b>🃏 Lovelace Card</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/card.png" width="100%"/>
  </td>
</tr>
<tr>
  <td align="center" width="50%"><b>👥 Mehrere Klassen</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/multi-card.png" width="100%"/>
  </td>
  <td align="center" width="50%"><b>⏱️ Aktueller Unterricht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/current-card.png" width="100%"/>
  </td>
</tr>
</table>

---

## 📋 Hilfe & Tutorial

> [!NOTE]
> 🐛 **Bug melden?** Bitte füge die XML-Rohdaten von stundenplan24.de bei — das hilft uns das Problem schnell zu lösen.
>
> 📋 **[→ Anleitung: XML-Daten abrufen](docs/xml-tutorial.md)**

| Ressource | Link |
|-----------|------|
| 📋 XML-Tutorial | [docs/xml-tutorial.md](docs/xml-tutorial.md) |
| 🐛 Bug melden | [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new) |
| 💬 Community | [Discord](https://discord.gg/57uvCeRw43) |
| 🌐 Website | [Zur Website](https://maximilian-andrew-kluge.github.io/VpMobile24/website/) |
| 🔧 Diagnose | Einstellungen → VpMobile24 → Diagnose herunterladen |

---

## ❓ FAQ

<details>
<summary>Welche Schulen werden unterstützt?</summary>

Alle Schulen die **Stundenplan24.de** oder **VpMobil24** verwenden.
</details>

<details>
<summary>Muss ich YAML schreiben?</summary>

Nein — alles ist über die Home Assistant UI konfigurierbar.
</details>

<details>
<summary>Wie funktioniert die Ferienerkennung?</summary>

Bundesland beim Einrichten oder unter Konfigurieren auswählen. Die Daten kommen aus den offiziellen KMK-Ferienplänen.
</details>

<details>
<summary>Was ist der Parallelkurs-Filter?</summary>

In der Fächerauswahl erscheinen alle Kursgruppen (z.B. `789WB10`, `7INb1`, `la1`). Wähle nur deinen Kurs — Ausfälle anderer Gruppen werden dann ausgeblendet. Auch kurze Oberstufenkurse wie `la1` werden korrekt erkannt.
</details>

<details>
<summary>Gibt es einen Lehrermodus?</summary>

Ja. Beim Einrichten „Lehrer" als Benutzertyp wählen und dein Kürzel per Dropdown auswählen. Die Integration zeigt dann alle deine Stunden, Vertretungen und Pausenaufsichten. Aufsichten werden in der Karte farblich hervorgehoben.
</details>

<details>
<summary>Werden Tagesinfos / Tagesevents angezeigt?</summary>

Ja. Zusatzinfos erscheinen als eigene Zeile pro Wochentag direkt in der Wochentabelle. Hover zeigt den vollen Text, ein Klick öffnet alle Details des jeweiligen Tages.
</details>

<details>
<summary>Meine Schule hat eine nullte Stunde — wird die unterstützt?</summary>

Ja, Stunde 0 (z.B. 07:50–08:35) wird abgerufen und in Tabelle, Karte und Sensoren angezeigt — inklusive Vertretungen und Ausfällen. Schulen ohne nullte Stunde sehen keine leere Zeile.
</details>

<details>
<summary>Probleme nach einem Update?</summary>

1. Integration entfernen
2. Neu konfigurieren
3. Home Assistant neu starten

Bei weiteren Problemen → [GitHub Issue erstellen](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues) oder [Discord](https://discord.gg/57uvCeRw43).
</details>

<details>
<summary>Unterstützt die Integration mehrere Klassen?</summary>

Ja — mehrere Klassen und Parallelkurse werden unterstützt. Jede Klasse wird als separate Integration eingerichtet.
</details>

---

## 🤝 Mitmachen

* 🐛 Bug melden → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)
* 💬 Community → [Discord](https://discord.gg/57uvCeRw43)
* 🔧 Pull Request → [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Mit ❤️ für die Home-Assistant Community entwickelt**

⭐ Hinterlasse einen Stern auf GitHub, wenn dir das Projekt gefällt.

</div>
