# Consistency lens

Question: does the doc agree with itself, section to section and sentence to sentence?

Check the doc for:

- One concept called by several names, or one name used for several concepts.
- Goals with no scenario, design element or SLO that serves them, and design elements that serve no goal.
- Non-goals contradicted by the design, timeline or interfaces.
- Numbers that differ between sections (latency, scale, dates, milestones, sizes).
- SLOs with no matching monitoring or alerting, and alerts with no SLO.
- Diagram components, protocols or dependencies absent from the text, or present in the text and missing from the diagram.
- Chosen technology or dependency that conflicts with a stated constraint, or appears in Alternatives as rejected.
- Open issues that the body treats as settled, and resolved issues the body still treats as open.
- Mixed tense, voice, units, date format or heading style.
- Status and metadata that disagree with the content (approved while open issues block the design).

Do not report vague or oversized text (Clarity, Conciseness).
