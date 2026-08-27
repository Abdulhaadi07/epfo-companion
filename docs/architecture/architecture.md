# EPFO Companion — Architecture

## 1. Architecture Goal

Build a small, maintainable, testable web application that demonstrates an improved EPFO citizen experience while keeping the domain state deterministic and government dependencies fully synthetic.

---

# 2. Core Architecture Principle

> **Truth belongs to the domain. Intelligence belongs to the assistant. Presentation belongs to the experience layer.**

This means:

### Domain

Determines:

- claim state
- allowed transitions
- eligibility/readiness
- reason codes
- permitted actions

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
   ├── Synthetic Infrastructure
   └── AI Integration