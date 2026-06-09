# Rockaway Ventures Meeting Prep

This adds a meeting-prep helper to Codex or Claude Code.

It looks at your calendar, checks the Rockaway Ventures brain, and creates a private meeting-prep packet for your upcoming meetings.
QMD search runs as a separate Mac mini QMD MCP; no local QMD install is needed. Existing GBrain MCP remains canonical for page expansion, links, backlinks, and stats.
Agents should use `rockaway-ventures-qmd` first for broad recall, then `rockaway-ventures` for canonical page expansion and graph context.

You get:

- a polished Word document
- a short chat summary with the most important points

## Install

Open Terminal and paste this:

```bash
npx -y skills@latest add zabrodsk/rockaway-ventures-meeting-prep-skill -g -a codex claude-code --copy -y --full-depth && "$HOME/.codex/skills/rockaway-ventures-meeting-prep/setup.command"
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
Use Rockaway Ventures QMD first for each CSV row, then use the Ventures brain MCP for canonical page expansion on the strongest matches.
```

Expected output columns: `row_id`, `query`, `qmd_sources`, `gbrain_pages`, `confidence`, `summary`, `recommended_next_step`.

## Where The Packet Goes

The files are saved here:

```text
~/Rockaway Meeting Briefs/ventures/
  YYYY-MM-DD/rockaway-ventures-meeting-prep-YYYY-MM-DD.docx
```

Open the Word document first. The chat summary is there for the highest-priority reminders.

## Setup Guide

Open this PDF:

[Rockaway Ventures Meeting Prep Skill.pdf](docs/Rockaway%20Ventures%20Meeting%20Prep%20Skill.pdf)

## Need A Token?

Ask the Rockaway brain admin for a Rockaway Ventures bearer token.
