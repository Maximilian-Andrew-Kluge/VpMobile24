🇬🇧 **[English Documentation](README_EN.md)**

<div align="center">

<img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/Github/DE%20Banner.png" alt="VpMobile24" width="100%"/>

<br/><br/>


[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Version-2.5.0-3b82f6?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases)
[![Status](https://img.shields.io/badge/Status-Stable-22c55e?style=for-the-badge)](https://github.com/Maximilian-Andrew-Kluge/VpMobile24)
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

# 🚀 Aktuelles Release

> [!IMPORTANT]
>
> 🎉 **VpMobile24 v2.5.0  ist jetzt verfügbar**
>
> 📅 Veröffentlicht am **08.06.2026**
>
> 📥 Jetzt über HACS aktualisieren.
>
> 🔗 Release Notes:
>
> https://github.com/Maximilian-Andrew-Kluge/VpMobile24/releases

---

# 📅 Release-Zyklus

> [!IMPORTANT]
>
> 🚀 Reguläre Updates erscheinen immer am **15. eines Monats**.
>
> Neue Funktionen, Verbesserungen und Optimierungen werden gesammelt und als stabiles Release veröffentlicht.
>
> Kritische Fehler oder Sicherheitsprobleme werden sofort als Hotfix veröffentlicht.

Beispiele:

* `v2.5.1` → Kritischer Bugfix
* `v2.5.2` → Sicherheitsupdate
* `v2.6.0` → Neue Funktionen

---

# 🔄 Probleme nach einem Update?

> [!TIP]
>
> Falls die Integration nach einem Update nicht funktioniert:
>
> 1. Integration entfernen
> 2. Neu konfigurieren
> 3. Home Assistant neu starten
>
> Sollte das Problem bestehen bleiben, erstelle bitte ein GitHub-Issue oder besuche den Discord-Server.

---


## 📌 Beschreibung

**VpMobile24** ist eine moderne Home-Assistant-Integration für **Stundenplan24.de / VpMobil24**.

Die Integration bringt deinen Stundenplan direkt in Home Assistant und erstellt automatisch Sensoren für:

* Aktuelle Stunde
* Nächste Stunde
* Stundenplan heute
* Wochentabelle
* Änderungen
* Zusatzinformationen

Zusätzlich werden moderne Lovelace-Karten bereitgestellt.

---

## ✨ Funktionen

### 📡 Sensoren

| Sensor               | Beschreibung              |
| -------------------- | ------------------------- |
| week_table           | Komplette Wochentabelle   |
| naechste_stunde      | Nächste Unterrichtsstunde |
| heutiger_stundenplan | Stundenplan heute         |
| zusatzinfos          | Allgemeine Informationen  |
| aenderungen          | Änderungen & Vertretungen |
| aktueller_unterricht | Aktuell laufende Stunde   |

### 🃏 Lovelace Card

* Wochenansicht
* Mehrere Klassen
* Aktueller Unterricht
* Responsive Design
* DE / EN / FR
* Parallelkurse
* Automatische Aktualisierung

---

# 📸 Screenshots

### 🗓️ Wochenübersicht

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

### ⚙️ Konfiguration

<table>
<tr>
  <td align="center" width="50%">
    <b>Einrichtung</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/config.png" alt="Konfiguration" width="100%"/>
  </td>

  <td align="center" width="50%">
    <b>Fächerauswahl (inkl. Parallelkurse)</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/subject-select.png" alt="Fächerauswahl" width="100%"/>
  </td>
</tr>
</table>

### 👥 Mehrere Klassen · ⏱️ Aktueller Unterricht

<table>
<tr>
  <td align="center" width="50%">
    <b>Mehrere Klassen</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/multi-card.png" alt="Mehrere Klassen" width="100%"/>
  </td>

  <td align="center" width="50%">
    <b>Aktueller Unterricht</b><br/><br/>
    <img src="https://raw.githubusercontent.com/Maximilian-Andrew-Kluge/VpMobile24/main/docs/current-card.png" alt="Aktueller Unterricht" width="100%"/>
  </td>
</tr>
</table>


---

# 🚀 Installation

### Installation via HACS

<div>

[![Open your Home Assistant instance and open the repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Maximilian-Andrew-Kluge&repository=VpMobile24&category=integration)

</div>

---

### Manuelle Installation

Ordner:

```text
custom_components/vpmobile24
```

nach

```text
config/custom_components/vpmobile24
```

kopieren und Home Assistant neu starten.

---

# ⚙️ Einrichtung

1. Einstellungen
2. Geräte & Dienste
3. Integration hinzufügen
4. **VpMobile24** auswählen

Dann eingeben:

* Schul-ID
* Benutzername
* Passwort
* Klasse auswählen
* Fächer auswählen (Parallelkurse einzeln wählen)

---

# 🃏 Lovelace Card Beispiele

### Stundenplan-Karte

```yaml
type: custom:vpmobile24-card
entity: sensor.vpmobile24_week_table
```

### Mehrere Klassen-Karte

```yaml
type: custom:vpmobile24-multi-card
entities:
  - sensor.vpmobile24_7a_week_table
  - sensor.vpmobile24_7b_week_table
```

### Aktueller Unterricht-Karte

```yaml
type: custom:vpmobile24-current-card
entity: sensor.vpmobile24_aktueller_unterricht
next_entity: sensor.vpmobile24_naechste_stunde
week_entity: sensor.vpmobile24_heutiger_stundenplan
```

---

# 📡 Sensoren

| Sensor               | State        | Attribute                  |
| -------------------- | ------------ | -------------------------- |
| week_table           | Anzahl       | week_table, next_week_table |
| naechste_stunde      | Fach         | zeit, lehrer, raum         |
| heutiger_stundenplan | Anzahl       | stunden_heute              |
| zusatzinfos          | Anzahl       | allgemeine_infos           |
| aenderungen          | Anzahl       | alle_aenderungen           |
| aktueller_unterricht | Fach         | fach, lehrer, raum         |

---

# ❓ FAQ

### Welche Schulen werden unterstützt?

Alle Schulen die Stundenplan24.de oder VpMobil24 verwenden.

### Muss ich YAML schreiben?

Nein.

Alles kann über die Home Assistant UI konfiguriert werden.

### Unterstützt die Integration mehrere Klassen?

Ja.

Mehrere Klassen und Parallelkurse werden unterstützt.

### Was ist der Parallelkurs-Filter?

In der Fächerauswahl erscheinen alle Kursgruppen (z.B. `789WB10`, `7INb1`).
Wähle nur deinen eigenen Kurs aus — dann werden Ausfälle anderer Gruppen nicht angezeigt.

---

# 🔧 Diagnose

Diagnose ist verfügbar unter:

```text
Einstellungen
→ Geräte & Dienste
→ VpMobile24
→ Diagnose herunterladen
```

---

# 🤝 Mitmachen

* 🐛 Bug melden → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)
* 💬 Community → [Discord](https://discord.gg/57uvCeRw43)
* 🔧 Pull Request → [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Mit ❤️ für die Home-Assistant Community entwickelt**

⭐ Hinterlasse einen Stern auf GitHub, wenn dir das Projekt gefällt.

</div>
