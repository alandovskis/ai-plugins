---
type: llm
focus: last_message
---

PASS if the reply meets all of these (the reply describes the calls it would make, so judge the plan, not executed calls):
- Plans to extract page ID 424242 from the URL, resolve the cloud ID with getAccessibleAtlassianResources, and fetch the page with getConfluencePage using contentFormat markdown (or states it was given the page content)
- Plans to call getJiraProjectIssueTypesMetadata for project MYAPP to find the Epic type and the Story type (falling back to Task)
- Plans exactly one Epic via createJiraIssue whose summary is "Dark Mode" and whose description is the Objective text
- Plans exactly three Stories, one per requirement row, with the requirement name as summary and a description containing the User Story, the Importance and the Notes (using — when notes are empty)
- Each planned Story is linked to the Epic key, using the parent field or additional_fields with customfield_10014 (choosing by project style, or noting both, is acceptable)
- Shows the final summary table of Requirement, Jira Issue and Importance (illustrative keys are acceptable), shows the Epic, and offers to update the Jira Issue column in the Confluence PRD

FAIL if any is not met.
