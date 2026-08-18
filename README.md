# Reel Interest Recommender

An AI-powered recommendation system that analyzes a student's recent short-form video interaction history, performs abstractive semantic interest inference, filters low-value/hype content, and recommends substantive technical educational Reels.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-Runtime%20Validation-purple)](https://zod.dev/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-success)](https://reel-interest-recommender.vercel.app)

---

## 🔗 Quick Links
* **Live Demo**: [https://reel-interest-recommender.vercel.app](https://reel-interest-recommender.vercel.app)
* **GitHub Repository**: [https://github.com/Dharmateja15/reel-interest-recommender](https://github.com/Dharmateja15/reel-interest-recommender)

---

## 1. Problem Statement
Traditional recommendation engines on short-form video platforms (such as Instagram Reels or TikTok) heavily rely on superficial keyword matching or immediate engagement loops. If a student watches a funny Java programming meme or a laptop review, naive algorithms often flood their feed with more Java memes or generic lifestyle videos (`Java → Java`). 

This approach fails to recognize the user's broader underlying technical trajectory. A student watching a sequence of Java memes, software developer vlogs, and laptop setup comparisons is often expressing a broader interest in **Software Engineering and System Architecture**, rather than a specific desire for JVM syntax memes.

**Reel Interest Recommender** addresses this by performing multi-stage semantic abstraction:
1. Moving from **Surface Topic** (e.g. Java GC meme) → **Context/Intent** (career anxiety, setup research) → **Cross-Reel Pattern** → **Broader Underlying Interest** (Software Engineering).
2. Evaluating trusted technical candidate Reels against the inferred interest.
3. Actively filtering out low-value, clickbaity "hype" content (e.g. *"Earn $500/day with 10 secret AI tools"*).
4. Recommending a substantive, high-value technical Reel (e.g., *Distributed System Rate Limiting* or *Virtual Threads*).

---

## 2. Solution Overview
The application is a Single-Page App (SPA) dashboard backed by a server-side Next.js orchestration API route. Users can select from various pre-configured interaction history profiles and choose a specific "Current Reel" context.

Upon clicking **Analyze My Interests**:
* The server resolves the trusted history profile and current Reel context.
* A single, structured prompt guides the Google Gemini LLM through a 9-stage reasoning pipeline.
* The response is validated at runtime using **Zod** schemas, checked for logical consistency, and enforced against a closed library of candidate Reels.
* If the AI service is unavailable or returns an invalid structure, a **deterministic word-boundary plurality fallback engine** handles recommendation safely without crashing.
* The UI renders a structured result card showing the inferred interest, cross-reel context reasoning, recommended Reel, difficulty, candidate category, anti-hype score, and confidence level.

---

## 3. Key Features
* **Semantic Interest Abstraction:** Extracts underlying learning goals from sequences of interaction Reels rather than repeating single-video topics.
* **Server-Resolved Scenarios:** Protects data integrity by accepting server-controlled scenario identifiers (`historyId`, `currentReelId`) rather than untrusted client payload strings.
* **Structured Reasoning Pipeline:** Executes a 9-stage abstractive pipeline inside one prompt call (Surface Topic → Context → Pattern → Inferred Interest → Confidence → Evaluation → Anti-Hype Filter → Selection).
* **Strict Runtime Zod Schema Validation:** Parses and validates LLM JSON outputs at runtime to guarantee type safety and enum adherence.
* **Closed Union Taxonomy & Candidate Enforcement:** Ensures all recommended Reels resolve strictly to existing candidates in a closed library (`data/candidates.ts`).
* **Anti-Hype Filtering:** Active filtering during candidate selection prevents high-hype clickbait from being recommended, regardless of surface topic alignment.
* **Deterministic Plurality Fallback Engine:** Features a non-AI, zero-dependency keyword tally fallback with regex word-boundary matching (`\b`) that executes if the LLM is unreachable.
* **No-Signal Detection:** Appropriately identifies non-technical histories (e.g., cooking or animal videos) and returns `Insufficient technology signal` with `confidence: "Low"` and no forced candidate.
* **Single-Retry Recovery Contract:** Executes at most one retry prompt if the initial LLM response fails validation or consistency rules before falling back safely.
* **Responsive Dark-Mode Dashboard:** Modern, reactive dashboard built with Tailwind CSS.

---

## 4. How It Works (Architecture Flow)

```text
┌─────────────────────────────────────────┐
│        User Selects Scenario Profile    │
│            & Current Reel in UI         │
└────────────────────┬────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│         POST /api/recommend             │
│    Payload: { historyId, currentReelId }│
└────────────────────┬────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│   Server Resolves Trusted History Set   │
│        (data/history-sets.ts)           │
└────────────────────┬────────────────────┘
                     ↓
         Is GEMINI_API_KEY Set?
            /                \
          YES                 NO
          /                    \
┌───────────────────────┐  ┌───────────────────────────┐
│  Build Prompt & Query │  │ Trigger Deterministic     │
│   Gemini REST API     │  │ Plurality Fallback        │
└──────────┬────────────┘  └─────────────┬─────────────┘
           ↓                             │
┌───────────────────────┐                │
│ Parse JSON & Validate │                │
│ via Zod Schema        │                │
└──────────┬────────────┘                │
           ↓                             │
┌───────────────────────┐                │
│ Consistency Check &   │                │
│ Candidate Verification│                │
└──────────┬────────────┘                │
     Valid?│                             │
    /      \ INVALID                     │
  YES      Retry (Max 1)                 │
  /          \ Failed                    │
 ↙            ↘                          │
┌──────────────┴─────────────────────────┴┐
│    Return Structured Recommendation     │
│  (source: "ai"  OR  source: "fallback") │
└────────────────────┬────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│   UI Displays Result Card & Badges      │
└─────────────────────────────────────────┘
```

---

## 5. Demonstration Dataset & Scenarios

The MVP uses a controlled, static, typed demonstration dataset stored locally in `data/`:

* **`data/history-sets.ts`**: Contains 8 predefined interaction profiles:
  1. **AI Cluster Scenario**: High concentration of machine learning, transformer, and prompt engineering tutorials. *(Default Landing Scenario)*
  2. **Hardware Cluster Scenario**: Assembly programming, CPU cache hierarchy, and logic gate videos.
  3. **Single Strong Signal Scenario**: Focused Cloud/DevOps tutorials (Docker multi-stage builds, Kubernetes).
  4. **Weak Single Signal Scenario**: Desk setup tour mixed with gaming compilation memes.
  5. **Ambiguous Scenario**: Cooking recipes and kitten videos mixed with a single DSA video.
  6. **No Tech Signal Scenario**: Non-technical videos (stretching, sourdough baking, dog memes).
  7. **SWE Trap Scenario (Java GC current)**: Java meme + SWE lifestyle + laptop setup. Current Reel is Java GC. Tests if JVM interest dominates or broad SWE interest is inferred.
  8. **SWE Trap Scenario (MacBook current)**: Same history, with current Reel set to laptop comparison. Tests broad SWE interest extraction.

* **`data/candidates.ts`**: Trusted library of 18 technology Reel candidates distributed across approved categories (`AI`, `DSA`, `Java`, `HLD`, `Cybersecurity`, `Cloud`, `Hardware`, `Career`, `Other`), difficulties (`Beginner`, `Intermediate`, `Advanced`), and hype risks (`Low`, `Medium`, `High`). Includes a high-hype candidate (*"10 AI Tools That Will Get You a Job"*) to test anti-hype rejection.

* **`data/fallback-keyword-map.ts`**: Maps technical keyword triggers to categories for deterministic fallback processing.

---

## 6. Safety & Reliability Guarantees

* **Closed Union Types:** Category (`AI | DSA | Java | HLD | Cybersecurity | Cloud | Hardware | Career | Other`), Difficulty (`Beginner | Intermediate | Advanced`), Confidence (`High | Medium | Low | Insufficient technology signal`), and Source (`ai | fallback`) are strictly typed.
* **Server-Side Validation:** The API route verifies that `recommendedCandidateId` exists in `data/candidates.ts`. The LLM returns ONLY a candidate ID, never free-form recommendation metadata.
* **Anti-Hype Selection Guard:** High-hype candidates (`hypeRisk: 'High'`) are filtered out during reasoning and cannot be recommended regardless of suitability.
* **Logical Consistency Checker:** Post-hoc validation rule catches contradictions (e.g. `confidence: "High"` paired with `interestDetected: "Insufficient technology signal"`).
* **Bounded Retries:** Exactly one retry is attempted if the LLM outputs malformed JSON or fails schema/consistency validation. If the second attempt fails, it immediately falls back to the deterministic engine.
* **Regex Word-Boundary Fallback:** Fallback category matching uses `\b` word boundaries to avoid false substring matches (e.g., preventing the word `"daily"` from triggering `"AI"`).

---

## 7. Technology Stack

* **Framework:** [Next.js 16.3.1](https://nextjs.org/) (App Router, Turbopack bundler)
* **Frontend Library:** [React 19.2.8](https://react.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Type System & Schema Validation:** [TypeScript 5](https://www.typescriptlang.org/) & [Zod 3.x](https://zod.dev/)
* **AI Orchestration:** Native server-side `fetch` to Google Gemini REST API (`gemini-1.5-flash`)
* **Deployment:** [Vercel Platform](https://vercel.com/)

---

## 8. Project Structure

```text
reel-interest-recommender/
├── app/
│   ├── api/
│   │   └── recommend/
│   │       └── route.ts         # Orchestration endpoint (validation, Gemini call, retry, fallback)
│   ├── globals.css              # Global styles & Tailwind directives
│   ├── layout.tsx               # Root layout wrapper
│   └── page.tsx                 # Single-Page Dashboard UI
├── data/
│   ├── candidates.ts            # Trusted candidate Reels library (18 items)
│   ├── fallback-keyword-map.ts  # Keyword-to-category trigger map
│   └── history-sets.ts          # Static scenario profiles (8 scenarios)
├── docs/
│   ├── ARCHITECTURE.md          # Architecture Source of Truth v2.0
│   └── IMPLEMENTATION-NOTES.md  # Implementation decisions & repository layout
├── lib/
│   ├── consistencyCheck.ts      # Post-hoc output consistency checker
│   ├── fallback.ts              # Deterministic plurality fallback engine
│   ├── prompt.ts                # Prompt builder & Zod output schemas
│   └── types.ts                 # Closed union domain models & interfaces
├── .gitignore                   # Excludes node_modules, build outputs, and .env.local
├── next.config.ts               # Next.js configuration
├── package.json                 # Manifest & dependencies
└── tsconfig.json                # TypeScript configuration
```

---

## 9. Local Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Dharmateja15/reel-interest-recommender.git
   cd reel-interest-recommender
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```
   *(Note: `.env.local` is ignored by Git and will never be committed).*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 10. Live Demo & Deployment

* **Live Application**: [https://reel-interest-recommender.vercel.app](https://reel-interest-recommender.vercel.app)
* **GitHub Repository**: [https://github.com/Dharmateja15/reel-interest-recommender](https://github.com/Dharmateja15/reel-interest-recommender)

*Note: In production environments, if `GEMINI_API_KEY` is not configured, the application automatically and gracefully routes all requests to the deterministic fallback engine (`source: "fallback"`), ensuring zero downtime or server crashes.*

---

## 11. Verification & Testing Highlights

* **Production Build Validation:** Verified using `npm run build` with Turbopack (Exit Code 0).
* **Deterministic Fallback Engine:** Tested with non-technical histories (`noTechSignalHistory`), accurately returning `interestDetected: "Insufficient technology signal"`, `confidence: "Low"`, `recommendedReel: null`, and `source: "fallback"`.
* **Word-Boundary Match Correction:** Verified that word boundary regexes (`\b`) prevent false substring triggers across history titles and descriptions.
* **Zod Schema & Retry Contract:** Tested with mock failure scripts (`scratch-test.ts`) confirming that invalid schema outputs trigger at most one retry before executing fallback.
* **Candidate Library Resolution:** Verified that recommended IDs must exist in `data/candidates.ts`.

---

## 12. Why This Approach?

In a hackathon or evaluation setting, AI recommendation agents often fail due to non-deterministic LLM behavior, API rate limits, or hallucinated candidate metadata. 

**Reel Interest Recommender** takes a production-grade approach to reliability:
1. **Metadata Security:** The LLM is given candidate IDs and descriptions, but is **never allowed to invent** candidate titles, categories, difficulties, or URLs. All metadata displayed in the UI is resolved server-side from `data/candidates.ts`.
2. **Graceful Fallback:** If the LLM service experiences latency, rate limiting, or structural failure, the deterministic fallback engine immediately responds with a calculated category recommendation, ensuring 100% demo uptime.

---

## 13. Limitations & MVP Scope

* **Controlled Static Dataset:** The current MVP uses a pre-defined set of 8 scenario histories and 18 candidate Reels rather than live user tracking.
* **Single-Page Scope:** Designed as an evaluation MVP focused on semantic reasoning accuracy and reliability rather than user auth or persistent databases.
* **LLM Dependency:** AI-driven reasoning requires a valid `GEMINI_API_KEY` configured in the server environment.

---

## 14. Future Scope

* **Real Interaction Tracking:** Integration with live user activity feeds (watch time, re-watch count, likes, shares).
* **Dynamic Candidate Indexing:** Vector indexing and embedding retrieval for catalogs with thousands of candidate Reels.
* **User Feedback Loops:** Explicit feedback buttons ("Not Interested", "Too Basic", "Too Advanced") to adaptively tune user interest profiles over time.
