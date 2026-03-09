var fs = require("fs");
var path = require("path");
var os = require("os");

var d = path.join(os.homedir(), ".claude/projects", process.cwd().replace(/\//g, "-"));

var files;
try {
  files = fs.readdirSync(d)
    .filter(function(x) { return x.endsWith(".jsonl"); })
    .map(function(x) { return path.join(d, x); })
    .sort(function(a, b) { return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs; });
} catch(e) {
  console.log("No session dir found");
  process.exit();
}

// The Skill tool invocation writes {"toolUseResult":{"commandName":"context-check"}}
// to the JSONL before this script runs. Find that entry and follow sourceToolAssistantUUID
// to the assistant message which has the current turn's usage data.
var data = fs.readFileSync(files[0], "utf8");
var lines = data.split("\n").filter(Boolean).map(JSON.parse);

var me = null;
for (var i = lines.length - 1; i >= 0; i--) {
  var tr = lines[i].toolUseResult;
  if (tr && tr.commandName === "context-check") { me = lines[i]; break; }
}
if (me === null) { console.log("Skill invocation not found"); process.exit(); }

var tid = me.sourceToolAssistantUUID || me.parentUuid;
for (var i = lines.length - 1; i >= 0; i--) {
  if (lines[i].uuid === tid && lines[i].message && lines[i].message.usage) {
    var u = lines[i].message.usage;
    var t = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
    console.log("Context: " + t.toLocaleString() + "/200,000 (" + Math.floor(t * 100 / 200000) + "%)");
    process.exit();
  }
}
console.log("Context: first turn — no usage data yet, check again next turn.");
