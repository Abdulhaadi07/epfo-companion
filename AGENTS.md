# EPFO Companion — Codex Project Instructions

## Project

EPFO Companion is an independent citizen-first prototype that demonstrates a better way to understand and complete EPFO-related tasks.

It is NOT an official EPFO product and must never imply government approval, affiliation, endorsement, or integration.

The prototype uses synthetic data and mocked government dependencies only.

---

## Before Every Task

Before modifying the repository:

1. Read this file.
2. Read `docs/product/product-contract.md`.
3. Read `docs/product/user-journey.md` when the task affects the user experience or journey.
4. Read `docs/architecture/architecture.md` when the task affects architecture, data flow, AI, APIs, or infrastructure.
5. Inspect the existing implementation before creating or modifying files.

Do not assume an architecture or feature that conflicts with the project documentation.

---

## Product Principles

### 1. Citizen-first

Design around what the citizen is trying to accomplish, not around government terminology or internal departmental structure.

### 2. Explain, don't merely report

A status is not enough.

Every important process state should communicate:

- What is happening?
- Does the citizen need to do anything?
- What happens next?

### 3. No dead ends

Every meaningful state should provide a clear next step.

If no action is required, explicitly say so.

### 4. Deterministic truth

Business rules, eligibility, claim status, allowed transitions, and permitted actions belong to the deterministic application/domain layer.

The AI model must not invent or override these rules.

### 5. AI assists; it does not control truth

OpenAI is used for intent understanding, explanation, guidance, and conversational assistance.

AI must operate only on controlled application context and allowed actions.

### 6. Mobile-first and accessible

Design for:

- mobile browsers
- small screens
- slower connections
- limited digital literacy
- clear language
- accessible interaction
- touch-friendly controls

Desktop is important, but mobile usability is a first-class requirement.

---

## Safety and Compliance

Never:

- access live EPFO systems
- submit real EPFO claims
- use real UAN numbers
- use real Aadhaar numbers
- use real PAN details
- use real OTPs
- use real bank details
- scrape personal or restricted information
- reverse-engineer private or undocumented government APIs
- imply that the prototype is an official government product
- expose API keys or secrets in client code or source control

Use synthetic/demo data only.

Clearly communicate within the product that this is a prototype using synthetic data.

---

## Engineering Rules

- Use TypeScript throughout the application.
- Prefer simple, maintainable solutions.
- Avoid unnecessary dependencies.
- Keep domain logic independent from UI components.
- Keep OpenAI integration isolated behind server-side application boundaries.
- Validate external/model input with schemas.
- Never expose the OpenAI API key to the browser.
- Prefer server-side API routes for AI operations.
- Preserve strong typing.
- Add tests for domain rules and important user journeys.
- Do not rewrite unrelated code.
- Do not introduce a framework or service without a concrete project need.

---

## Codex Workflow

For substantial tasks:

1. Inspect the relevant code and documentation.
2. State the intended approach.
3. Make the smallest coherent implementation.
4. Run relevant tests/checks.
5. Report what changed and any remaining issues.

Do not implement multiple unrelated features in one task unless explicitly requested.

---

## Product Scope

The flagship journey is:

Entry
→ Intent
→ Eligibility
→ Readiness
→ Review
→ Submit
→ Track
→ Explain
→ Resolve
→ Complete

The flagship problem is:

> Citizens often see a claim status without understanding what it means, whether they need to act, or what happens next.

The prototype should solve that problem exceptionally well rather than attempting to rebuild every EPFO service.

---

## Source of Truth

For product decisions:

`docs/product/product-contract.md`

For the detailed journey:

`docs/product/user-journey.md`

For technical architecture:

`docs/architecture/architecture.md`

These documents should be treated as the project's current source of truth.