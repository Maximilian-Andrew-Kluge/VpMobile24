# 📋 XML-Daten für Bug-Reports abrufen

Wenn du ein Problem mit VpMobile24 meldest, hilft es uns enorm wenn du die rohen XML-Daten von stundenplan24.de mitschickst.
So kommen wir schneller zur Lösung — ohne hin und her.

---

## 🖥️ Schritt-für-Schritt Anleitung

### Schritt 1 — Browser-Entwicklertools öffnen

Öffne **Chrome**, **Edge** oder **Firefox** und drücke:

```
F12
```

Es öffnet sich das Entwicklertools-Fenster.

---

### Schritt 2 — Auf den Tab "Netzwerk" wechseln

Klicke oben im Entwicklertools-Fenster auf den Tab:

> **Netzwerk** (Chrome/Edge) oder **Netzwerkanalyse** (Firefox)

---

### Schritt 3 — stundenplan24.de aufrufen

Gib in der Adressleiste ein:

```
https://www.stundenplan24.de/DEINE_SCHUL_ID/mobil/
```

Ersetze `DEINE_SCHUL_ID` durch deine Schulnummer (z.B. `10213745`).

Logge dich mit deinem Benutzernamen und Passwort ein wenn du dazu aufgefordert wirst.

---

### Schritt 4 — XML-Datei finden

Im Netzwerk-Tab siehst du jetzt alle Anfragen die der Browser macht.

1. Gib oben in das **Suchfeld** des Netzwerk-Tabs ein:
   ```
   .xml
   ```
2. Du siehst jetzt Dateien wie:
   ```
   20260817_10b.xml
   ```
3. Klicke auf eine dieser Dateien

---

### Schritt 5 — XML-Inhalt kopieren

1. Klicke auf den Tab **Antwort** (Chrome/Edge) oder **Antwort** (Firefox)
2. Du siehst den XML-Inhalt
3. Klicke mit der rechten Maustaste in den Text → **Alles auswählen** → **Kopieren**

---

### Schritt 6 — XML in das GitHub Issue einfügen

1. Öffne das GitHub Issue: [github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new)
2. Füge den XML-Inhalt in das Textfeld ein — **zwischen drei Backticks**:

````
```xml
HIER DEN XML-INHALT EINFÜGEN
```
````

3. Issue absenden

---

## 🔒 Datenschutz-Hinweis

> ⚠️ Die XML-Datei enthält Lehrernamen und Stundenplaninformationen.
>
> Du kannst Lehrernamen vor dem Einfügen durch `Lehrer1`, `Lehrer2` etc. ersetzen wenn du das möchtest.
> Schüler-Daten sind in der XML-Datei normalerweise **nicht** enthalten.

---

## ❓ Hilfe

Wenn du nicht weiterkommst, frage im **[Discord](https://discord.gg/57uvCeRw43)** — wir helfen dir.
