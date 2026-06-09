#!/usr/bin/env bash
set -euo pipefail

S=rockaway-ventures-meeting-prep
npx -y skills@latest add zabrodsk/${S}-skill -g -a codex claude-code --copy -y --full-depth
"$HOME/.codex/skills/${S}/setup.command"
