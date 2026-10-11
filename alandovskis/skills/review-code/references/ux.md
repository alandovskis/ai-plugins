# UX lens

Question: can everyone, on any device and theme, use this, and does it hold together as a system?

The lens covers accessibility, responsive behaviour, theming and implementation integrity. Performance is left to the efficiency lens.

Applies only when the change adds or edits web UI. Report `No findings.` for a change that touches none.

## Run the audit

1. Run `/impeccable audit` (the impeccable skill, `audit` command) on the changed files or routes. It is read-only: it reports and does not fix.
2. Use its Accessibility, Responsive Design, Theming and Implementation Integrity dimensions, including the detector findings. Leave its Performance results to the efficiency lens.
3. Verify each finding against the changed code and keep it only if it meets the finding bar in the review-code skill. Drop findings in code the change does not touch.
4. Map severity: P0 to `blocker`, P1 to `major`, P2 to `minor`, P3 to `nit`.

If the impeccable skill is unavailable, say so in the checks you could not run and apply the checklist below yourself.

## Checklist

- Contrast below 4.5:1 for text (3:1 for large text and UI components), in every theme the change styles.
- Interactive elements that are not real controls (`div` or `span` with a click handler), missing roles, names or states, and ARIA that contradicts native semantics.
- Keyboard: unreachable controls, illogical tab order, traps, missing or removed focus indicators, focus not moved into or returned from dialogs and menus.
- Semantics: skipped heading levels, missing landmarks, lists and tables built from generic elements.
- Images and icons without a text alternative, or decorative ones that are announced.
- Form controls without a programmatic label; errors not tied to their field or not announced; required state shown by colour alone.
- Motion: animation with no `prefers-reduced-motion` alternative, flashing, or motion that blocks reading or task completion.
- Touch targets under 44x44 px; content lost or scrolling in two directions at narrow widths or increased text size.
- Responsive: fixed widths that overflow narrow viewports, drag or slider surfaces that fail under touch (mouse-only handlers, no `touch-action`, state never cleared on cancel), missing mobile variants.
- Theming: hard-coded colours that bypass design tokens, dark mode missing or low-contrast, values that do not update on theme change.
- Implementation integrity: design-system drift, repeated shortcuts, misleading or decorative content, detector findings confirmed in context.

Name the affected user and the action they cannot complete; for accessibility findings, add the WCAG success criterion.
