
---

# 3. `docs/architecture/architecture.md`

Replace it with:

```md
# EPFO Companion — Architecture

## 1. Architecture Goal

Build a maintainable, testable, responsive web application that demonstrates an improved EPFO citizen experience while keeping government dependencies fully synthetic.

The prototype should feel like a credible account-based public-service platform while remaining technically separated from real EPFO systems.

---

# 2. Core Architecture Principle

> **Truth belongs to the domain. Persistence belongs to the repository. Intelligence belongs to the assistant. Presentation belongs to the experience layer.**

This means:

### Domain

Determines:

- claim state
- allowed transitions
- eligibility/readiness
- reason codes
- permitted actions

### Repository

Handles:

- persistence
- retrieval
- updates
- mapping between persistent records and domain entities

### AI

Provides:

- intent understanding
- explanation
- conversational guidance
- contextual assistance

### Experience

Provides:

- navigation
- presentation
- interaction
- accessibility
- progressive disclosure

AI must not replace domain truth.

---

# 3. Application Architecture

The application is a modular Next.js monolith.

```text
Browser
   ↓
Next.js
   ├── Experience
   ├── Application
   ├── Domain
   ├── Repository
   ├── Synthetic Data / Seed
   └── AI Integration