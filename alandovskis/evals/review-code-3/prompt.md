---
description: "A web UI diff is also reviewed through the UX lens."
tags: [review-code]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty, so review only the diff in the user's message and give the complete review as your final reply."
---

Review this change before I merge it.

```diff
+export function SaveButton({ onSave }) {
+  return (
+    <div className="toolbar">
+      <div className="btn" onClick={onSave}>
+        <img src="/save.svg" />
+      </div>
+    </div>
+  );
+}
+
+.btn { color: #aaa; background: #fff; outline: none; width: 24px; height: 24px; }
+.toolbar { width: 1200px; background: #fff; border: 1px solid #ddd; }
```
