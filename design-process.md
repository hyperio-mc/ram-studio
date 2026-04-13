# RAM Design Studio — Standard Process

Last updated: 2026-03-16

---

## THE RULE

Every design request — heartbeat or direct — follows this full process before any layout code is written.
No exceptions. Domain familiarity is not an excuse to skip steps.

Rakis (Mar 16): *"Learn from this, make sure you do this on every request — deep research into the market area, are there competitors, what are their offerings, what are the use cases, build a solid PRD."*

---

## Full Pre-Design Process (Required Every Time)

### Phase 1 — Market Research

**Goal: Understand the competitive landscape before designing anything.**

Questions to answer:
- What category is this product in? Name it precisely.
- Who are the 4–8 direct competitors? (Include both well-funded and niche players.)
- For each competitor:
  - What is their core value proposition?
  - Who is their primary target customer? (company size, role, industry)
  - What is their pricing model?
  - What do users praise about them? (check G2, Capterra, App Store reviews)
  - What do users consistently complain about?
  - What is their primary UI skeleton? (not just visual style — structural)
- What are the market gaps? Where are all competitors weak?
- Is there a clear category leader? What makes them dominant?
- Are there any new entrants disrupting the space with a different model?

**Output:** Competitor table + gap analysis paragraph. No competitor deep-dives without also documenting gaps.

---

### Phase 2 — Domain & Actor Research

**Goal: Understand what people actually DO, not just what software exists.**

Questions to answer:
- Who are the distinct actors in this domain? (there are almost never fewer than 3)
- For each actor:
  - Job title and responsibilities
  - Physical context: where are they when using this tool? (desk, vehicle, warehouse floor, customer site)
  - Device: desktop, mobile, tablet, specialized hardware?
  - Time pressure: real-time decisions, daily planning, weekly review?
  - Primary goal: what are they trying to accomplish?
  - Primary anxiety: what do they most fear failing at?
  - Key pain points with existing tools
- What domain-specific vocabulary exists that has no generic equivalent?
  - (E.g., "HOS" in trucking, "ACW" in contact centers, "attribution window" in ad tech)
  - Each domain term that has no generic equivalent is a potential unique UI pattern
- What are the step-by-step task workflows for each primary use case?
  - Map out the full flow, not just the happy path
  - Where does the workflow break down in current tools?
- What regulatory, legal, or physical constraints exist?
  - These often drive hard UI requirements (offline-first, large touch targets, audit logs, etc.)

**Output:** Actor profiles table + domain vocabulary glossary + workflow maps (prose or numbered steps).

---

### Phase 3 — Use Cases

**Goal: Define what the product must enable, ranked by importance.**

For each use case:
- **Actor**: who is doing this?
- **Trigger**: what causes them to open the app / start this task?
- **Goal**: what are they trying to accomplish?
- **Steps**: numbered flow from start to completion
- **Success condition**: how do they know it worked?
- **Failure modes**: what goes wrong? how does the UI recover?
- **Frequency**: how often? (real-time, hourly, daily, weekly, ad hoc)
- **Priority**: P0 (blocking, must ship) / P1 (core value, ship soon) / P2 (nice to have)

Aim for 6–10 use cases across all actors. At least 2 per primary actor.

**Output:** Use case table with actor / trigger / goal / priority / frequency.

---

### Phase 4 — PRD (Product Requirements Document)

**Goal: A written specification that design decisions are accountable to.**

The PRD must include:

#### 4.1 Problem Statement
One paragraph. What problem does this product solve, for whom, and why existing solutions fail?

#### 4.2 Target Users
List of actors with 2–3 sentence profiles. Not personas — just the key facts that drive design decisions.

#### 4.3 Market Context
- Category and market size (directional, not precise)
- 3–5 key competitors and their positioning
- The whitespace this product occupies (what gap does it fill?)

#### 4.4 Core Use Cases (P0)
The 3–5 use cases the product absolutely must nail. Everything else is secondary.

#### 4.5 Feature Requirements
Organized by priority:

| Feature | Actor | Priority | Notes |
|---|---|---|---|
| Feature name | Who needs it | P0 / P1 / P2 | Constraints or dependencies |

#### 4.6 Non-Functional Requirements
- Performance requirements (latency, real-time update frequency)
- Offline / connectivity requirements
- Accessibility requirements
- Platform requirements (mobile-first? desktop-primary? both?)
- Integration requirements (what does it connect to?)

