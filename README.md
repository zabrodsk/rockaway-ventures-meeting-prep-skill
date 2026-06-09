# Rockaway Ventures Meeting Prep

This adds a meeting-prep helper to Codex or Claude Code.

It looks at your calendar, checks the Rockaway Ventures brain, and creates a private meeting-prep packet for your upcoming meetings.
QMD search runs on the Mac mini through the MCP using a sanitized Ventures index; no separate QMD install is needed.
Agents should start brain retrieval with `memory_lookup`. It uses QMD first, then falls back to GBrain, and `get_page` should only be used for the strongest matches.

You get:

- a polished PDF packet
- an editable markdown version
- a short chat summary with the most important points

## Install

Open Terminal and paste this:

```bash
npx -y skills@latest add zabrodsk/rockaway-ventures-meeting-prep-skill -g -a codex claude-code --copy -y --full-depth && "$HOME/.agents/skills/rockaway-ventures-meeting-prep/setup.command"
```

The setup will ask for your bearer token.

## If You Want Codex Or Claude To Do It

Send this message:

```text
please install the meeting prep skill from the GitHub repo and run the setup command. This is my bearer token:
```

Then paste your bearer token after the colon.

## How To Use It

After setup, restart Codex or Claude Code.

Then ask:

```text
$rockaway-ventures-meeting-prep prep me for today
```

You can also ask:

```text
$rockaway-ventures-meeting-prep prep me for my next meeting
$rockaway-ventures-meeting-prep prep me for tomorrow
```

## CSV Or Quick Memory Lookup

For spreadsheet-style lookup, tell Codex or Claude:

```text
Use the Rockaway memory lookup skill for this team. For each CSV row, call memory_lookup first, then get_page only for the strongest matches.
```

Expected output columns: `row_id`, `query`, `matched_pages`, `confidence`, `summary`, `recommended_next_step`, `source_slugs`.

## Where The Packet Goes

The files are saved here:

```text
~/Rockaway Meeting Briefs/ventures/
```

Open the PDF first. The markdown file is there if you want to inspect sources or edit the notes.

## Setup Guide

Open this PDF:

[Rockaway Ventures Meeting Prep Skill.pdf](docs/Rockaway%20Ventures%20Meeting%20Prep%20Skill.pdf)

## Need A Token?

Ask the Rockaway brain admin for a Rockaway Ventures bearer token.
