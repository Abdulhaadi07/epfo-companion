# EPFO Companion — Codex Project Instructions

## Project

EPFO Companion is an independent citizen-first prototype that demonstrates a better way to understand and complete EPFO-related tasks.

It is NOT an official EPFO product and must never imply government approval, affiliation, endorsement, partnership, or live government integration.

The prototype uses synthetic data and mocked government dependencies only.

The experience should feel realistic and polished while remaining honest about its prototype nature.

---

## Before Every Task

Before modifying the repository:

1. Read this file.
2. Read `docs/product/product-contract.md`.
3. Read `docs/product/user-journey.md` when the task affects the user experience or journey.
4. Read `docs/architecture/architecture.md` when the task affects architecture, data flow, AI, APIs, persistence, authentication, internationalization, or infrastructure.
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

The database stores persistent state.

The domain layer determines whether state transitions are valid.

### 5. AI assists; it does not control truth

OpenAI is used for intent understanding, explanation, guidance, and conversational assistance.

AI must operate only on controlled application context and allowed actions.

AI must never become the source of truth for government-process state or business rules.

### 6. Realistic experience, synthetic system

The interface should feel like a credible modern public-service platform.

Synthetic implementation details should not unnecessarily make the user experience feel artificial.

However, the product must never falsely imply that a real government transaction has occurred.

### 7. Mobile-first and accessible

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
- use real bank credentials
- scrape personal or restricted information
- reverse-engineer private or undocumented government APIs
- imply that the prototype is an official government product
- expose API keys or secrets in client code or source control

Use synthetic/demo data only.

The prototype may use realistic-looking fictional identities and institutions, but they must remain synthetic and must not be presented as real user records.

The product should include a subtle, persistent prototype disclosure appropriate to the interface context, such as:

"Independent prototype • Synthetic data • Not an official EPFO service"

Do not repeatedly use distracting "DEMO" labels throughout the primary experience.

---

## Authentication and Credentials

Authentication is synthetic and exists to demonstrate realistic account-based journeys.

Rules:

- Never store plaintext passwords.
- Store only appropriately hashed passwords.
- Never use real credentials.
- Never reuse credentials from real services.
- Never expose password hashes to the client.
- Authentication logic must run on the server.
- Sessions must be server-controlled.
- Sensitive cookies must use appropriate security attributes.
- User account data must come from persistent synthetic records rather than hardcoded UI text.

The application may provide clearly labelled sample credentials for reviewers.

A one-click "Try a sample account" or equivalent frictionless entry is encouraged for the hackathon experience.

---

## Persistence

The application uses a relational persistence model for synthetic citizen/account state.

Current persistence direction:

- PostgreSQL
- Drizzle ORM
- Repository abstraction

The database should store facts such as:

- synthetic user identity
- credential metadata
- preferred language
- preferred region
- employment records
- PF accounts
- claims
- claim events

The database must not replace domain rules.

Use:

```text
Database
    ↓
Repository
    ↓
Domain
    ↓
Experience