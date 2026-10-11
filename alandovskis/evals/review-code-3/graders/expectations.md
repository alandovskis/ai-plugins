---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Has a UX section in addition to the six engineering lenses
- Reports the clickable div that is not keyboard-operable or exposed as a button
- Reports the removed focus indicator (outline: none)
- Reports the missing text alternative on the image, or the low contrast, or the 24px touch target
- Reports the fixed 1200px toolbar width that overflows narrow viewports
- Reports the hard-coded colours (#aaa, #fff, #ddd) with no design tokens or dark-mode variant
- Each UX finding names a location and a severity of blocker, major, minor or nit

FAIL if any is not met.
