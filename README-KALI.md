# pi-featherless — Kali Linux Rebuild

> **Attribution:** This is a rebuilt, Kali Linux-compatible copy of the original [`CodeDoes/pi-featherless`](https://github.com/CodeDoes/pi-featherless) project. The original code, structure, and model registry were created by **CodeDoes** / **KitAstro** (AstralCosmo). This repository only fixes the upstream syntax error, restores the build, and adds a Kali install path.

## What was changed compared to upstream?

| Item | Upstream | This rebuild |
|------|----------|--------------|
| `src/models.ts` | Dangling `tool_use: true,` block (syntax error) | Fixed — orphan block removed |
| `src/models.ts` `getModelClass()` | Only exact-id lookup | Falls back to known class patterns so removed-but-still-referenced models behave correctly |
| `package.json` | Self-dependency `@codedoes/pi-featherless`: `"."` | Removed — avoids pnpm registry 404 |
| `package.json` devDeps | No TypeScript / tsx | Added `typescript` and `tsx` for typechecking and scripts |
| Type-check command | Missing | `pnpm tsc --noEmit` now works |

All other files are mirrored 1:1.

## Requirements

- Kali Linux (native or WSL)
- Node.js ≥ 20 (so `corepack` is available)  
  `sudo apt update && sudo apt install -y nodejs npm`
- `pnpm` (enabled via corepack)
- A Featherless AI API key: https://featherless.ai/account/api-keys

## Quick install

From this folder on Kali:

```bash
chmod +x install-kali.sh
./install-kali.sh          # global install to ~/.pi/agent/extensions/pi-featherless
```

For a project-local install instead:

```bash
./install-kali.sh --project /path/to/your/project
```

## Manual install

```bash
# 1. Copy the package to your global pi extensions directory
mkdir -p ~/.pi/agent/extensions
cp -a /path/to/pi-featherless-kali ~/.pi/agent/extensions/pi-featherless

# 2. Install dependencies
cd ~/.pi/agent/extensions/pi-featherless
pnpm install

# 3. Set your API key
export FEATHERLESS_API_KEY="sk-..."
# Add the line to ~/.bashrc or ~/.zshrc to persist it.
```

## Register with pi

If the `pi` CLI is installed globally:

```bash
pi install ~/.pi/agent/extensions/pi-featherless
```

Otherwise, place the folder under `~/.pi/agent/extensions/` (or a project’s `.pi/extensions/`) and `pi` will discover it automatically on startup.

## Verify the rebuild

```bash
cd ~/.pi/agent/extensions/pi-featherless
pnpm test                  # vitest — should pass 13 tests
pnpm tsc --noEmit          # typecheck — should exit with no errors
```

## Run a quick API test

```bash
export FEATHERLESS_API_KEY="sk-..."
pnpm exec tsx test-api.ts ping
```

## Usage in pi

Once installed, tell pi to use a Featherless model, e.g.:

```
/login featherless-ai
/model zai-org/GLM-5
```

Then use pi normally. The extension handles:

- Featherless API authentication
- Provider/model registration
- Concurrency tracking for plan limits
- Context-window monitoring via the `/v1/tokenize` endpoint
- Proactive compaction summaries
- XML tool-call parsing for RWKV-style models

## Troubleshooting

### `pnpm: command not found`

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### `ERR_PNPM_FETCH_404 @codedoes/pi-featherless`

Make sure you are using this rebuilt copy — the self-dependency causing this was removed.

### Type errors because TypeScript is missing

The rebuild already adds `typescript` and `tsx` to `devDependencies`. Run `pnpm install` again if you deleted `node_modules`.

### Extension not loading

Check that the extension file is discoverable:

```bash
ls ~/.pi/agent/extensions/pi-featherless/extensions/featherless.ts
```

And that your API key is exported:

```bash
echo $FEATHERLESS_API_KEY
```