#### 4.7 Success Metrics
How do we know the product is working? Include:
- Primary metric (the single most important number)
- Supporting metrics
- Anti-metrics (things we don't want to happen even if primary metric improves)

#### 4.8 UI Implications
Derived from the research above, NOT aesthetic preference:
- What is the primary object model? (the thing users manage — not "the user")
- What information must be visible simultaneously? (determines layout)
- What actions must be 1-tap? What can be multi-step?
- What is the primary UI paradigm and why? (see paradigm inventory below)
- Are there role-specific UI variants needed?
- Any hard constraints on the UI? (touch size, color blindness, gloved hands, low light, etc.)

**Output:** Written PRD document saved alongside the design files.

---

### Phase 5 — Design (Finally)

Only after Phases 1–4 are complete.

1. **Skeleton first** — derive layout from the PRD UI implications, not from an aesthetic trend
2. **Object model** — design the primary object card/row before building the nav shell
3. **Critical screens** — design the P0 use case flows end-to-end before decorative screens
4. **Role variants** — if multiple actors need different views, design all of them
5. **Visual direction last** — pick palette, typography, and density after structure is locked
   - Ask: does this visual direction support or fight the interaction model?
   - Browse Awwwards/Dribbble/Godly for aesthetic references ONLY at this stage

---

### Phase 6 — Design Rationale

Every published design must document:
- One production app studied and what structural lesson was learned from it
- One domain-specific concept that shaped a specific UI decision (name the concept, name the screen)
- One actor's specific workflow that determined a UI pattern (name the actor, name the pattern)
- What makes this skeleton different from a generic nav+list+card layout

This is not marketing copy. It's accountability to the research.

---

## PRD Template

Copy this for each new design project:

```
# PRD: [Product Name]
Date: [date]
Domain: [category]

## Problem Statement
[1 paragraph]

## Target Users
- **[Actor 1]**: [2-3 sentences]
- **[Actor 2]**: [2-3 sentences]

## Market Context
- Category: [name]
- Key competitors: [list with 1-line positioning each]
- Gap this product fills: [1-2 sentences]

## Core Use Cases (P0)
1. [Actor] — [use case name]: [1 sentence description]
2. [Actor] — [use case name]: [1 sentence description]
3. [Actor] — [use case name]: [1 sentence description]

## Feature Requirements
| Feature | Actor | Priority | Notes |
|---|---|---|---|
| | | | |

## Non-Functional Requirements
- Platform:
- Offline:
- Performance:
- Accessibility:

## Success Metrics
- Primary:
- Supporting:
- Anti-metrics:

## UI Implications
- Primary object model:
- Primary UI paradigm:
- Information visible simultaneously:
- 1-tap actions:
- Hard constraints:
```

---

## UI Paradigms Inventory

| Paradigm | Primary Nav | Primary Interaction | Good for |
|---|---|---|---|
| Nav + Feed | Tabs/drawer | Scroll + tap | Social, e-commerce, news |
| Dashboard Grid | Widgets | Glance + drill | Analytics, monitoring |
| Map + Context Panel | Pan/zoom | Click pin/item | Fleet, logistics, geo |
| Infinite Canvas | Pan/zoom | Drag/place | Design tools, brainstorming |
| Command Palette | Search input | Type + select | Power user tools |
| Temporal Grid | Prev/next period | Tap time slot | Calendar, scheduling, habits |
| Graph / Node-Link | Follow edges | Click nodes | Knowledge management |
| Gantt / Timeline | Scroll horizontal | Click item | Project mgmt, dispatch |
| Game HUD | State machine | Real-time | Fitness gamification |
| Mission Control | Always-on strip | Monitor + intervene | Contact center, ops, trading floor |
| Skeuomorphic | Object metaphor | Interact with object | Niche/premium apps |
| Editorial/Document | Scroll | Read + annotate | Content-first apps |
| Conversational | Chat thread | Type + submit | AI tools, support |
| Builder/Assembly | Sidebar + canvas | Drag + configure | Form builders, site builders |
| REPL/Notebook | Cell blocks | Run + inspect | Data science, dev tools |
| Feed + Tray | Scroll + persistent tray | Tap + swipe | Delivery driver, field ops |

---

## Completed Domain Research Archive

### Contact Center Supervisor (Mar 16, 2026)
**Product built:** VANTAGE — https://zenbin.org/p/vantage-cmd

**Competitors studied:** Talkdesk Live, Five9 Supervisor Desktop, Genesys Cloud, Intercom, Zendesk Explore

**Key gap found:** All tools treat AI agents as a separate system from human agents, creating a supervision split. No tool unifies human + AI agents in a single fleet table with the same state machine.

**Domain terms:**
- SLA 80/20 — answer 80% of contacts within 20 seconds; binary pass/fail
- ACW (After Call Work) — post-interaction wrap state; supervisors monitor for abuse
- RONA — Redirect on No Answer; agent missed assigned contact
- HITL — Human in the Loop; AI requesting authorization from supervisor
- AHT — Average Handle Time (talk + hold + ACW)
- FCR — First Contact Resolution rate
- CSAT — Customer Satisfaction score (post-interaction survey)
- Barge / Whisper / Monitor — supervisor live intervention modes

**Skeleton derived:** Mission Control (KPI strip + sidebar + fleet table) — NOT nav+list+card

---

### Fleet / Dispatch (Mar 16, 2026)
**Product designed:** (planned — not yet built)

**Competitors studied:** Samsara, Routific, DispatchTrack, Verizon Connect, Onfleet, Fleetio

**Skeleton derived:** Map + Context Panel with Gantt timeline below

**Key domain terms:** HOS, ELD, detention time, POD, geofencing, deadhead miles, DVIR, IFTA

---

## Anti-Patterns (What We've Learned to Avoid)

| Anti-pattern | What happened | Correct approach |
|---|---|---|
| Aesthetic-first design | Running + logistics screens looked identical — same nav+list skeleton, different palette | Domain research first → derive skeleton from actor workflows |
| Pattern-matching on keywords | "Agent control panel" → built project management UI | Research the actual domain (contact center) before pattern-matching |
| Competitor screenshots without structure analysis | Saw "nice" interfaces, copied visual style | Document the skeleton, not just the visual. What's above the fold? What's the primary object? |
| Generic dashboard for specialized domain | Dashboard grid for a fleet dispatcher | Dispatcher's primary anxiety is real-time exception triage, not KPI review. Map + exception queue, not chart widgets |
| Skipping PRD | Built screens without clear P0 use cases | PRD first. Every screen must trace back to a named use case |
