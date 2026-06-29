# pi-featherless — Kali Linux Rebuild

> **Attribution:** This is a rebuilt, Kali Linux-targeted copy of the original [`CodeDoes/pi-featherless`](https://github.com/CodeDoes/pi-featherless) project. The original code, structure, and model registry were created by **CodeDoes** / **KitAstro** (AstralCosmo). This repository only fixes the upstream syntax error, restores the build, and adds a Kali install path.

## What was changed compared to upstream?

| Item | Upstream | This rebuild |
|------|----------|--------------|
| `src/models.ts` | Dangling `tool_use: true,` block (syntax error) | Fixed — orphan block removed |
| `src/models.ts` `getModelClass()` | Only exact-id lookup | Falls back to known class patterns so removed-but-still-referenced models behave correctly |
| `package.json` | Self-dependency `@codedoes/pi-featherless`: `"."` | Removed — avoids pnpm registry 404 |
| `package.json` devDeps | No TypeScript / tsx | Added `typescript` and `tsx` for typechecking and scripts |
| Type-check command | Missing | `pnpm tsc --noEmit` now works |
| Install script | None | `install-kali.sh` for global or project-local install |

All other files are mirrored 1:1 from the original repository.

## Requirements

- Kali Linux (native or WSL)
- Node.js ≥ 20 (so `corepack` is available)  
  `sudo apt update && sudo apt install -y nodejs npm`
- `pnpm` (enabled via corepack)
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

## Manual install

```bash
mkdir -p ~/.pi/agent/extensions
cp -a /path/to/pi-featherless-kali ~/.pi/agent/extensions/pi-featherless
cd ~/.pi/agent/extensions/pi-featherless
pnpm install
export FEATHERLESS_API_KEY="sk-..."
```

## Register with pi

```bash
pi install ~/.pi/agent/extensions/pi-featherless
```

Or place the folder under `~/.pi/agent/extensions/` / `.pi/extensions/` and pi will discover it automatically.

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

## Usage in pi

```
/login featherless-ai
/model zai-org/GLM-5
```

## Troubleshooting

- `pnpm: command not found` → `corepack enable && corepack prepare pnpm@latest --activate`
- `ERR_PNPM_FETCH_404 @codedoes/pi-featherless` → Use this rebuilt copy (self-dependency removed)
- TypeScript missing → `pnpm install` (typescript/tsx are devDependencies)

---

**Original project:** [CodeDoes/pi-featherless](https://github.com/CodeDoes/pi-featherless)  
**Rebuild author:** Alessandro / RyuKin-Dev
