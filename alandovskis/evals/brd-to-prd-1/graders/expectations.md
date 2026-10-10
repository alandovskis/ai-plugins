---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Plans to resolve the cloud ID with getAccessibleAtlassianResources before any other Confluence call
- Plans to list the available spaces with getConfluenceSpaces without a type filter, and writes out a message asking the user to choose a space and whether to use a parent page or the space root, rather than asking the user to type a space key
- Plans to fetch the BRD with getConfluencePage using page ID 123456789 and contentFormat markdown
- After the (planned) BRD fetch, writes out a PRD scoping plan message built from the BRD requirements BR-001 to BR-004 given in the prompt, listing the business requirements covered by each proposed PRD with a UI Yes/No value and a rationale, and asks the user to confirm or adjust it
- Stops at the scoping confirmation and does not generate PRDs or call createConfluencePage before the scoping plan is confirmed

FAIL if any is not met.
