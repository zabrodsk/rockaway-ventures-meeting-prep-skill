#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function usage() {
  console.error(`Usage: render_packet.js --input packet.json --out-dir DIR [--slug file-slug]

Writes:
  DIR/file-slug.json
  DIR/file-slug.md
  DIR/file-slug.html
  DIR/file-slug.pdf

The input JSON is the source of truth. PDF rendering uses headless Chrome.`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--") || !value) {
      usage();
      process.exit(64);
    }
    args[key.slice(2)] = value;
    i += 1;
  }
  if (!args.input || !args["out-dir"]) {
    usage();
    process.exit(64);
  }
  return args;
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdEscape(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function asList(items) {
  return Array.isArray(items) ? items.filter(Boolean).map(String) : [];
}

function slugify(value) {
  return String(value || "rockaway-meeting-prep")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96) || "rockaway-meeting-prep";
}

function validate(packet) {
  if (!packet || typeof packet !== "object") throw new Error("packet must be an object");
  if (!packet.team) throw new Error("packet.team is required");
  if (!packet.date) throw new Error("packet.date is required");
  if (!Array.isArray(packet.meetings)) throw new Error("packet.meetings must be an array");
}

function mdSection(title, content) {
  const lines = asList(content);
  if (!lines.length) return "";
  return [`### ${title}`, "", ...lines.map((item) => `- ${mdEscape(item)}`), ""].join("\n");
}

