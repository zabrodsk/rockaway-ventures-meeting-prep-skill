---
name: rockaway-ventures-meeting-prep
description: Prepare a private dense PDF meeting-prep packet for Rockaway Ventures using the user's connected calendar/account context and the read-only Rockaway Ventures brain MCP. Use for Ventures meeting prep, partner meeting prep, deal/founder/fund meeting prep, today's remaining Ventures meetings, next meeting prep, or what to discuss in an upcoming Rockaway Ventures call.
---

# Rockaway Ventures Meeting Prep

Prepare a private meeting-prep packet for the person running the skill. V1 is prep-only: do not write back to the brain, calendar, or shared docs.

## Brain Boundary

Use only the Rockaway Ventures brain MCP:

```text
rockaway-ventures
http://100.102.180.108:8789/rockaway-ventures/mcp
```

Do not query Rockaway Q unless the user explicitly asks for cross-brain context. Never print or store bearer tokens.
QMD search runs as a separate Mac mini QMD MCP; no local QMD install is needed. Existing GBrain MCP remains canonical for page expansion, links, backlinks, and stats.

## Scope Rules

- `today`: remaining calendar meetings from now onward, not meetings that already happened.
- `whole day` or `include past meetings`: all meetings for the date.
- `tomorrow` or another future date: all meetings on that date.
- `this meeting`: current meeting if one is happening now; otherwise the next upcoming meeting.
- `next meeting`: next upcoming calendar meeting.
- Vague meetings still get a short thin-context brief; do not block the whole packet with questions.
- Declined and cancelled events are excluded. Tentative events are included and marked tentative. Private/busy events with no details are included as stubs only.

Default to every in-scope calendar meeting for the user running the skill. For packed days, prep all meetings but scale depth by importance and available signal.

## Retrieval Rules

For each meeting, do bounded-but-serious retrieval:

1. Use `rockaway-ventures-qmd.status` if connection/index state is uncertain.
2. Use `rockaway-ventures-qmd.query` first for broad recall across exact title, recurring-series title, company/deal/fund/project/portfolio handles, key attendees, prior discussion, open items, next steps, risks, and relationship context. Always scope it with `collections: ["rockaway-ventures"]`.
3. Use `rockaway-ventures-qmd.get` for the best QMD source before using retrieved facts.
4. Use `rockaway-ventures.get_page` for the strongest canonical slug hits when full detail is useful.
5. Use `rockaway-ventures.get_links` / `rockaway-ventures.get_backlinks` for the top 1-3 central pages when relationship or graph context matters.
6. Use `rockaway-ventures.memory_lookup`, `rockaway-ventures.search`, or `rockaway-ventures.query` only as GBrain fallback when native QMD is weak or unavailable.

Native QMD is the first retrieval layer for broad semantic recall. GBrain remains canonical for page expansion, links, backlinks, and stats.

For "last time", prefer the previous recurring occurrence; then title/attendee/topic matches; then widen to related pages from the last 90 days. If retrieval is weak, include `Could Not Verify` only for that meeting.

Mostly paraphrase. Use short direct quotes only when exact wording is unusually important.

## Output Contract

Produce all three surfaces every run:

1. Chat: compact summary and file links only; no source trail by default.
2. Markdown: editable packet with full source trail.
3. PDF: primary deliverable, one all-day dense executive packet with no source trail.

Save under the user's home directory, separated by team and date:

```text
~/Rockaway Meeting Briefs/ventures/YYYY-MM-DD/
  rockaway-ventures-meeting-prep-YYYY-MM-DD.json
  rockaway-ventures-meeting-prep-YYYY-MM-DD.md
  rockaway-ventures-meeting-prep-YYYY-MM-DD.html
  rockaway-ventures-meeting-prep-YYYY-MM-DD.pdf
```

Same-day reruns overwrite these default files. Use a timestamped suffix only if the user asks for archival versions.

## Packet Content

Use one day-level summary followed by one section per meeting. Include suggested agenda/talk track by default, clearly labeled as recommendation rather than retrieved fact.

Each meeting can include:

- why this matters
- last known context
- what was discussed previously
- open threads and follow-ups
- people and relationship notes
- sensitive/interpersonal signals, cautiously phrased
- suggested discussion plan
- questions to ask
- risks, sensitivities, or watchouts
- could-not-verify notes only when relevant
- source trail in markdown only

Do not include blank note-taking space.

## Rendering

Build a structured JSON packet, then call the bundled renderer from this skill folder. In Claude Code, prefer `${CLAUDE_SKILL_DIR}`:

```bash
"${CLAUDE_SKILL_DIR}/.rockaway-meeting-prep-common/scripts/render_packet.js" --input /path/to/packet.json --out-dir "$HOME/Rockaway Meeting Briefs/ventures/YYYY-MM-DD" --slug rockaway-ventures-meeting-prep-YYYY-MM-DD
```

If `${CLAUDE_SKILL_DIR}` is unavailable, look for the renderer in:

```text
$HOME/.codex/skills/rockaway-ventures-meeting-prep/.rockaway-meeting-prep-common/scripts/render_packet.js
$HOME/.claude/skills/rockaway-ventures-meeting-prep/.rockaway-meeting-prep-common/scripts/render_packet.js
```

The JSON is the source of truth. The renderer writes JSON, markdown, HTML, and PDF. PDF rendering uses headless Chrome.

## Final Response

Return a compact chat summary:

- PDF link first.
- Markdown link second.
- 3-7 top alerts or prep priorities.
- Mention only meaningful retrieval gaps.

Keep the brief private by default.
