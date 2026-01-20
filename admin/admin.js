const FILES = [
  "data/site.json",
  "data/links.json",
  "data/about.json",
  "data/projects.json",
  "data/skills.json",
];

const sel = document.getElementById("file");
const editor = document.getElementById("editor");
const statusEl = document.getElementById("status");

for (const f of FILES) {
  const opt = document.createElement("option");
  opt.value = f;
  opt.textContent = f;
  sel.appendChild(opt);
}

function setStatus(msg, ok = true) {
  statusEl.textContent = msg;
  statusEl.className = "status " + (ok ? "ok" : "err");
}

async function loadFile() {
  const key = sel.value;
  setStatus("Loading...");
  const res = await fetch(`/api/get?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) return setStatus(`Load failed: ${res.status} ${text}`, false);
  editor.value = text;
  setStatus(`Loaded ${key}`);
}

function formatJson() {
  try {
    editor.value = JSON.stringify(JSON.parse(editor.value), null, 2);
    setStatus("Formatted");
  } catch (e) {
    setStatus(`Invalid JSON: ${e.message}`, false);
  }
}

async function saveFile() {
  const key = sel.value;

  try { JSON.parse(editor.value); }
  catch (e) { return setStatus(`Invalid JSON: ${e.message}`, false); }

  setStatus("Saving...");
  const res = await fetch(`/api/put?key=${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: editor.value,
  });
  const text = await res.text();
  if (!res.ok) return setStatus(`Save failed: ${res.status} ${text}`, false);

  setStatus(`Saved ${key}`);
}

document.getElementById("load").onclick = loadFile;
document.getElementById("format").onclick = formatJson;
document.getElementById("save").onclick = saveFile;

loadFile();
