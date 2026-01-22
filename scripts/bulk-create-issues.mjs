import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { execSync } from "child_process";

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function safeStr(v) {
  return (v ?? "").toString();
}

function buildBody(t) {
  const lines = [];
  if (t.owner) lines.push(`**Owner:** ${t.owner}`);
  if (t.what) lines.push(`\n## What to build\n${t.what}`);
  if (t.api) lines.push(`\n## API / WS\n${t.api}`);
  if (t.done) lines.push(`\n## Done when\n${t.done}`);
  if (t.notes) lines.push(`\n## Notes\n${t.notes}`);
  return lines.join("\n").trim();
}

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return safeStr(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function labelsArg(labels) {
  const arr = toArray(labels);
  return arr.length ? `--label "${arr.join(",")}"` : "";
}

function assigneesArg(assignees) {
  const arr = toArray(assignees);
  return arr.length ? `--assignee "${arr.join(",")}"` : "";
}

function loadYamlTasks(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const doc = yaml.load(raw);
  const tasks = Array.isArray(doc) ? doc : (doc?.tasks || []);
  if (!Array.isArray(tasks)) {
    throw new Error(`YAML format invalid. Expected array or {tasks: []} in ${filePath}`);
  }
  return tasks;
}

// ==== main ====
const repo = process.argv[2];      // OWNER/REPO
const ymlPath = process.argv[3];   // path to yaml

if (!repo || !ymlPath) {
  console.error("Usage: node scripts/bulk-create-issues.mjs OWNER/REPO path/to/tasks.yml");
  process.exit(1);
}

const abs = path.resolve(ymlPath);
const tasks = loadYamlTasks(abs);

console.log(`Loaded ${tasks.length} tasks from ${ymlPath}`);

for (const t of tasks) {
  const title = safeStr(t.title || t.name).trim();
  if (!title) continue;

  const body = buildBody(t);

  const labels = labelsArg(t.labels);
  const assignees = assigneesArg(t.assignees);

  // Escape double quotes for PowerShell/cmd
  const escTitle = title.replace(/"/g, '\\"');
  const escBody = body.replace(/"/g, '\\"');

  const cmd = `gh issue create --repo ${repo} --title "${escTitle}" --body "${escBody}" ${labels} ${assignees}`.trim();
  run(cmd);
}

