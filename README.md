# Rockaway Ventures Meeting Prep Skill

This package installs a private meeting-prep skill for Rockaway Ventures. It scans the user's connected calendar/account context, retrieves the relevant institutional memory from the read-only Rockaway Ventures MCP brain, and produces a dense PDF packet for the remaining meetings in scope.

The skill produces three outputs every run:

- PDF packet: the primary meeting-prep artifact.
- Markdown source: editable notes with full source trail.
- Chat summary: compact links and top priorities.

## Install

```bash
git clone https://github.com/zabrodsk/rockaway-ventures-meeting-prep-skill.git
cd rockaway-ventures-meeting-prep-skill
./install.sh
```

Restart Codex or Claude Code after installation if it was already open.

## Configure Rockaway Ventures MCP

Ask the Rockaway brain admin for your Ventures bearer token. Do not commit or paste the token into shared docs.

Claude Code:

```bash
claude mcp add rockaway-ventures --transport http \
  http://100.102.180.108:8789/rockaway-ventures/mcp \
  --header "Authorization: Bearer USER_TOKEN"
```

Codex CLI:

```bash
export ROCKAWAY_VENTURES_MCP_TOKEN="USER_TOKEN"
codex mcp add rockaway-ventures \
  --url http://100.102.180.108:8789/rockaway-ventures/mcp \
  --bearer-token-env-var ROCKAWAY_VENTURES_MCP_TOKEN
codex mcp get rockaway-ventures
```

Codex config equivalent in `~/.codex/config.toml`:

```toml
[mcp_servers.rockaway-ventures]
url = "http://100.102.180.108:8789/rockaway-ventures/mcp"
bearer_token_env_var = "ROCKAWAY_VENTURES_MCP_TOKEN"
```

The `ROCKAWAY_VENTURES_MCP_TOKEN` environment variable must be available to the Codex process when it starts.

## Use

```text
$rockaway-ventures-meeting-prep prep me for today
$rockaway-ventures-meeting-prep prep me for my next meeting
$rockaway-ventures-meeting-prep prep me for tomorrow
```

By default, `today` means remaining meetings from now onward. Use "whole day" or "include past meetings" if you want the full date.

## Output Location

```text
~/Rockaway Meeting Briefs/ventures/YYYY-MM-DD/
  rockaway-ventures-meeting-prep-YYYY-MM-DD.pdf
  rockaway-ventures-meeting-prep-YYYY-MM-DD.md
  rockaway-ventures-meeting-prep-YYYY-MM-DD.html
  rockaway-ventures-meeting-prep-YYYY-MM-DD.json
```

Same-day reruns overwrite the default files.

## Guide

Open the PDF introduction:

```text
docs/Rockaway Ventures Meeting Prep Skill.pdf
```
