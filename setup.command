#!/usr/bin/env bash
set -euo pipefail

TEAM_LABEL="Rockaway Ventures"
SKILL_NAME="rockaway-ventures-meeting-prep"
MCP_NAME="rockaway-ventures"
MCP_URL="http://100.102.180.108:8789/rockaway-ventures/mcp"
TOKEN_ENV="ROCKAWAY_VENTURES_MCP_TOKEN"
ENV_DIR="$HOME/.rockaway-meeting-prep"
ENV_FILE="$ENV_DIR/ventures.env"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo
echo "${TEAM_LABEL} Meeting Prep setup"
echo "This installs the skill and connects it to the ${TEAM_LABEL} brain."
echo

"$ROOT/install.sh"

echo
echo "Paste your ${TEAM_LABEL} bearer token below."
echo "The input is hidden while you type."
printf "Bearer token: "
IFS= read -rs TOKEN
echo

if [[ -z "$TOKEN" ]]; then
  echo "No token entered. Skill installed, but MCP setup was skipped."
  exit 0
fi

mkdir -p "$ENV_DIR"
chmod 700 "$ENV_DIR"
cat > "$ENV_FILE" <<EOF
export ${TOKEN_ENV}="${TOKEN}"
EOF
chmod 600 "$ENV_FILE"

if command -v launchctl >/dev/null 2>&1; then
  launchctl setenv "$TOKEN_ENV" "$TOKEN" 2>/dev/null || true
fi

if [[ -f "$HOME/.zshrc" ]] && ! grep -q "$ENV_FILE" "$HOME/.zshrc"; then
  {
    echo
    echo "# Rockaway Meeting Prep"
    echo "[[ -f \"$ENV_FILE\" ]] && source \"$ENV_FILE\""
  } >> "$HOME/.zshrc"
fi

if command -v claude >/dev/null 2>&1; then
  claude mcp remove "$MCP_NAME" >/dev/null 2>&1 || true
  claude mcp add "$MCP_NAME" --transport http "$MCP_URL" --header "Authorization: Bearer $TOKEN"
  echo "Claude Code MCP configured: $MCP_NAME"
else
  echo "Claude Code CLI not found; skipped Claude Code MCP setup."
fi

if command -v codex >/dev/null 2>&1; then
  codex mcp remove "$MCP_NAME" >/dev/null 2>&1 || true
  codex mcp add "$MCP_NAME" --url "$MCP_URL" --bearer-token-env-var "$TOKEN_ENV"
  echo "Codex MCP configured: $MCP_NAME"
else
  echo "Codex CLI not found; skipped Codex MCP setup."
fi

echo
echo "Done."
echo "Token saved locally at: $ENV_FILE"
echo "Restart Codex or Claude Code if they were already open."
echo
echo "Try:"
echo "  \$${SKILL_NAME} prep me for today"
echo
