#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"

mkdir -p "${SKILLS_DIR}"
cp -R "${ROOT}/skills/rockaway-ventures-meeting-prep" "${SKILLS_DIR}/"
cp -R "${ROOT}/skills/.rockaway-meeting-prep-common" "${SKILLS_DIR}/"
chmod 0755 "${SKILLS_DIR}/.rockaway-meeting-prep-common/scripts/render_packet.js"

echo "Installed Rockaway Ventures Meeting Prep skill into ${SKILLS_DIR}"
echo "Restart Codex or Claude Code if the skill list was already loaded."
