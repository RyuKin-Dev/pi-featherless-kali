# pi-featherless — Kali Linux Rebuild

> **Attribution:** This is a rebuilt, Kali Linux-targeted copy of the original [`CodeDoes/pi-featherless`](https://github.com/CodeDoes/pi-featherless) project. The original code, structure, and model registry were created by **CodeDoes** / **KitAstro** (AstralCosmo). This repository fixes the upstream syntax error, restores the build, adapts the package scope for the published Pi agent, and adds Kali install/update paths.

## What was changed compared to upstream?

| Item | Upstream | This rebuild |
|------|----------|--------------|
| `src/models.ts` | Dangling `tool_use: true,` block (syntax error) | Fixed — orphan block removed |
| `src/models.ts` `getModelClass()` | Only exact-id lookup | Falls back to known class patterns so removed-but-still-referenced models behave correctly |
| `package.json` | Self-dependency `@codedoes/pi-featherless`: `"."` | Removed — avoids pnpm registry 404 |
| Package scope | `@mariozechner/pi-*` | Switched to `@earendil-works/pi-ai` / `@earendil-works/pi-coding-agent` |
| Distribution | Nur Source-Clone | npm-Paket `@earendil-works/pi-featherless-kali` mit `kali-ai` CLI |
| `src/handlers/provider.ts` | OAuth-style login | API-key provider using `$FEATHERLESS_API_KEY`; appears under `/login` -> **API keys** |
| Type-check command | Missing | `pnpm tsc --noEmit` now works |
| Install script | None | `install-kali.sh` for global source install |
| Update script | None | `update-kali.sh` pulls latest changes, reinstalls, and re-runs tests |
| Bundled skills | None | `websearch` and `kali-admin` |
| Update-Banner | None | Automatische "Update verfügbar"-Meldung oben in der Chat UI |
| Code style | File-level JSDoc and section-divider comments | Removed to avoid AI-typical comment patterns |

All functional source logic is preserved 1:1 from the original repository; only imports, provider registration, build/install metadata, CLI helpers, and comments were changed.

## Requirements

- Kali Linux (native or WSL)
- Node.js ≥ 20 (so `corepack` is available)  
  `sudo apt update && sudo apt install -y nodejs npm`
- `pnpm` (enabled via corepack)
- A Featherless AI API key: https://featherless.ai/account/api-keys

## Install via npm

```bash
npm install -g @earendil-works/pi-coding-agent
npm install -g @ryukin-dev/pi-featherless-kali
```

Danach reicht im Terminal:

```bash
kaliai
```

`kaliai` startet die Chat UI. `kaliai Update` aktualisiert das Paket.

### Direktbefehle

```bash
kaliai              # Chat UI starten
kaliai Update       # KaliAI aktualisieren
kaliai whatsnew     # Neueste Änderungen anzeigen
```

> Der Scope ist `@ryukin-dev`, weil `@earendil-works` eine fremde npm-Organisation ist.

## Install aus dem Source-Repo

```bash
chmod +x install-kali.sh
./install-kali.sh          # global install to ~/.pi/agent/extensions/pi-featherless
```

Project-local install:

```bash
./install-kali.sh --project /path/to/your/project
```

## Update eines Source-Installs

```bash
chmod +x update-kali.sh
./update-kali.sh
```

Project-local update:

```bash
./update-kali.sh --project /path/to/your/project
```

Skip verification with `--skip-tests`; discard local edits with `--force`.

## Verify

```bash
cd ~/.pi/agent/extensions/pi-featherless
pnpm test        # vitest — 13 tests should pass
pnpm tsc --noEmit
```

## Quick API test

```bash
export FEATHERLESS_API_KEY="sk-..."
pnpm exec tsx test-api.ts ping
```

## Usage in the Pi Chat UI

Because the provider is configured as an API-key provider, it appears under **API keys** in the login menu.

```text
/login
# Choose API keys -> Featherless AI, then paste your key.

/model zai-org/GLM-5

# Later, clear the stored key with:
/logout
```

### KaliAI-Befehle in der Chat UI

```text
/update             # Auf neueste npm-Version aktualisieren
/whatsnew           # Changelog anzeigen
```

Wenn ein Update verfügbar ist, erscheint oben in der Chat UI ein Banner mit der neuen Version. Nach dem Update wird das Changelog kurz eingeblendet, bis das Banner verschwindet.

## Bundled skills

- **websearch** — search the web via Brave (with `BRAVE_API_KEY`) or DuckDuckGo, and extract readable article text from URLs.
- **kali-admin** — authorizes the agent to run shell commands, use `sudo`, install packages with `apt`, manage services, and use Kali's security tooling.

## Troubleshooting

- `pnpm: command not found` → `corepack enable && corepack prepare pnpm@latest --activate`
- `ERR_PNPM_FETCH_404 @codedoes/pi-featherless` → Use this rebuilt copy (self-dependency removed)
- TypeScript missing → `pnpm install` (typescript/tsx are devDependencies)
- Cannot find module `@earendil-works/pi-coding-agent` → Install the main agent globally: `npm install -g @earendil-works/pi-coding-agent`

**Original project:** [CodeDoes/pi-featherless](https://github.com/CodeDoes/pi-featherless)  
**Rebuild author:** Alessandro / RyuKin-Dev
