#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function usage() {
  console.error(`Usage: render_packet.js --input packet.json --out-dir DIR [--slug file-slug]

Writes:
  DIR/file-slug.docx

The input JSON is consumed only to build the Word document. No JSON, markdown, HTML, or PDF sidecar is written.`);
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

function xml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

function para(text, style = "Normal") {
  const value = String(text ?? "").trim();
  if (!value) return "";
  const styleTag = style === "Normal" ? "" : `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`;
  return `<w:p>${styleTag}<w:r><w:t xml:space="preserve">${xml(value)}</w:t></w:r></w:p>`;
}

function bullet(text) {
  return para(`• ${text}`);
}

function section(title, items) {
  const values = asList(items);
  if (!values.length) return "";
  return [para(title, "Heading3"), ...values.map(bullet)].join("");
}

function meetingTitle(meeting) {
  const title = meeting.title || "Untitled Meeting";
  return meeting.time ? `${meeting.time} - ${title}` : title;
}

function renderDocumentXml(packet) {
  const body = [];
  body.push(para(packet.title || `${packet.team} Meeting Prep`, "Title"));
  body.push(para(`Date: ${packet.date}`));
  body.push(para(`Scope: ${packet.scope || "Upcoming meetings"}`));
  body.push(para(`Generated: ${packet.generated_at || new Date().toISOString()}`));

  body.push(para("Today At A Glance", "Heading1"));
  for (const item of asList(packet.summary)) body.push(bullet(item));

  const alerts = asList(packet.top_alerts);
  if (alerts.length) {
    body.push(para("Top Alerts", "Heading1"));
    for (const item of alerts) body.push(bullet(item));
  }

  for (const meeting of packet.meetings) {
    body.push(para(meetingTitle(meeting), "Heading1"));
    if (meeting.status) body.push(para(`Status: ${meeting.status}`));
    if (meeting.attendees) body.push(para(`Attendees: ${asList(meeting.attendees).join(", ")}`));
    if (meeting.likely_topic) body.push(para(`Likely topic: ${meeting.likely_topic}`));

    body.push(section("Why This Meeting Matters", meeting.why_it_matters));
    body.push(section("Last Known Context", meeting.last_known_context));
    body.push(section("What Was Discussed Previously", meeting.previous_discussion));
    body.push(section("Open Threads And Follow-Ups", meeting.open_threads));
    body.push(section("People And Ownership / Relationship Notes", meeting.people_notes));
    body.push(section("Sensitive Signals", meeting.sensitive_signals));
    body.push(section("Suggested Discussion Plan (Recommendation)", meeting.suggested_discussion_plan));
    body.push(section("Questions To Ask", meeting.questions_to_ask));
    body.push(section("Risks, Blockers, Or Watchouts", meeting.watchouts));
    body.push(section("Could Not Verify", meeting.retrieval_gaps));
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body.filter(Boolean).join("\n")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1008" w:right="1008" w:bottom="1008" w:left="1008" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/></w:rPr>
    <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:b/><w:color w:val="153F39"/><w:sz w:val="44"/></w:rPr>
    <w:pPr><w:spacing w:after="240"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:rPr><w:b/><w:color w:val="0F766E"/><w:sz w:val="30"/></w:rPr>
    <w:pPr><w:spacing w:before="280" w:after="120"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:rPr><w:b/><w:color w:val="A26B05"/><w:sz w:val="23"/></w:rPr>
    <w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr>
  </w:style>
</w:styles>`;
}

function contentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
}

function relsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function documentRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;
}

function writeDocxParts(root, packet) {
  fs.mkdirSync(path.join(root, "_rels"), { recursive: true });
  fs.mkdirSync(path.join(root, "word", "_rels"), { recursive: true });
  fs.writeFileSync(path.join(root, "[Content_Types].xml"), contentTypesXml());
  fs.writeFileSync(path.join(root, "_rels", ".rels"), relsXml());
  fs.writeFileSync(path.join(root, "word", "document.xml"), renderDocumentXml(packet));
  fs.writeFileSync(path.join(root, "word", "styles.xml"), stylesXml());
  fs.writeFileSync(path.join(root, "word", "_rels", "document.xml.rels"), documentRelsXml());
}

function runZip(sourceDir, outPath) {
  const result = spawnSync("zip", ["-qr", outPath, "."], { cwd: sourceDir, encoding: "utf8" });
  return result.status === 0 && !result.error;
}

function runPythonZip(sourceDir, outPath) {
  const script = `
import os, sys, zipfile
source, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, _, files in os.walk(source):
        for name in files:
            full = os.path.join(root, name)
            zf.write(full, os.path.relpath(full, source))
`;
  const python = process.env.PYTHON || "python3";
  const result = spawnSync(python, ["-c", script, sourceDir, outPath], { encoding: "utf8" });
  if (result.status !== 0 || result.error) {
    throw new Error(`Could not package DOCX with zip or python3: ${result.stderr || result.stdout || result.error}`);
  }
}

function writeDocx(packet, outPath) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "rockaway-docx-"));
  try {
    writeDocxParts(tempRoot, packet);
    fs.rmSync(outPath, { force: true });
    if (!runZip(tempRoot, outPath)) {
      runPythonZip(tempRoot, outPath);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function removeLegacyOutputs(outDir, base) {
  for (const ext of ["json", "md", "html", "pdf"]) {
    fs.rmSync(path.join(outDir, `${base}.${ext}`), { force: true });
  }
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(args.input);
  const outDir = path.resolve(args["out-dir"]);
  const packet = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  validate(packet);

  const base = slugify(args.slug || `${packet.team}-meeting-prep-${packet.date}`);
  fs.mkdirSync(outDir, { recursive: true });

  removeLegacyOutputs(outDir, base);
  const docxPath = path.join(outDir, `${base}.docx`);
  writeDocx(packet, docxPath);

  console.log(JSON.stringify({ docx: docxPath }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
