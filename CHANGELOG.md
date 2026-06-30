# Changelog

## 1.1.0

- Package auf npm unter `@ryukin-dev/pi-featherless-kali` veröffentlicht.
- KaliAI CLI-Binary `kali-ai` hinzugefügt:
  - Menu statt direktem `pi` Start.
  - `kali-ai chat` startet die Chat UI.
  - `kali-ai update` führt das Update durch.
  - `kali-ai whatsnew` zeigt die neuesten Änderungen.
- Extensions und Skills werden automatisch in `~/.pi/agent/` eingerichtet.
- Update-Verfügbarkeitsbanner oben in der Chat UI.
- Neue Chat-Befehle: `/kali-update`, `/kali-whatsnew`.
- Package-Scope auf `@earendil-works/pi-*` umgestellt.
- Featherless-Provider ist jetzt API-Key-basiert (`/login` → API keys).