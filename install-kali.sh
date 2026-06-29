#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_NAME="pi-featherless"

echo "==> pi-featherless Kali install script"
echo "    Source: ${SCRIPT_DIR}"

if [ "${1:-}" = "--project" ]; then
    TARGET="${2:-$(pwd)}/.pi/extensions/${PACKAGE_NAME}"
    echo "    Mode: project-local (${TARGET})"
else
    TARGET="${HOME}/.pi/agent/extensions/${PACKAGE_NAME}"
    echo "    Mode: global (${TARGET})"
fi

if [ -d "${TARGET}" ]; then
    echo "    Removing existing install..."
    rm -rf "${TARGET}"
fi

mkdir -p "$(dirname "${TARGET}")"

cp -a "${SCRIPT_DIR}" "${TARGET}"
rm -rf "${TARGET}/node_modules"

cd "${TARGET}"

if ! command -v pnpm >/dev/null 2>&1; then
    echo "    pnpm not found; enabling via corepack..."
    if command -v corepack >/dev/null 2>&1; then
        corepack enable
        corepack prepare pnpm@latest --activate || true
    else
        echo "ERROR: pnpm is required. Install Node.js + corepack, or run:"
        echo "  curl -fsSL https://get.pnpm.io/install.sh | sh -"
        exit 1
    fi
fi

echo "    Installing dependencies (this may take a minute)..."
pnpm install

echo ""
echo "==> Installed to: ${TARGET}"
echo "==> Next steps:"
echo "    1. Export your Featherless API key:"
echo "       export FEATHERLESS_API_KEY='your-key'"
echo "    2. Activate the package with:"
echo "       pi install ${TARGET}"
echo "    3. Or just start pi; the extension in ~/.pi/agent/extensions will be loaded automatically."
