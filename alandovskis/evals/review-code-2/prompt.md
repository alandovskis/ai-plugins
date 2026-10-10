---
description: "A clean change gets no invented findings."
tags: [review-code]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty, so review only the diff in the user's message and give the complete review as your final reply."
---

Review this through the maintainability, efficiency, correctness, observability, scalability and security lenses.

```diff
+/// Returns the larger of two values.
+pub fn max_u32(a: u32, b: u32) -> u32 {
+    if a >= b { a } else { b }
+}
+
+#[cfg(test)]
+mod tests {
+    use super::*;
+    #[test]
+    fn picks_larger() {
+        assert_eq!(max_u32(1, 2), 2);
+        assert_eq!(max_u32(2, 1), 2);
+        assert_eq!(max_u32(3, 3), 3);
+        assert_eq!(max_u32(0, u32::MAX), u32::MAX);
+        assert_eq!(max_u32(u32::MAX, 0), u32::MAX);
+    }
+}
```
