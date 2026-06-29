#!/usr/bin/env bash
set -euo pipefail

PI_AGENT_DIR="${HOME}/.pi/agent"
SKILLS_DIR="${PI_AGENT_DIR}/skills"
INSTALL_DIR="${PI_AGENT_DIR}/extensions/pi-featherless"
SKIP_TESTS=0
FORCE=0

while [ $# -gt 0 ]; do
    case "${1}" in
        --project)
            shift
            INSTALL_DIR="${1:?missing project path}/.pi/extensions/pi-featherless"
            ;;
        --path)
            shift
            INSTALL_DIR="${1:?missing install path}"
            ;;
        --skip-tests)
            SKIP_TESTS=1
            ;;
        --force)
            FORCE=1
            ;;
        *)
            echo "Unknown option: ${1}" >&2
            echo "Usage: $(basename "${0}") [--project PATH] [--path PATH] [--skip-tests] [--force]" >&2
            exit 1
            ;;
    esac
    shift
done

if [ ! -d "${INSTALL_DIR}/.git" ]; then
    echo "ERROR: ${INSTALL_DIR} is not a git clone."
    echo "       Run ./install-kali.sh first, then use this script to update it."
    exit 1
fi

echo "==> Updating pi-featherless in ${INSTALL_DIR}"

if [ "${FORCE}" -eq 1 ]; then
    echo "    --force: discarding any local changes..."
    git -C "${INSTALL_DIR}" reset --hard HEAD
fi

git -C "${INSTALL_DIR}" pull
pnpm -C "${INSTALL_DIR}" install

install_skill_deps() {
    local skill_path="${1}"
    if [ -f "${skill_path}/package.json" ]; then
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

if [ -d "${INSTALL_DIR}/skills" ]; then
    mkdir -p "${SKILLS_DIR}"
    for skill in "${INSTALL_DIR}/skills"/*; do
        [ -d "${skill}" ] || continue
        name="$(basename "${skill}")"
        echo "    Linking skill: ${name}"
        rm -rf "${SKILLS_DIR}/${name}"
        ln -sfn "${skill}" "${SKILLS_DIR}/${name}"
        install_skill_deps "${skill}"
    done
fi

if [ "${SKIP_TESTS}" -eq 0 ]; then
    echo "==> Running tests and type check..."
    pnpm -C "${INSTALL_DIR}" test
    pnpm -C "${INSTALL_DIR}" tsc --noEmit
else
    echo "    Skipping tests and type check (--skip-tests)."
fi

echo ""
echo "==> Update complete: ${INSTALL_DIR}"
echo "==> Skills linked under: ${SKILLS_DIR}"
echo "==> Restart the Chat UI to pick up any changes."
