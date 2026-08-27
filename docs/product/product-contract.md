# EPFO Companion — Product Contract

## 1. Product

**Working name:** EPFO Companion

EPFO Companion is an independent citizen-first prototype that demonstrates how EPFO-related services can be presented as understandable, guided tasks rather than as government-system terminology and status codes.

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
- may be comfortable using simple English or Hinglish
- becomes concerned when money or claims appear stuck
- wants to know what to do rather than how government systems are structured

---

## 4. Primary Job To Be Done

> "I want to get my PF, understand what is happening to my claim, and know exactly what I need to do next without becoming an expert in EPFO processes."

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

## 8. AI Role

OpenAI is a meaningful product capability, not a decorative chatbot.

AI may:

- understand a citizen's natural-language request
- classify intent
- explain deterministic system state in plain language
- explain known rejection/problem reasons
- answer contextual questions
- recommend an action from a controlled list of allowed actions

AI must not:

- invent eligibility rules
- invent government policy
- invent claim statuses
- override deterministic business rules
- directly perform unrestricted account mutations
- claim that a real government action has occurred

---

## 9. Synthetic Data

The prototype must use synthetic data only.

Examples include:

- demo UAN identifiers
- fictional citizen names
- fictional employers
- fictional claim IDs
- synthetic balances
- synthetic bank information

No real personal information may be used.

---

## 10. Demo Scenarios

The application should support controlled synthetic scenarios that demonstrate the system's behavior.

### Scenario A — Ready / Happy Path

Citizen is eligible and successfully submits a claim.

### Scenario B — Under Verification

Claim has been submitted and is currently being verified.

No user action is required.

### Scenario C — Action Required

A controlled issue such as a synthetic bank-information mismatch requires user action.

### Scenario D — Rejected

A claim is rejected for a synthetic reason and the product explains the problem and guides the citizen toward resolution/resubmission.

---

## 11. Success Criteria

The prototype should enable a first-time citizen to:

1. understand what they are trying to do
2. understand whether they are ready
3. complete the simulated claim journey
4. understand the current claim state
5. know whether action is required
6. understand why a problem occurred
7. know what to do next

### Primary experience metric

A first-time user should be able to correctly answer:

- What is happening?
- Do I need to do anything?
- What happens next?

without external assistance.

---

## 12. Platform Requirements

The project is a responsive web application.

Reviewers must not need to install a mobile app.

The experience must work through a browser URL.

If authentication is used, provide clearly labelled synthetic/demo credentials and/or a one-click demo account.

---

## 13. Out of Scope

The prototype will not:

- connect to live EPFO systems
- access live government APIs
- submit real claims
- perform real financial transactions
- use real Aadhaar/PAN/UAN information
- use real OTPs
- use real banking credentials
- scrape restricted/private information
- replace the complete EPFO ecosystem
- implement every EPFO service

---

## 14. Product Positioning

The product should be presented as:

> A citizen-first experience layer for understanding and navigating complex EPFO journeys.

Not:

> A replacement for EPFO.

Not:

> An official government application.

---

## 15. Design Principle

Preserve useful information and services that citizens need, but improve the way they are:

- discovered
- organized
- explained
- prioritized
- navigated
- completed

The project is a reframing of the experience, not an attempt to discard the underlying service content.