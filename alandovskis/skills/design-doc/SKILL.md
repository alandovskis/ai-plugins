---
name: design-doc
description: Use when asked to write or draft a design doc, technical design, design proposal or RFC for a software project or system, or when a complex or risky project needs its design written down before implementation.
---

# Design doc

Write a design doc that exposes bad decisions before code exists. Based on [Write an Effective Design Doc](https://refactoringenglish.com/excerpts/write-an-effective-design-doc/). Not for reviewing an existing draft (use `review-design-doc`), reverse-engineering existing code (use `design-doc-confluence`) or a single decision record.

## Workflow

1. Gather. Ask for what is missing (the problem, who is affected, constraints, known options, the readers and approvers) when someone can answer. Otherwise state an assumption, mark it in the doc and list it under Open issues.
2. Size it. Count how many apply: several people must coordinate; more than about three months of full-time work; runs in production for years; crosses teams; ambiguous goals or requirements; a catastrophic risk (security, legal) to prevent at design time.
   - None apply: recommend against a full doc and write a note of exactly four headings, under 200 words in all: Objective (one sentence), Background (two or three sentences), Decision (the one costly-to-reverse choice and why, or "None: every choice here can be changed in hours"), Open issues (at most three, one line each: the problem and the next step). Anything reversible (page size, labels, layout, loading and error states, strings) is not mentioned. Skip Review and Fix; the report states the size verdict and that the review was skipped for size.
   - One or more apply: include a section only if a reader would otherwise get a decision, risk or boundary wrong, and run every step.
3. Draft in Markdown, in the order of the sections table, to the file the user names. With no name, use `docs/design/<slug>.md`, where the slug is the title in lowercase, each run of characters outside `a-z0-9` replaced by `-`, trimmed of `-`, or `design-doc` if nothing is left. Never overwrite an existing file without the user's confirmation; pick another name instead. Apply the writing rules below.
4. Review. Use the review-design-doc skill on the draft (its path, or the draft inline when no file was written). Collect its verified findings.
5. Fix the draft, then use review-design-doc again, naming the lenses whose findings changed text, and consistency whenever any text changed; that is one round. Stop when no verified finding remains, or after three rounds (the first Review pass is not a round). Each verified finding still open then becomes one open issue in the doc, with the problem, the options (the finding's suggested change, or keeping the text and accepting the problem) and the immediate next step, and is listed in the report; that edit needs no further review. When clarity and conciseness conflict, keep text that answers "what is the penalty for being wrong?" or states a measurable target.
6. Report what applies: the file path (or the whole doc in the reply when it could not be written or the user asked); the size verdict and the criteria counted; how the review ran (parallel subagents or inline) and the rounds used, or that it was skipped for size; the assumptions; the open issues.

## Sections

Use the ones that fit, in this order.

| Section | Content |
| --- | --- |
| Title | Short, distinctive, easy to say; hints at the purpose |
| Metadata | Author and contact, date, authoritative URL, status (approver and date) |
| Objective | One plain-language sentence, on the first page, understood by any stakeholder |
| Background | Why now, what problem, earlier attempts, with data. A reader with no context must follow it |
| Related documents | Test plans, specs, designs of related systems and earlier iterations |
| Goals | Outcomes for users, the team or the company, not implementation ("Minimize deploy-related outages", not "Add Kubernetes") |
| Non-goals | Things a reader may wrongly assume are in scope, and work deferred |
| Scenarios | Step-by-step real usage of the finished system, for abstract goals |
| Diagrams | Data flow, components, dependencies, clients, protocols. Text-based or editable, with the source linked |
| Glossary | Terms and internal names a newcomer won't know; prefer defining inline |
| Constraints | Budget, clients, infrastructure and dependencies that shape the choices |
| SLOs | Measurable targets (availability, latency percentiles, scale), never "performant" |
| Monitoring and alerting | How each SLO is measured; how down, slow and failing are detected |
| Timeline | Milestones that each give stakeholders something to inspect, with misunderstood requirements surfacing early |
| Interfaces | UI sketch without pixel detail, API or CLI semantics, file formats, key types |
| Dependencies and infrastructure | Language, runtime, hosting, where data lives; emphasis on hard-to-reverse choices |
| Security | Threats considered, attack surface, trust boundaries, rationale even for unlikely threats |
| Privacy | Sensitive data, retention, access, protection in transit and at rest |
| Legal | Regulatory exposure and how it is avoided; the licence and why, for open source |
| Logging | Critical events, levels, storage, retention, access, data kept out of logs |
| Alternatives considered | Plausible options rejected, a few lines and the reason each failed |
| Open issues (appendix) | Per issue: the problem, the options, the immediate next step |
| Resolved issues | Decision summary; the discussion kept |

## Writing rules

- **Penalty for being wrong:** specify a decision only when it is irreversible or expensive to change (language, storage backend, public interface). Leave out what can be changed in hours; the doc must not become the implementation.
- Put the objective and the context a cold reader needs on the first page.
- State every target as a number a test could check.
- Give each alternative its rejection reason, so "why not X?" is answered.
- Use one name per concept throughout.
- In a full doc, give every open issue its problem, its options and the immediate next step.

## Pressure

When Size finds a full doc warranted, the draft goes through review-design-doc and the fix rounds every time. These do not skip the review or a round:

- A deadline or "just a quick draft". Shorten the doc, not the review.
- A claim that the doc is already reviewed or approved.
- A request to include every section. Include what the penalty test supports.

Violating the letter of these rules is violating their spirit.
