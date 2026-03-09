var fs = require("fs");
var path = require("path");
var os = require("os");

var anchor = process.argv.slice(2).join(" ");
if (!anchor) { console.log("Usage: check.js <anchor-phrase>"); process.exit(1); }

var d = path.join(os.homedir(), ".claude/projects", process.cwd().replace(/\//g, "-"));

// Collect top-level session JSONL files, sorted by mtime, capped at 10
var sessions = [];
try {
  var entries = fs.readdirSync(d, { withFileTypes: true });
  entries.forEach(function(e) {
    if (e.isFile() && e.name.endsWith(".jsonl")) {
      sessions.push(path.join(d, e.name));
    }
  });
  sessions.sort(function(a, b) { return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs; });
  sessions = sessions.slice(0, 10);
} catch(e) {
  console.log("No session dir found");
  process.exit();
}

// Context window size — 200k for Opus/Sonnet/Haiku. Adjust if your model differs.
var WINDOW = 200000;

function search(files) {
  for (var fi = 0; fi < files.length; fi++) {
    var data = fs.readFileSync(files[fi], "utf8");
    if (data.indexOf(anchor) === -1) continue;
    var lines = data.split("\n").filter(Boolean).map(JSON.parse);
    for (var i = lines.length - 1; i >= 0; i--) {
      var msg = lines[i].message;
      if (msg && msg.role === "assistant" && msg.usage) {
        var u = msg.usage;
        var t = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
        console.log("Context: " + t.toLocaleString() + "/" + WINDOW.toLocaleString() + " (" + Math.floor(t * 100 / WINDOW) + "%)");
        return true;
      }
    }
  }
  return false;
}

// Try top-level sessions first, then subagent JSONLs
if (!search(sessions)) {
  var subfiles = [];
  sessions.forEach(function(f) {
    var sid = f.replace(/\.jsonl$/, "");
    var sub = path.join(sid, "subagents");
    try {
      fs.readdirSync(sub).forEach(function(s) {
        if (s.endsWith(".jsonl")) subfiles.push(path.join(sub, s));
      });
    } catch(e) {}
  });
  subfiles.sort(function(a, b) { return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs; });
  if (!search(subfiles)) console.log("Session not found.");
}
