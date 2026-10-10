#!/usr/bin/env bash
# Validate the marketplace, the plugin and the skill layout. Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")/.."

claude_cmd=(claude)
command -v claude >/dev/null || claude_cmd=(npx --yes @anthropic-ai/claude-code@2.1.296)

"${claude_cmd[@]}" plugin validate .
"${claude_cmd[@]}" plugin validate alandovskis

status=0
for skill in alandovskis/skills/*/; do
  dir=$(basename "$skill")
  file="$skill/SKILL.md"
  if [ ! -f "$file" ]; then echo "missing $file"; status=1; continue; fi
  name=$(sed -n 's/^name: *//p' "$file" | head -1)
  desc=$(sed -n 's/^description: *//p' "$file" | head -1)
  [ "$name" = "$dir" ] || { echo "$file: name '$name' does not match directory '$dir'"; status=1; }
  [ -n "$desc" ] || { echo "$file: missing description"; status=1; }
done
exit $status
