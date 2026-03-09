var fs = require("fs");
var path = require("path");
var os = require("os");

var anchor = process.argv.slice(2).join(" ");
if (!anchor) { console.log("Usage: check.js <anchor-phrase>"); process.exit(1); }

var d = path.join(os.homedir(), ".claude/projects", process.cwd().replace(/\//g, "-"));

// Collect all JSONL files: top-level sessions + subagent sessions
var files = [];
try {
  var entries = fs.readdirSync(d, { withFileTypes: true });
  entries.forEach(function(e) {
    var full = path.join(d, e.name);
    if (e.isFile() && e.name.endsWith(".jsonl")) {
      files.push(full);
    } else if (e.isDirectory()) {
      var sub = path.join(full, "subagents");
      try {
        fs.readdirSync(sub).forEach(function(s) {
          if (s.endsWith(".jsonl")) files.push(path.join(sub, s));
        });
      } catch(e) {}
    }
  });
  files.sort(function(a, b) { return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs; });
} catch(e) {
  console.log("No session dir found");
  process.exit();
}

// Step 1: Find which file contains the anchor (identifies the correct session)
// Step 2: Read the last assistant message with usage from that file
var limit = Math.min(files.length, 10);
for (var fi = 0; fi < limit; fi++) {
  var data = fs.readFileSync(files[fi], "utf8");
  if (data.indexOf(anchor) === -1) continue;

  var lines = data.split("\n").filter(Boolean).map(JSON.parse);
  for (var i = lines.length - 1; i >= 0; i--) {
    var msg = lines[i].message;
    if (msg && msg.role === "assistant" && msg.usage) {
      var u = msg.usage;
      var t = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
      console.log("Context: " + t.toLocaleString() + "/200,000 (" + Math.floor(t * 100 / 200000) + "%)");
      process.exit();
    }
  }
}
console.log("Session not found.");
