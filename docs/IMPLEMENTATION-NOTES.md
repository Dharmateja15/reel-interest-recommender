# Reel Interest Recommender — Implementation Notes

## 1. Repository Layout & Relocation
* **Project Root:** All project configuration, code, and documents are rooted at `D:\Ai-Recommender\`.
* **Subdirectory Removal:** The nested `ai-recommender` subdirectory generated during the initial CLI run has been completely cleaned up.
* **Package Naming:** The npm package name is configured as `"ai-recommender"` (all lowercase) in `package.json` to satisfy npm naming constraints, while the Windows folder name remains `Ai-Recommender`.

---

## 2. Directory Structure Setup (Planned for Phase 1)
During implementation, the physical directory layout will be built around these paths:
* `docs/`: Holds architectural truth and implementation documentation.
* `app/`: Next.js App Router root folder.
  * `api/recommend/route.ts`: API router orchestrator.
  * `page.tsx`: Single-page app UI.
  * `layout.tsx`, `globals.css`: Base layouts and styling.
* `data/`: Contains static, typed, trusted data files.
  * `history-sets.ts`
  * `candidates.ts`
  * `fallback-keyword-map.ts`
* `lib/`: Contains simple, single-purpose functions.
  * `types.ts`
  * `prompt.ts`
  * `fallback.ts`
  * `consistencyCheck.ts`

---

## 3. Technology Stack & Packages
* **Next.js:** 16.3.1 (using App Router and Turbopack bundler)
* **React:** 19.2.8
* **Styling:** Tailwind CSS 4 (with postcss configuration)
* **TypeScript:** 5.x
* **Zod:** Recommended for post-LLM validation (to be installed in the next phase).

---

## 4. Verification Check
* **Scaffold Validity:** Checked by running `npm run build` at the root, which successfully compiled TypeScript and generated static assets without errors.
