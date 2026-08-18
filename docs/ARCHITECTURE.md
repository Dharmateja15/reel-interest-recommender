# Reel Interest Recommender — Architecture Source of Truth v2.0

## 1. Project Concept
An AI-powered recommendation agent that analyzes a student's recent Reel interaction history, performs semantic abstraction from surface topic → context/intent → broader underlying interest, evaluates trusted technology Reel candidates, filters low-value/hype content through reasoning, and recommends one useful technology Reel.

---

## 2. Core Constraints & Guarantees
* **Minimum Abstractive Leap:** Keep helper abstractions minimal; focus on single-purpose functions instead of frameworks.
* **No Unnecessary Infrastructure:** No external database, vector stores, or heavy state managers. Use local files and structured in-memory helpers.
* **LLM Input Separation:** The LLM receives trusted candidate IDs and metadata but must *never* invent titles, descriptions, categories, or difficulties.
* **Strict Post-LLM Validation:** All LLM outputs must be parsed, validated via Zod, checked for consistency, and resolved against the local candidate library.
* **Deterministic Fallback:** A simple, deterministic keyword category tally fallback that runs when the AI is unavailable or produces invalid/inconsistent outputs.

---

## 3. Execution Pipeline & Flows

### A. The End-to-End System Flow
```text
┌─────────────────────────────┐
│        User opens app       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Select demo history         │
│ + current Reel              │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Analyze My Interests        │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ POST /api/recommend         │
│ history + currentReelId     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Validate request             │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Build AI prompt              │
│                              │
│ Surface → Context → Interest │
│ → Confidence → Candidate     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ One LLM call                 │
└──────────────┬──────────────┘
               ↓
        ┌──────┴──────┐
        │             │
      Valid         Failure
        │             │
        ↓             ↓
   Zod validate   Fallback
        │             │
        ↓             ↓
 Consistency      source=fallback
 check                │
        │             │
        ↓             │
Candidate ID           │
validation             │
        │             │
        └──────┬───────┘
               ↓
┌─────────────────────────────┐
│ Structured recommendation   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ UI renders:                 │
│ Current Reel                │
│ Interest                    │
│ Why                         │
│ Recommended Reel            │
│ Category                    │
│ Why recommendation          │
│ Difficulty                  │
│ Confidence                  │
└─────────────────────────────┘
```

### B. AI Reasoning Pipeline
The LLM prompt must guide the model through this single logical reasoning pipeline:
1. **History:** Analyze the user's past Reel interactions.
2. **Surface Topic:** Extract the immediate topic of each Reel.
3. **Context / Intent:** Infer why the user interacted with it (e.g., career development, hobby project, curiosity).
4. **Cross-Reel Pattern:** Identify recurring themes or connections across history.
5. **Broader Underlying Interest:** Synthesize the core underlying interest of the user.
6. **Confidence:** Assess confidence in the detected interest (e.g., "High", "Medium", "Low", or "Insufficient technology signal").
7. **Candidate Evaluation:** Score and comment on the tech Reel candidates based on the inferred interest.
8. **Anti-Hype Evaluation:** Filter out candidates that are low-value or hype-heavy.
9. **Candidate Selection:** Recommend exactly one candidate ID.

### C. Deterministic Fallback Flow
If the AI pipeline fails, times out, or produces inconsistent results:
1. Trigger `resolveFallback()`.
2. Inspect `fallback-keyword-map.ts`.
3. Tally categories from the interaction history.
4. If there is a clear plurality:
   * Select a candidate matching the plurality category from the trusted library.
5. If there is no clear plurality:
   * Return an "insufficient signal" fallback state.
6. Set the response recommendation `source = "fallback"`.

---

## 4. Architectural Boundaries

### A. Data Layer (Data Ownership)
* **`data/history-sets.ts`**: Fictional/anonymized interaction histories and current Reel IDs for each scenario.
* **`data/candidates.ts`**: The trusted library of technology Reel candidates (titles, descriptions, difficulties, categories).
* **`data/fallback-keyword-map.ts`**: Mappings for fallback keyword/category lookups.

### B. Reasoning & prompt logic
* **`lib/prompt.ts`**: Custom prompt assembly. Combines interaction history and candidate metadata. Owns the prompt template outlining the 9-stage reasoning pipeline.
* **`lib/consistencyCheck.ts`**: Minimal post-hoc validation rules to verify the LLM output makes logical sense. For example, if interest is "Insufficient technology signal", confidence cannot be "High" with a non-null candidate recommended.
* **`lib/fallback.ts`**: Deterministic fallback engine logic. Contains zero AI, LLM, or embedding calls.

### C. Orchestration
* **`app/api/recommend/route.ts`**: The sole API endpoint. Responsible for input validation, current Reel title resolution, Prompt construction, calling the LLM, output validation, consistency check, candidate resolution, and error/fallback recovery.

### D. User Interface
* **`app/page.tsx`**: The Single-Page App containing:
  * Scenario selection dropdowns.
  * Rendered current Reel and interaction history.
  * Analyze trigger.
  * Visual displays for result, confidence level, recommended candidate metadata, and fallback indicators.
