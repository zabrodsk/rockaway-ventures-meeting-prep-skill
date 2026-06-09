#!/usr/bin/env bash
set -euo pipefail

TEAM_LABEL="Rockaway Ventures"
SKILL_NAME="rockaway-ventures-meeting-prep"
MCP_NAME="rockaway-ventures"
MCP_URL="http://100.102.180.108:8789/rockaway-ventures/mcp"
QMD_MCP_NAME="rockaway-ventures-qmd"
QMD_MCP_URL="https://clawdbot--mac-mini.taild9e247.ts.net:8445/mcp"
TOKEN_ENV="ROCKAWAY_VENTURES_MCP_TOKEN"
ENV_DIR="$HOME/.rockaway-meeting-prep"
ENV_FILE="$ENV_DIR/ventures.env"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

copy_skill_to() {
  local target_root="$1"
  mkdir -p "$target_root"
  rm -rf "$target_root/$SKILL_NAME"
  cp -R "$ROOT" "$target_root/$SKILL_NAME"
  chmod 0755 "$target_root/$SKILL_NAME/setup.command" 2>/dev/null || true
  chmod 0755 "$target_root/$SKILL_NAME/.rockaway-meeting-prep-common/scripts/render_packet.js" 2>/dev/null || true
}

ensure_codex_mcp_config() {
  local server_name="$1"
  local url="$2"
  local env_var="${3:-}"
  python3 - "$server_name" "$url" "$env_var" <<'PY'
import re
import sys
from pathlib import Path

name, url, env_var = sys.argv[1], sys.argv[2], sys.argv[3]
path = Path.home() / ".codex" / "config.toml"
path.parent.mkdir(parents=True, exist_ok=True)
block = f"[mcp_servers.{name}]\nurl = \"{url}\"\n"
if env_var:
    block += f"bearer_token_env_var = \"{env_var}\"\n"
text = path.read_text() if path.exists() else ""
pattern = re.compile(rf"(?ms)^\[mcp_servers\.{re.escape(name)}\]\s.*?(?=^\[|\Z)")
if pattern.search(text):
    text = pattern.sub(block, text)
else:
    if text and not text.endswith("\n"):
        text += "\n"
    text += "\n" + block
path.write_text(text, encoding="utf-8")
PY
}

configure_qmd_mcp() {
  if command -v claude >/dev/null 2>&1; then
    claude mcp remove "$QMD_MCP_NAME" >/dev/null 2>&1 || true
    claude mcp add "$QMD_MCP_NAME" --transport http "$QMD_MCP_URL"
    echo "Claude Code QMD MCP configured: $QMD_MCP_NAME"
  fi
  if command -v codex >/dev/null 2>&1; then
    codex mcp remove "$QMD_MCP_NAME" >/dev/null 2>&1 || true
    codex mcp add "$QMD_MCP_NAME" --url "$QMD_MCP_URL"
    echo "Codex QMD MCP configured: $QMD_MCP_NAME"
  fi
  ensure_codex_mcp_config "$QMD_MCP_NAME" "$QMD_MCP_URL"
}

echo
echo "${TEAM_LABEL} Meeting Prep setup"
echo "This installs the skill and connects it to the ${TEAM_LABEL} brain."
echo

copy_skill_to "${CODEX_HOME:-$HOME/.codex}/skills"
copy_skill_to "$HOME/.claude/skills"

echo "Installed skill for Codex and Claude Code."
echo
echo "Paste your ${TEAM_LABEL} bearer token below."
echo "The input is hidden while you type."
printf "Bearer token: "
IFS= read -rs TOKEN
echo
configure_qmd_mcp

if [[ -z "$TOKEN" ]]; then
  echo "No token entered. Skill installed and QMD MCP configured, but brain MCP setup was skipped."
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
ensure_codex_mcp_config "$MCP_NAME" "$MCP_URL" "$TOKEN_ENV"
ensure_codex_mcp_config "$QMD_MCP_NAME" "$QMD_MCP_URL"

echo
echo "Done."
echo "Token saved locally at: $ENV_FILE"
echo "QMD MCP configured without a token: $QMD_MCP_NAME"
echo "Restart Codex or Claude Code if they were already open."
echo
echo "Try:"
echo "  \$${SKILL_NAME} prep me for today"
echo
