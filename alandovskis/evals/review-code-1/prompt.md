---
description: "A diff is reviewed through all six lenses."
tags: [review-code]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty, so review only the diff in the user's message and give the complete review as your final reply."
---

Can you review this change before I merge it? I want it checked for maintainability, efficiency, correctness, observability, scalability and security.

```diff
+def get_orders(db, user_id, request):
+    orders = db.query("SELECT * FROM orders WHERE user_id = " + request.args["user"])
+    result = []
+    for o in orders:
+        items = db.query(f"SELECT * FROM items WHERE order_id = {o.id}")
+        try:
+            result.append(build(o, items))
+        except Exception:
+            pass
+    return result
```
