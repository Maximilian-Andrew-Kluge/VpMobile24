# 📋 XML-Daten für Bug-Reports abrufen

> [!IMPORTANT]
>
> **Bitte schicke diese Daten mit wenn du einen Bug meldest.**
> Ohne die XML-Datei können wir das Problem meistens nicht nachvollziehen.
>
> 🔗 Bug melden → [GitHub Issues](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

---

## Warum brauchen wir die XML-Datei?

VpMobile24 liest die Daten direkt von stundenplan24.de als XML-Datei.
Wenn etwas falsch angezeigt wird (z.B. Ausfall statt normalem Unterricht), liegt der Fehler oft in der XML-Struktur der Schule.

Mit der XML-Datei können wir das Problem **in wenigen Minuten** finden und fixen.

---

## 🖥️ Schritt-für-Schritt Anleitung

### 1️⃣ Browser-Entwicklertools öffnen

Öffne **Chrome**, **Edge** oder **Firefox** und drücke `F12`.

> [!TIP]
> Du kannst auch **Rechtsklick** auf die Seite → **Untersuchen** klicken.

---

### 2️⃣ Tab "Netzwerk" öffnen

Klicke im Entwicklertools-Fenster oben auf:

| Browser | Tab-Name |
|---------|----------|
| Chrome / Edge | **Netzwerk** |
| Firefox | **Netzwerkanalyse** |

---

### 3️⃣ stundenplan24.de aufrufen

Gib in der Adressleiste ein:

```
https://www.stundenplan24.de/DEINE_SCHUL_ID/mobil/
```

> Ersetze `DEINE_SCHUL_ID` durch deine Schulnummer — z.B. `10213745`.

Logge dich mit Benutzername und Passwort ein.

---

### 4️⃣ XML-Datei finden

Im Netzwerk-Tab siehst du alle Anfragen. Gib in das Suchfeld ein:

```
.xml
```

Du siehst dann Dateien wie:

```
20260817_10b.xml
```

Klicke auf eine dieser Dateien.

---

### 5️⃣ XML-Inhalt kopieren

1. Klicke auf den Tab **Antwort** (Chrome/Edge) bzw. **Antwort** (Firefox)
2. Rechtsklick in den Text → **Alles auswählen** → **Kopieren**

---

### 6️⃣ In GitHub Issue einfügen

Öffne ein neues Issue und füge den XML-Inhalt zwischen Backticks ein:

````markdown
```xml
HIER DEN XML-INHALT EINFÜGEN
```
````

🔗 [Neues Issue erstellen →](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)

---

## 🔒 Datenschutz

> [!NOTE]
>
> Die XML-Datei enthält **Lehrernamen** und Stundenplaninformationen — aber **keine Schülerdaten**.
>
> Du kannst Lehrernamen vor dem Einfügen durch `Lehrer1`, `Lehrer2` etc. ersetzen wenn du das möchtest.

---

## ❓ Brauchst du Hilfe?

Komm in den **[Discord](https://discord.gg/57uvCeRw43)** — wir helfen dir Schritt für Schritt.
