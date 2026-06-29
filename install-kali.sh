#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_NAME="pi-featherless"

PI_AGENT_DIR="${HOME}/.pi/agent"
SKILLS_DIR="${PI_AGENT_DIR}/skills"

usage() {
    cat <<EOF
Usage: $(basename "${0}") [--project PATH]

Install the pi-featherless extension and bundled skills.

  --project PATH  Install project-locally into PATH/.pi/extensions/${PACKAGE_NAME}
EOF
}

PROJECT_PATH=""
if [ "${1:-}" = "--project" ]; then
    PROJECT_PATH="${2:-}"
    if [ -z "${PROJECT_PATH}" ]; then
        usage >&2
        exit 1
    fi
fi

if [ -n "${PROJECT_PATH:-}" ]; then
    TARGET="${PROJECT_PATH}/.pi/extensions/${PACKAGE_NAME}"
else
    TARGET="${PI_AGENT_DIR}/extensions/${PACKAGE_NAME}"
fi

echo "==> pi-featherless Kali install script"
echo "    Source: ${SCRIPT_DIR}"
echo "    Target: ${TARGET}"

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

echo "    Installing extension dependencies..."
pnpm install

install_skill_deps() {
    local skill_path="${1}"
    if [ -f "${skill_path}/package.json" ] && [ ! -d "${skill_path}/node_modules" ]; then
        echo "    Installing skill dependencies: ${skill_path}"
        (
            cd "${skill_path}"
            if command -v npm >/dev/null 2>&1; then
                npm install
            else
                echo "WARNING: npm not found; skipping ${skill_path} dependency install." >&2
            fi
        )
    fi
}

if [ -d "${TARGET}/skills" ]; then
    mkdir -p "${SKILLS_DIR}"
    for skill in "${TARGET}/skills"/*; do
        [ -d "${skill}" ] || continue
        name="$(basename "${skill}")"
        echo "    Linking skill: ${name}"
        rm -rf "${SKILLS_DIR}/${name}"
        ln -sfn "${skill}" "${SKILLS_DIR}/${name}"
        install_skill_deps "${skill}"
    done
fi

echo ""
echo "==> Installed to: ${TARGET}"
echo "==> Skills linked under: ${SKILLS_DIR}"
echo "==> Next steps:"
echo "    1. Make sure the main Pi agent is installed:"
echo "       npm install -g @earendil-works/pi-coding-agent"
echo "    2. Start the Chat UI:"
echo "       node \"\$(npm root -g)/@earendil-works/pi-coding-agent/dist/cli.js\""
echo "    3. Inside the Chat UI, log in:"
echo "       /login"
echo "       Choose 'API keys' -> 'Featherless AI' and paste your key."
echo "    4. Pick a model, e.g.:"
echo "       /model zai-org/GLM-5"
echo "    5. Log out later with:"
echo "       /logout"
