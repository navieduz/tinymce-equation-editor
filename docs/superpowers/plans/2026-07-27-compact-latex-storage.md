# Compact LaTeX Storage Implementation Plan

> **Status:** Implemented on 2026-07-27. This document records the final
> schema and verification contract for follow-up work.

**Goal:** Persist equations as compact LaTeX nodes while rendering MathLive
markup only inside TinyMCE.

**Architecture:** `EquationContentTransformer` converts between runtime
`.mq-math-mode` spans and stored semantic math spans. `Plugin.ts` hydrates
stored content before TinyMCE loads it and compacts only HTML serialization in
`latex-html` mode. The editor dialog carries display mode from an existing
runtime node through reinsertion.

**Tech Stack:** TypeScript 3.9, Yarn 4.15, TinyMCE 5/6 plugin APIs, browser DOM
APIs, host-supplied MathLive renderer, Bedrock/Agar/McAgar browser tests,
TSLint, and Grunt.

## Global Constraints

- Persisted equation token:
  `<span data-math="latex" data-display="inline|block" data-latex="..."></span>`.
- Runtime equation token:
  `<span class="mq-math-mode" data-latex="..." data-display="inline|block">{renderer output}</span>`
  with `contenteditable="false"`.
- `data-latex` is canonical. Never infer LaTeX from MathLive child markup.
- Normalize absent or invalid display values to `inline`.
- Do not read or write `.equation-latex[data-latex]`; compatibility with that
  stored token is intentionally out of scope.
- Rehydrate legacy `.mq-math-mode[data-latex]` nodes from LaTeX, discarding
  their child MathLive DOM, then serialize them as the new token on save.
- Preserve LaTeX bytes and do not mutate TinyMCE's live DOM during output
  serialization.
- `latex-html` is opt-in and requires `render_latex`; `mathlive-html` remains
  the default.

---

## File structure

- `src/main/ts/EquationContentTransformer.ts`: DOM conversion, display-mode
  normalization, and legacy runtime rehydration.
- `src/main/ts/Plugin.ts`: TinyMCE lifecycle integration and dialog display
  propagation.
- `src/test/ts/browser/EquationContentTransformerTest.ts`: compact schema,
  fallback, special LaTeX, and block round-trip coverage.
- `src/test/ts/browser/EquationDialogTest.ts`: regression coverage for editing
  a second formula and preserving block mode.
- `src/test/ts/browser/PluginTest.ts`: compact-storage integration and runtime
  default-display assertions.
- `src/demo/ts/Demo.ts`: permits persisted math data attributes in TinyMCE.
- `README.md`: public schema and host-renderer contract.

## Completed Tasks

### Task 1: Replace the persisted token schema

**Files:**
- Modified: `src/main/ts/EquationContentTransformer.ts`
- Modified: `src/test/ts/browser/EquationContentTransformerTest.ts`

- [x] Replace runtime equations with a freshly created stored `span` carrying
  `data-math="latex"`, canonical `data-latex`, and normalized `data-display`.
- [x] Hydrate `span[data-math="latex"][data-latex]`; copy display mode to the
  `.mq-math-mode` runtime span.
- [x] Also accept a legacy `span.mq-math-mode[data-latex]`, discard its stale
  MathLive child markup, and create a fresh runtime span with `render_latex`.
- [x] Default missing display mode to `inline` and preserve `block` through a
  stored → runtime → stored round trip.
- [x] Retain malformed runtime nodes without `data-latex` and preserve renderer
  fallback behavior.

### Task 2: Preserve display mode in editor commands

**Files:**
- Modified: `src/main/ts/Plugin.ts`
- Modified: `src/test/ts/browser/EquationDialogTest.ts`
- Modified: `src/test/ts/browser/PluginTest.ts`

- [x] Insert new runtime equations with `data-display="inline"` by default.
- [x] Pass `data-display` from a clicked runtime node to `equation-window` and
  from dialog action to `equation-insert`.
- [x] Verify that opening formula A, then opening block formula B and pressing
  Insert without edits keeps B's LaTeX, rendered HTML, and `block` display.
- [x] Restrict compact serialization to TinyMCE HTML output so text and tree
  output formats remain untouched.

### Task 3: Align the demo and public contract

**Files:**
- Modified: `src/demo/ts/Demo.ts`
- Modified: `src/test/ts/browser/DemoContentPrinterTest.ts`
- Modified: `README.md`
- Modified: `dist/equation-editor/plugin.js`
- Modified: `dist/equation-editor/plugin.min.js`

- [x] Allow `data-math`, `data-display`, and `data-latex` in the demo's
  TinyMCE configuration.
- [x] Document the exact persisted inline schema, block value, host rendering
  responsibility, and lack of legacy-schema support.
- [x] Rebuild the distributable plugin bundle.

## Verification Record

- [x] `EquationContentTransformerTest.ts` passes for inline hydration,
  fallback rendering, special LaTeX, block round-trip, and legacy runtime
  rehydration.
- [x] `EquationDialogTest.ts` passes for cross-dialog HTML isolation and block
  display preservation.
- [x] `DemoContentPrinterTest.ts` passes with the new persisted node.
- [x] `npm run lint`, `tsc --noEmit`, and `npm run build` pass.
- [x] The legacy `browser.PluginTest` equation-insert assertion remains a
  Chrome 150 baseline failure; compact-storage assertions run before it and
  pass.

## Follow-up Boundaries

- Add a block/inline selection UI only if product requirements introduce it.
- Add `data-math-version` only for a future breaking persisted-schema change.
- If data must be migrated outside local development, define a separate
  explicit migration and compatibility policy rather than reintroducing the
  legacy parser implicitly.
