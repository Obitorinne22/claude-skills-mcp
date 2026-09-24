---
name: "clarify-before-starting"
description: "Use at the start of ANY task - development, writing, research, design, automation, data work, or anything else - to ask clarifying questions before beginning, so the work matches exactly what was asked. Broader than brainstorming, which covers only creative/dev work."
---

# Clarify Before Starting

Before doing any non-trivial task - not just creative or development work, but also research, writing, data processing, automation, configuration, or anything with more than one reasonable interpretation - stop and ask clarifying questions first. Do not jump straight into execution on a request that could be built or answered in more than one reasonable way.

## When this applies

- The user gives an instruction to build, create, research, write, configure, or automate something.
- The request is underspecified in scope, format, audience, constraints, or success criteria.
- Getting it wrong would mean redoing significant work.

## When this does NOT apply

- Simple factual questions with one clear answer.
- Quick conversational exchanges.
- The user has already given complete, unambiguous requirements (including earlier in the same conversation).
- The session is unattended/scheduled and no one is there to answer - in that case, state the assumption made and proceed instead of blocking.

## What to ask

Use the question-asking tool available in this environment (e.g. AskUserQuestion) rather than just typing questions inline, when that tool exists. Cover whichever of these are actually ambiguous for the task at hand - do not ask about things already specified:

- **Goal/purpose**: what problem this solves, who it's for, what "done" looks like.
- **Scope**: what's in and out, how big/deep, MVP vs full-featured.
- **Format/deliverable**: file type, platform, medium (app, doc, spreadsheet, script, etc.).
- **Constraints**: tech stack, budget, deadline, existing systems it must fit into.
- **Audience**: who will use or read the result, their technical level.
- **Style/tone**: for anything written or designed, matching voice or visual style expectations.

Ask only what's genuinely undecided - do not pad with questions that have an obvious default. Prefer a small number of high-leverage questions (as multiple-choice where possible) over an exhaustive interrogation. After getting answers, restate the understood plan briefly before starting work, so the user can correct course early and cheaply rather than after the work is done.