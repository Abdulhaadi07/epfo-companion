
---

# 2. `docs/product/product-contract.md`

Replace it with:

```md
# EPFO Companion — Product Contract

## 1. Product

**Working name:** EPFO Companion

EPFO Companion is an independent citizen-first prototype that demonstrates how EPFO-related services can be presented as understandable, guided tasks rather than as government-system terminology and opaque statuses.

It is a prototype for the BuildWhatMovesIndia hackathon.

It is not an official EPFO application.

---

## 2. Core Problem

The problem we are solving is not simply that citizens need access to EPFO services.

The deeper problem is that a citizen may be able to initiate or track a claim but still struggle to understand:

- what is happening
- what a status means
- whether something is wrong
- whether they need to take action
- what caused a problem
- what they should do next
- what will happen after the next step

### Core insight

> A citizen does not need a status. They need an understandable situation and a clear next action.

---

## 3. Primary User

Our primary user is an ordinary employee with a PF account who:

- uses a smartphone or browser
- may have limited familiarity with EPFO terminology
- may not understand claim/form terminology
- may be comfortable using their preferred Indian language
- may have limited digital literacy
- may become concerned when money or claims appear stuck
- wants to know what to do rather than how government systems are structured

---

## 4. Primary Job To Be Done

> "I want to get my PF, understand what is happening with my claim, and know exactly what I need to do next without becoming an expert in EPFO processes."

---

## 5. Flagship Journey

The primary journey is:

**PF final-settlement / withdrawal claim**

The complete experience is:

1. Entry
2. Intent selection
3. Eligibility
4. Readiness check
5. Claim review
6. Submission
7. Confirmation
8. Claim tracking
9. Status explanation
10. Issue resolution when required
11. Completion

---

## 6. Signature UX Principle

Every important process state must answer three questions:

### What is happening?

Use plain language.

### Do I need to do anything?

Explicitly say yes or no.

### What happens next?

Show the next stage or action.

---

## 7. Product Experience Layers

### Discover

Public-facing experience:

- header/navigation
- hero/task launcher
- services
- notices
- help
- FAQ
- about
- footer
- contextual CTA
- language selection

### Accomplish

Task-focused citizen experience:

- understand goal
- determine eligibility
- check readiness
- review
- submit
- track
- resolve
- complete

### Understand

AI-assisted experience:

- interpret natural-language intent
- explain claim status
- explain problems
- simplify terminology
- guide users toward allowed next actions
- answer questions using controlled application context

---

## 8. Account and Authentication Experience

The prototype uses synthetic persistent user accounts.

A user's account may contain:

- synthetic identity
- authentication credentials
- preferred language
- preferred region
- employment records
- PF account
- claim history

The user experience should feel like a realistic account-based service.

Credentials must be synthetic and passwords must never be stored in plaintext.

The reviewer journey should support a frictionless sample-account entry.

A clearly labelled sample account or one-click "Try a sample account" pathway may be provided.

---

## 9. Data and Persistence

The prototype uses persistent synthetic data.

The database is not connected to live EPFO.

Persistent data may represent:

- synthetic users
- credentials
- profile information
- preferred language
- preferred region
- employment
- PF accounts
- claims
- claim events

The database represents the simulated state of the prototype.

It does not represent real EPFO records.

---

## 10. Internationalization

The product supports the 22 Scheduled Languages of India.

### First-visit language experience

On the first visit, the user should be invited to choose their preferred language.

The selection experience supports two paths:

### Region-assisted selection

The user selects a region/state.

The application suggests a sensible default language associated with that region.

Example:

```text
Region
Telangana

Suggested language
తెలుగు — Telugu