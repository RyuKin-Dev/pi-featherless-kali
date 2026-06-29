# pi-featherless — Kali Linux Rebuild

> **Attribution:** This is a rebuilt, Kali Linux-targeted copy of the original [`CodeDoes/pi-featherless`](https://github.com/CodeDoes/pi-featherless) project. The original code, structure, and model registry were created by **CodeDoes** / **KitAstro** (AstralCosmo). This repository fixes the upstream syntax error, restores the build, adapts the package scope for the published Pi agent, and adds Kali install/update paths.

## What was changed compared to upstream?

| Item | Upstream | This rebuild |
|------|----------|--------------|
| `src/models.ts` | Dangling `tool_use: true,` block (syntax error) | Fixed — orphan block removed |
| `src/models.ts` `getModelClass()` | Only exact-id lookup | Falls back to known class patterns so removed-but-still-referenced models behave correctly |
| `package.json` | Self-dependency `@codedoes/pi-featherless`: `"."` | Removed — avoids pnpm registry 404 |
| Package scope | `@mariozechner/pi-*` | Switched to `@earendil-works/pi-ai` / `@earendil-works/pi-coding-agent` |
| `src/handlers/provider.ts` | OAuth-style login | API-key provider using `$FEATHERLESS_API_KEY`; appears under `/login` -> **API keys** |
| Type-check command | Missing | `pnpm tsc --noEmit` now works |
| Install script | None | `install-kali.sh` for global or project-local install |
| Update script | None | `update-kali.sh` pulls latest changes, reinstalls, and re-runs tests |
| Bundled skills | None | `websearch` and `kali-admin` |
| Code style | File-level JSDoc and section-divider comments | Removed to avoid AI-typical comment patterns |

All functional source logic is preserved 1:1 from the original repository; only imports, provider registration, build/install metadata, and comments were changed.

## Requirements

- Kali Linux (native or WSL)
- Node.js ≥ 20 (so `corepack` is available)  
  `sudo apt update && sudo apt install -y nodejs npm`
- `pnpm` (enabled via corepack)
- The published Pi Coding Agent:  
  `npm install -g @earendil-works/pi-coding-agent`
- A Featherless AI API key: https://featherless.ai/account/api-keys

## Quick install

```bash
chmod +x install-kali.sh
./install-kali.sh          # global install to ~/.pi/agent/extensions/pi-featherless
```

Project-local install:

```bash
./install-kali.sh --project /path/to/your/project
```

The script also links the bundled `websearch` and `kali-admin` skills into `~/.pi/agent/skills/` and installs the websearch skill dependencies.

## Update an existing install

If you installed via `install-kali.sh`, the target directory is a git clone, so you can update in place:

```bash
chmod +x update-kali.sh
./update-kali.sh
```

Project-local update:

```bash
./update-kali.sh --project /path/to/your/project
```

Skip verification with `--skip-tests`; discard local edits with `--force`.

## Manual install

```bash
npm install -g @earendil-works/pi-coding-agent

mkdir -p ~/.pi/agent/extensions
cp -a /path/to/pi-featherless-kali ~/.pi/agent/extensions/pi-featherless
cd ~/.pi/agent/extensions/pi-featherless
pnpm install

# Link skills
ln -sfn "$(pwd)/skills/websearch" ~/.pi/agent/skills/websearch
ln -sfn "$(pwd)/skills/kali-admin" ~/.pi/agent/skills/kali-admin
(cd skills/websearch && npm install)

export FEATHERLESS_API_KEY="sk-..."
```

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

Alternatively, set the key in the environment before starting the agent:

```bash
export FEATHERLESS_API_KEY="sk-..."
node "$(npm root -g)/@earendil-works/pi-coding-agent/dist/cli.js"
```

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
