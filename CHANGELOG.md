# Changelog

## 1.1.8

- Neuer fester Shell-Helper `kali-sh` hinzugefügt:
  - `run`, `exec`, `create`, `write`, `delete`, `mkdir`, `cat`, `ls`, `exists`
  - `--json` Ausgabe für alle Befehle
  - `--yes`/`--force` für Verzeichnis-Löschungen

## 1.1.7

- Alle vorherigen Uncensored-Modelle entfernt.
- Stattdessen `llmfan46/Tower-Plus-72B-ultra-uncensored-heretic` hinzugefügt:
  - `model_class`: `qwen2-72b`, 32k Kontext, Tool-Use.

## 1.1.6

- Alle Modelle auf maximal 36k Tokens Kontext/Output begrenzt.
- Huihui-Modelle entfernt.
- Neue Uncensored-Modelle hinzugefügt:
  - `Dogge/llama-3-70B-instruct-uncensored`
  - `Guilherme34/Hermes-3-Llama-3.1-70B-Uncensored`
  - `Kizexc/Phoenix-Llama-3.1-70B-Uncensored`
  - `AskVenice/venice-uncensored`
  - `BlossomsAI/Qwen2.5-Coder-14B-Instruct-Uncensored`
  - `FiditeNemini/Qwen2.5-14B-DeepSeek-R1-1M-Uncensored`
  - `DavidAU/Gemma-3-27b-it-Uncensored-HERETIC-Gemini-Deep-Reasoning`
  - `InfinimindCreations/gemma-4-31B-it-uncensored`
  - `EldritchLabs/MN-12B-Mag-Mell-R1-Uncensored-Scale1.2`
  - `DavidAU/Qwen3.5-21B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking`
  - `GitMylo/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-safetensors`
  - `ModelsLab/Llama-3-uncensored-Dare-1`
  - `ChiKoi7/Llama-3.1-8B-Lexi-Uncensored-V2-Heretic`
- Thinking/Reasoing-Unterstützung korrigiert:
  - `moonshotai/Kimi-K2-Thinking` hinzugefügt.
  - Reasoning-Flag automatisch für Modelle mit `thinking`, `QwQ`, `reason` oder `R1` im Namen.
  - `QwQ`-Preview explizit als Reasoning markiert.

## 1.1.5

- Neue Modelle hinzugefügt:
  - `moonshotai/Kimi-K2.6`
  - `moonshotai/Kimi-K2.7-Code`
  - `deepseek-ai/DeepSeek-V4-Pro`
  - `deepseek-ai/DeepSeek-V4-Flash`
  - `huihui-ai/Llama-3.3-70B-Instruct-abliterated`
- `kimi-k25` Kontextlimit auf 262k Tokens aktualisiert.

## 1.1.4

- Das Paket wählt nach dem Speichern des Featherless-API-Keys automatisch ein Standardmodell aus, sodass kein `/model` mehr nötig ist.

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
