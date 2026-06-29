#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${HOME}/.pi/agent/extensions/pi-featherless"
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

if [ "${SKIP_TESTS}" -eq 0 ]; then
    echo "==> Running tests and type check..."
    pnpm -C "${INSTALL_DIR}" test
    pnpm -C "${INSTALL_DIR}" tsc --noEmit
else
    echo "    Skipping tests and type check (--skip-tests)."
fi

echo ""
echo "==> Update complete: ${INSTALL_DIR}"
