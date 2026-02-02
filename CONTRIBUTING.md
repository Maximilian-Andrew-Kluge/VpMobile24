# Beitragen zur VpMobile24 Integration

Vielen Dank für dein Interesse, zur VpMobile24 Home Assistant Integration beizutragen! 

## 🚀 Wie du beitragen kannst

### Bug Reports
- Verwende die [Issue Templates](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues/new/choose)
- Beschreibe das Problem detailliert
- Füge relevante Logs hinzu
- Gib deine Home Assistant Version an

### Feature Requests
- Beschreibe das gewünschte Feature
- Erkläre den Anwendungsfall
- Diskutiere mögliche Implementierungsansätze

### Code Beiträge

#### Entwicklungsumgebung einrichten

1. **Repository forken und klonen**:
```bash
git clone https://github.com/Maximilian-Andrew-Kluge/VpMobile24.git
cd VpMobile24
```

2. **Development Branch erstellen**:
```bash
git checkout -b feature/mein-neues-feature
```

#### Code Standards

- **Python Code Style**: Folge PEP 8
- **Type Hints**: Verwende Type Hints wo möglich
- **Docstrings**: Dokumentiere Funktionen und Klassen
- **Logging**: Verwende das Home Assistant Logging System
- **Async/Await**: Verwende async/await für I/O Operationen

#### Pull Request Prozess

1. **Stelle sicher, dass dein Code funktioniert**:
   - Teste mit einer echten stundenplan24.de Installation
   - Überprüfe alle Sensoren und den Kalender
   - Teste die Konfiguration

2. **Commit Messages**:
   - Verwende aussagekräftige Commit Messages
   - Folge dem Format: `type(scope): description`
   - Beispiele:
     - `feat(sensor): add new lesson duration sensor`
     - `fix(config): handle missing class data gracefully`
     - `docs(readme): update installation instructions`

3. **Pull Request erstellen**:
   - Beschreibe deine Änderungen detailliert
   - Referenziere relevante Issues
   - Füge Screenshots hinzu (bei UI-Änderungen)

## 🔧 Entwicklungsrichtlinien

### Architektur

```
custom_components/vpmobile24/
├── __init__.py          # Integration Setup
├── api_new.py          # API Client für stundenplan24.de
├── calendar.py         # Kalender Platform
├── config_flow.py      # Konfigurationsflow
├── const.py           # Konstanten
├── manifest.json      # Integration Manifest
├── sensor.py          # Sensor Platform
├── strings.json       # UI Strings (Englisch)
└── translations/
    └── de.json        # Deutsche Übersetzungen
```

## 🐛 Debugging

### Debug Logs aktivieren

```yaml
# configuration.yaml
logger:
  default: warning
  logs:
    custom_components.vpmobile24: debug
```

## 📞 Kontakt

Bei Fragen zur Entwicklung:
- Öffne ein [Discussion](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/discussions)
- Erstelle ein [Issue](https://github.com/Maximilian-Andrew-Kluge/VpMobile24/issues)

Vielen Dank für deine Beiträge! 🙏