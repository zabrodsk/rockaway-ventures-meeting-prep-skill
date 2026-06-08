# Rockaway Ventures Meeting Prep

This adds a meeting-prep helper to Codex or Claude Code.

It looks at your calendar, checks the Rockaway Ventures brain, and creates a private meeting-prep packet for your upcoming meetings.

You get:

- a polished PDF packet
- an editable markdown version
- a short chat summary with the most important points
- direct read-only access to ask questions against the Rockaway Ventures brain from Claude Code or Codex

## Install

Open Terminal and paste this:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/zabrodsk/rockaway-ventures-meeting-prep-skill/main/bootstrap.sh)"
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

Ask the brain directly:

```text
What does the Rockaway Ventures brain know about this company?
Search the Ventures brain for recent notes about this founder.
What open threads do we have around this deal?
```

Or run the meeting-prep skill:

```text
$rockaway-ventures-meeting-prep prep me for today
```

You can also ask:

```text
$rockaway-ventures-meeting-prep prep me for my next meeting
$rockaway-ventures-meeting-prep prep me for tomorrow
```

## Where The Packet Goes

The files are saved here:

```text
~/Rockaway Meeting Briefs/ventures/
```

Open the PDF first. The markdown file is there if you want to inspect sources or edit the notes.

## What Gets Connected

The setup connects only the read-only Rockaway Ventures MCP:

```text
rockaway-ventures
http://100.102.180.108:8789/rockaway-ventures/mcp
```

It can search and read the Ventures brain. It cannot edit the brain.

## Setup Guide

Open this PDF:

[Rockaway Ventures Meeting Prep Skill.pdf](docs/Rockaway%20Ventures%20Meeting%20Prep%20Skill.pdf)

## Need A Token?

Ask the Rockaway brain admin for a Rockaway Ventures bearer token.
