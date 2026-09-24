# Changelog

All notable changes to this project will be documented in this file.

## \[2.6.5\] - 2026-08-27

### Changed

-   Ausfall-Anzeige jetzt als kompakte Pill direkt im Header (neben KW/Aktuell) statt als eigene Zeile; wandert auf schmalen Displays in die nächste Zeile
-   Stunden-Detail-Popup komplett modernisiert: großes Fach + Stunden-Badge im Header, Details als Icon-Karten (Zeit/Lehrer/Raum/Klasse); aktuelle Stunde zeigt ein „Jetzt"-Badge
-   Ausfall- und Vertretungs-Popup vereinheitlicht: kompakt, zentriert, Status-Badge + Akzentrahmen statt großer Vollfläche (rot bzw. amber)
-   Alle Popups teilen jetzt ein einheitliches Design-System (Radius, Button, Overlay, Öffnen-Animation)

## \[2.6.4\] - 2026-08-27

### Changed

-   Zusatzinfo-Fenster: „Stunden-Informationen" (einzelne Ausfall-/Vertretungsmeldungen) werden dort nicht mehr angezeigt — sie erscheinen weiterhin im Stundenplan selbst. Das Fenster zeigt nur noch allgemeine Tagesinfos.
-   Zusatzinfo-Fenster modernisiert: dezenter blauer Icon-Header, leichte Info-Einträge (Bullet + Hover statt schwerer Boxen), dünne Scrollbar, moderner Schließen-Button
-   Obere Buttons vereinheitlicht: „Nächste Woche" und Reload gleiche Höhe, Reload als quadratische Icon-Pill
-   Stundenfelder leicht vergrößert (58px, größere Fachkürzel) bei weiterhin exakt gleichen Zellengrößen; Ausfalltext etwas kompakter

## \[2.6.3\] - 2026-08-27

### Changed

-   Stundenplan-Zellen sind jetzt exakt gleich groß — lange Ausfall-/Vertretungstexte vergrößern die Zelle nicht mehr (feste Zellenhöhe, `table-layout: fixed`, gleiche Spaltenbreiten, Text clippt statt zu wachsen)
-   Info-Button aus dem Karten-Header entfernt; „Nächste Woche" und Reload stehen jetzt kompakt zusammen (Tagesinfos bleiben über die 📌-Zeile im Plan erreichbar)

## \[2.6.2\] - 2026-08-27

### Changed

-   Stundenplan-Card UI modernisiert: ruhigeres Design mit klarer Statushierarchie — Status (Ausfall/Vertretung/Aufsicht) jetzt als linker Rand + Statuspunkt statt vollflächiger Farbe
-   Aktuelle Stunde klarer hervorgehoben (dezenter blauer Akzent statt starkem Glow)
-   Pausen dezenter, weichere Radien, mehr Whitespace, modernere Header-Pills und Legende
-   Bessere Light-Mode-Kontraste, Fokus-States und `prefers-reduced-motion`-Unterstützung
-   Keine funktionalen Änderungen — nur Darstellung

## \[2.6.1\] - 2026-08-27

### Fixed

-   Nullte Stunde (Stunde 0, z.B. 07:50–08:35) wird jetzt korrekt abgerufen und in Wochentabelle, Karte und Sensoren angezeigt — inkl. Vertretungen/Ausfälle in Stunde 0 (#-Ticket)
-   Behoben, dass `period == 0` fälschlich als "leer" verworfen wurde (0 ist in Python falsy)
-   Karte (Wochen- und Mehrklassen-Ansicht) rendert Stunde 0 nun, wenn Daten dafür vorliegen

## \[2.6.0\] - 2026-08-27

### Fixed

-   Oberstufenkurse (z.B. `la1`) werden jetzt korrekt erkannt und im Stundenplan angezeigt (#17) — kurze Kurskürzel wurden bisher fälschlich als normales Fach behandelt
-   Wochentabelle aktualisiert sich jetzt zuverlässig: heutiger + kommende Tage der Woche werden bei jedem Update neu geladen, sodass nachträgliche Änderungen auf stundenplan24.de übernommen werden (#15)
-   Reload-Button lädt jetzt wirklich alle Daten neu (kompletter Cache-Reset) statt nur den heutigen Tag
-   Ein zurückgezogener Tagesplan (404) entfernt jetzt die veralteten Daten aus dem Cache

### Changed

-   Kursauswahl bei der Ersteinrichtung: Kursgruppen und normale Fächer werden jetzt sauber getrennt (Kurse als Opt-in)

## \[2.5.9\] - 2026-08-27

### Fixed

-   Ferien-Abruf: HTTP 429 (Rate-Limit von ferien-api.de) wird jetzt sauber behandelt — vorhandene Feriendaten bleiben erhalten statt verworfen zu werden
-   Überflüssige Debug-Ausgaben aus dem Fehler-Log entfernt (Ferien-Abruf wurde versehentlich als Warnung geloggt)

## \[2.5.8\] - 2026-08-27

### Added

-   Pausenaufsichten (Lehrermodus) werden jetzt erkannt und farblich hervorgehoben
-   Tagesinfos werden als eigene Zeile pro Wochentag direkt in der Wochentabelle angezeigt (vorher nur im Info-Popup für heute)
-   Tagesinfos: Hover zeigt den vollen Text, Klick öffnet alle Details des jeweiligen Tages
-   Karten lassen sich in der Section-/Grid-Ansicht frei skalieren (getGridOptions für alle Karten)

### Fixed

-   Mehrklassen-Karte zeigt nicht mehr den vollen Entitätsnamen an, sondern das saubere Klassen-/Lehrerkürzel

### Changed

-   Demo-/Testmodus zeigt jetzt Pausenaufsichten und Tagesinfos, damit die neuen Funktionen ohne echte Schuldaten testbar sind

## \[2.5.7.2\] - 2026-08-27

### Fixed

-   Lehrerkürzel werden nach Passwortänderung/Neu-Einrichtung wieder korrekt angezeigt
-   Suchfenster für Tagespläne auf ±30 Tage erweitert (vorher nur ~10 Tage)
-   Fallback auf Klassen.xml wenn keine Tagespläne verfügbar sind (z.B. Schuljahreswechsel)

### Added

-   Reauth-Flow: Bei ungültigem Passwort erscheint direkt ein Dialog in HA — kein Löschen/Neu-Einrichten mehr nötig
-   Paralleles Laden der Lehrerliste (5 Anfragen gleichzeitig statt nacheinander)

## \[2.5.0\] - 2026-06-08

### Added

-   Improved Home Assistant integration
-   Updated Lovelace card
-   Various bug fixes and optimizations

## \[2.4.0\]

### Added

-   New sensors and entities
