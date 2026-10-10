---
description: "A PRD follows the exact template with correctly formatted user stories."
tags: [prd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed using the details in the user message. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every document you would create."
---

Write a PRD for a "saved searches" feature in our job board app. Job seekers keep re-running the same searches; we want them to save a search and get a daily email of new matches. Target ship date 12 March 2027, status Draft. Team: Aisha Khan (PM), Ben Torres (Engineering Lead), Chloe Dubois (Design). Success: raise 30-day return rate from 22% to 30% within a quarter of launch. Assumptions: users are already signed in; email infrastructure exists. Milestones: design complete 15 Dec 2026, beta 1 Feb 2027, GA 12 Mar 2027. Requirements: save a search (Must), receive daily email digest (Must, JOBS-214), manage saved searches (Should), push notifications (Could). Out of scope: SMS alerts and employer-side alerts. Designs are in Figma at figma.example/saved-searches; no Loom demo or work tracker link yet.
