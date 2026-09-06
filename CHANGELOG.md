# Changelog

All notable changes to this project will be documented in this file.

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
