# Changelog

## 1.1.3

- Extension wird jetzt über `pi install npm:@ryukin-dev/pi-featherless-kali` als Pi-Paket geladen.
- Behebt das Problem, dass der Featherless-Provider nicht unter `/login` → API keys erschien.
- Alte manuelle Extension-/Skill-Kopien werden beim Start bereinigt.

## 1.1.2

- `kaliai` installiert den Pi Coding Agent automatisch, wenn er fehlt.
- Kein manueller `npm install -g @earendil-works/pi-coding-agent` mehr nötig.

## 1.1.1

- Unerwünschte Abhängigkeiten (`puppeteer`, `openai`, `JSONStream`) entfernt.
- Globale Installation bricht nicht mehr beim Chrome-Download ab.
- Package-Scope auf `@ryukin-dev` geändert.

## 1.1.0

- Package auf npm unter `@ryukin-dev/pi-featherless-kali` veröffentlicht.
- KaliAI CLI-Binary `kaliai` hinzugefügt:
  - `kaliai` startet direkt die Chat UI.
  - `kaliai Update` führt das Update durch.
  - `kaliai whatsnew` zeigt die neuesten Änderungen.
- Extensions und Skills werden automatisch in `~/.pi/agent/` eingerichtet.
- Update-Verfügbarkeitsbanner oben in der Chat UI.
- Neue Chat-Befehle: `/update`, `/whatsnew`.
- Featherless-Provider ist jetzt API-Key-basiert (`/login` → API keys).