function renderMarkdown(packet) {
  const out = [];
  out.push(`# ${packet.title || `${packet.team} Meeting Prep`}`);
  out.push("");
  out.push(`- Date: ${packet.date}`);
  out.push(`- Scope: ${packet.scope || "Upcoming meetings"}`);
  out.push(`- Generated: ${packet.generated_at || new Date().toISOString()}`);
  out.push("");

  out.push("## Today At A Glance");
  out.push("");
  for (const item of asList(packet.summary)) out.push(`- ${mdEscape(item)}`);
  out.push("");

  if (asList(packet.top_alerts).length) {
    out.push("## Top Alerts");
    out.push("");
    for (const item of asList(packet.top_alerts)) out.push(`- ${mdEscape(item)}`);
    out.push("");
  }

  for (const meeting of packet.meetings) {
    out.push(`## ${meeting.time ? `${meeting.time} - ` : ""}${meeting.title || "Untitled Meeting"}`);
    out.push("");
    if (meeting.status) out.push(`- Status: ${meeting.status}`);
    if (meeting.attendees) out.push(`- Attendees: ${asList(meeting.attendees).join(", ")}`);
    if (meeting.likely_topic) out.push(`- Likely topic: ${meeting.likely_topic}`);
    out.push("");

    out.push(mdSection("Why This Meeting Matters", meeting.why_it_matters));
    out.push(mdSection("Last Known Context", meeting.last_known_context));
    out.push(mdSection("What Was Discussed Previously", meeting.previous_discussion));
    out.push(mdSection("Open Threads And Follow-Ups", meeting.open_threads));
    out.push(mdSection("People And Ownership / Relationship Notes", meeting.people_notes));
    out.push(mdSection("Sensitive Signals", meeting.sensitive_signals));
    out.push(mdSection("Suggested Discussion Plan (Recommendation)", meeting.suggested_discussion_plan));
    out.push(mdSection("Questions To Ask", meeting.questions_to_ask));
    out.push(mdSection("Risks, Blockers, Or Watchouts", meeting.watchouts));
    out.push(mdSection("Could Not Verify", meeting.retrieval_gaps));

    const sources = asList(meeting.sources);
    if (sources.length) {
      out.push("### Source Trail");
      out.push("");
      for (const source of sources) out.push(`- ${mdEscape(source)}`);
      out.push("");
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

function htmlList(items) {
  const values = asList(items);
  if (!values.length) return "";
  return `<ul>${values.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function htmlSection(title, content, className = "") {
  const values = asList(content);
  if (!values.length) return "";
  return `<section class="section ${className}">
    <div class="label">${esc(title)}</div>
    ${htmlList(values)}
  </section>`;
}

function renderHtml(packet, css) {
  const meetings = packet.meetings.map((meeting) => `
    <article class="meeting">
      <div class="meeting-header">
        <div>
          <h2>${esc(meeting.title || "Untitled Meeting")}</h2>
          ${meeting.attendees ? `<div class="attendees">${esc(asList(meeting.attendees).join(", "))}</div>` : ""}
          ${meeting.likely_topic ? `<div class="attendees">Likely topic: ${esc(meeting.likely_topic)}</div>` : ""}
          ${meeting.status ? `<div class="attendees">Status: ${esc(meeting.status)}</div>` : ""}
        </div>
        <div class="meeting-time">${esc(meeting.time || "")}</div>
      </div>
      ${htmlSection("Why This Meeting Matters", meeting.why_it_matters)}
      ${htmlSection("Last Known Context", meeting.last_known_context)}
      ${htmlSection("What Was Discussed Previously", meeting.previous_discussion)}
      ${htmlSection("Open Threads And Follow-Ups", meeting.open_threads)}
      ${htmlSection("People And Ownership / Relationship Notes", meeting.people_notes)}
      ${htmlSection("Sensitive Signals", meeting.sensitive_signals, "sensitive")}
      ${htmlSection("Suggested Discussion Plan (Recommendation)", meeting.suggested_discussion_plan, "recommendation")}
      ${htmlSection("Questions To Ask", meeting.questions_to_ask)}
      ${htmlSection("Risks, Blockers, Or Watchouts", meeting.watchouts)}
      ${htmlSection("Could Not Verify", meeting.retrieval_gaps, "gap")}
    </article>
  `).join("\n");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(packet.title || `${packet.team} Meeting Prep`)}</title>
  <style>${css}</style>
</head>
<body>
  <header class="packet-header">
    <div>
      <h1>${esc(packet.title || `${packet.team} Meeting Prep`)}</h1>
      <p>${esc(packet.scope || "Upcoming meetings")}</p>
    </div>
    <div class="meta">
      <div>${esc(packet.date)}</div>
      <div>${esc(packet.generated_at || new Date().toISOString())}</div>
    </div>
  </header>
  <section class="summary">
    <h2>Today At A Glance</h2>
    <div class="summary-grid">
      <div>${htmlList(packet.summary)}</div>
      <div>${htmlSection("Top Alerts", packet.top_alerts)}</div>
    </div>
  </section>
  ${meetings}
  <div class="footer-note">Private meeting preparation packet. See the markdown file for audit details.</div>
</body>
</html>`;
}

function findChrome() {
  const env = process.env.CHROME_PATH;
  const candidates = [
    env,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function renderPdf(htmlPath, pdfPath) {
  const chrome = findChrome();
  if (!chrome) {
    throw new Error("Could not find Chrome/Chromium. Set CHROME_PATH or install Google Chrome to render PDF.");
  }
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "rockaway-pdf-"));
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-gpu",
    "--disable-sync",
    "--hide-scrollbars",
    "--no-pdf-header-footer",
    "--no-first-run",
    "--no-default-browser-check",
    "--run-all-compositor-stages-before-draw",
    `--user-data-dir=${userDataDir}`,
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ], { encoding: "utf8", timeout: 20000, killSignal: "SIGKILL" });
  fs.rmSync(userDataDir, { recursive: true, force: true });
  if (result.error && result.error.code === "ETIMEDOUT" && fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0) {
    return;
  }
  if (result.status !== 0 || result.error) {
    throw new Error(`Chrome PDF render failed: ${result.stderr || result.stdout}`);
  }
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(args.input);
  const outDir = path.resolve(args["out-dir"]);
  const packet = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  validate(packet);

  const base = slugify(args.slug || `${packet.team}-meeting-prep-${packet.date}`);
  const cssPath = path.resolve(__dirname, "../assets/packet.css");
  const css = fs.readFileSync(cssPath, "utf8");

  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `${base}.json`);
  const mdPath = path.join(outDir, `${base}.md`);
  const htmlPath = path.join(outDir, `${base}.html`);
  const pdfPath = path.join(outDir, `${base}.pdf`);

  fs.writeFileSync(jsonPath, JSON.stringify(packet, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(packet));
  fs.writeFileSync(htmlPath, renderHtml(packet, css));
  renderPdf(htmlPath, pdfPath);

  console.log(JSON.stringify({ json: jsonPath, markdown: mdPath, html: htmlPath, pdf: pdfPath }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
