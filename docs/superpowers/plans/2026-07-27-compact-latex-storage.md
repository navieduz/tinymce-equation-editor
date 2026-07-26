# Compact LaTeX Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow TinyMCE content to persist equations as compact LaTeX tokens and lazily migrate old MathLive markup when edited and saved.

**Architecture:** Keep MathLive markup as a runtime-only representation in TinyMCE. A focused transformer converts between runtime `.mq-math-mode[data-latex]` elements and persisted `.equation-latex[data-latex]` tokens. The plugin calls that transformer in TinyMCE content lifecycle events when `equation_editor_storage_format` is `latex-html`; a required host callback supplies the MathLive renderer for hydration.

**Tech Stack:** TypeScript 3.1, TinyMCE 5/6 plugin APIs, browser DOM APIs, MathLive 0.96.2 renderer supplied by the host, Bedrock/Agar/McAgar browser tests, TSLint, Grunt.

## Global Constraints

- Persisted equation token: `<span class="equation-latex" data-latex="..."></span>`.
- Runtime equation token: `<span class="mq-math-mode" data-latex="...">{renderer output}</span>` with `contenteditable="false"`.
- `data-latex` is the only canonical equation value; never infer LaTeX from MathLive markup.
- Preserve LaTeX byte-for-byte, including valid `\\` line breaks; do not normalize backslashes.
- Never mutate the live editor DOM while serializing content for storage.
- `mathlive-html` remains the default and preserves today’s output; `latex-html` is opt-in.
- `latex-html` requires `equation_editor_config.render_latex(latex)` and must fail setup with a descriptive error if absent.
- Do not touch the existing user change in `.vscode/settings.json`.

---

## File structure

- Create `src/main/ts/EquationContentTransformer.ts`: pure browser-DOM conversions between compact and runtime equation elements.
- Modify `src/main/ts/Plugin.ts`: expose the storage option, validate the renderer hook, and bind TinyMCE load/save lifecycle events.
- Create `src/test/ts/browser/EquationContentTransformerTest.ts`: direct conversion regression tests, including special LaTeX characters and multiline formulas.
- Modify `src/test/ts/browser/PluginTest.ts`: browser integration tests for compact load/save, lazy migration, and legacy output mode.
- Modify `src/demo/ts/Demo.ts`, `src/demo/html/index.html`, and `src/demo/html/v6.html`: demonstrate `latex-html` with MathLive loaded in the TinyMCE parent page.
- Modify `README.md`: document persisted format, hook setup, compatibility, and lazy migration behavior.

### Task 1: Implement and test the content transformer

**Files:**
- Create: `src/main/ts/EquationContentTransformer.ts`
- Create: `src/test/ts/browser/EquationContentTransformerTest.ts`

**Interfaces:**
- Produces `LatexRenderer = (latex: string) => string`.
- Produces `toStoredEquationContent(content: string): string`.
- Produces `toRuntimeEquationContent(content: string, renderLatex: LatexRenderer): string`.
- Task 2 consumes all three exports.

- [ ] **Step 1: Write failing transformer tests**

Create `src/test/ts/browser/EquationContentTransformerTest.ts` using Bedrock `UnitTest` and Chai `expect`. Cover these exact cases:

```ts
expect(toStoredEquationContent(
    '<p>A <span class="mq-math-mode" data-latex="y^x"><var>y</var></span> B</p>'
)).to.equal(
    '<p>A <span class="equation-latex" data-latex="y^x"></span> B</p>'
);

expect(toRuntimeEquationContent(
    '<p><span class="equation-latex" data-latex="\\\\frac{a}{b}"></span></p>',
    (latex) => '<span class="rendered">' + latex + '</span>'
)).to.equal(
    '<p><span class="mq-math-mode" data-latex="\\\\frac{a}{b}" contenteditable="false"><span class="rendered">\\\\frac{a}{b}</span></span></p>'
);
```

Add a round-trip fixture containing `\\begin{cases}x &amp; y \\\\ z\\end{cases}` and an unrelated `<a href="/lesson">link</a>`; assert the `data-latex` value and link survive runtime-to-stored conversion unchanged. Add a test where a `.mq-math-mode` span has no `data-latex` and assert it is unchanged.

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
npm test
```

Expected: test compilation fails because `EquationContentTransformer` does not exist.

- [ ] **Step 3: Implement the smallest DOM transformer**

Create `src/main/ts/EquationContentTransformer.ts` with this public shape:

```ts
export type LatexRenderer = (latex: string) => string;

export const toStoredEquationContent = (content: string): string => { /* ... */ };
export const toRuntimeEquationContent = (
    content: string,
    renderLatex: LatexRenderer
): string => { /* ... */ };
```

Use `document.implementation.createHTMLDocument('equation-content')`, assign only the supplied HTML to `document.body.innerHTML`, then query inside that detached body. In `toStoredEquationContent`, replace each `span.mq-math-mode[data-latex]` having a non-empty `dataset.latex` with a newly created `span` whose `className` is `equation-latex` and whose `dataset.latex` is copied from the source. Do not copy child nodes. For a missing/empty value, retain the original node and call `console.warn('Unable to compact equation without data-latex')`.

In `toRuntimeEquationContent`, replace each `span.equation-latex[data-latex]` with a newly created `.mq-math-mode` span, copy `dataset.latex`, set `contentEditable = 'false'`, then assign renderer output to `innerHTML`. If the renderer throws, retain the same runtime span but set `textContent` to its LaTeX and call `console.warn('Unable to render equation LaTeX', error)`; this keeps it visible, clickable, and recoverable. Return the detached body’s `innerHTML` in both functions.

- [ ] **Step 4: Run the transformer tests to verify they pass**

Run:

```bash
npm test
```

Expected: all existing browser tests and `EquationContentTransformerTest` pass.

- [ ] **Step 5: Commit the isolated transformer**

```bash
git add src/main/ts/EquationContentTransformer.ts src/test/ts/browser/EquationContentTransformerTest.ts
git commit -m "feat: add compact equation content transformer"
```

### Task 2: Wire compact storage into TinyMCE and test lazy migration

**Files:**
- Modify: `src/main/ts/Plugin.ts:11-26, 28-751, 764-835, 884-903`
- Modify: `src/test/ts/browser/PluginTest.ts:1-43`

**Interfaces:**
- Consumes `LatexRenderer`, `toStoredEquationContent`, and `toRuntimeEquationContent` from Task 1.
- Adds top-level TinyMCE option `equation_editor_storage_format: 'mathlive-html' | 'latex-html'`.
- Adds `equation_editor_config.render_latex?: LatexRenderer`.
- Produces compact save/load behavior only when the option is `latex-html`.

- [ ] **Step 1: Write failing TinyMCE integration tests**

Extend `PluginTest.ts` with a second `TinyLoader.setup` configured as follows:

```ts
equation_editor_storage_format: 'latex-html',
equation_editor_config: {
    render_latex: (latex) => '<span class="fixture-render">' + latex + '</span>',
},
```

Inside its test sequence, call `editor.setContent('<p><span class="equation-latex" data-latex="y^x"></span></p>')`, then assert:

```ts
expect(editor.getBody().querySelector('.mq-math-mode')).not.to.equal(null);
expect(editor.getContent()).to.equal(
    '<p><span class="equation-latex" data-latex="y^x"></span></p>'
);
```

Add a second assertion that setting the old rendered form
`<span class="mq-math-mode" data-latex="y^x"><var>y</var></span>` produces the compact token on `editor.getContent()`; this is the lazy-migration regression. Retain the existing loader without the new option and assert it still returns the legacy rendered span after `equation-insert`.

- [ ] **Step 2: Run the browser suite to verify it fails**

Run:

```bash
npm test
```

Expected: compact-token assertions fail because no lifecycle conversion is registered.

- [ ] **Step 3: Add configuration validation and lifecycle hooks**

In `Plugin.ts`:

1. Import the three Task 1 exports.
2. Extend `EditorSettings` with `render_latex?: LatexRenderer`.
3. On TinyMCE 6, register `equation_editor_storage_format` with `processor: 'string'` and `default: 'mathlive-html'` next to the existing option registration.
4. Add `getStorageFormat(editor): 'mathlive-html' | 'latex-html'`, reading `getSettings(editor, 'equation_editor_storage_format')`, defaulting to `mathlive-html`, and throwing `"'equation_editor_storage_format' must be 'mathlive-html' or 'latex-html'"` for any other value.
5. In `getEditorSettings()`, accept `render_latex` only when it is `undefined` or a function; otherwise throw `"'render_latex' property must be a function in equation_editor_config"`.
6. Immediately after reading settings in `setup()`, throw `"'render_latex' property is required when equation_editor_storage_format is 'latex-html'"` if compact mode has no renderer.
7. Register these handlers before commands are added:

```ts
editor.on('BeforeSetContent', (event) => {
    if (storageFormat === 'latex-html') {
        event.content = toRuntimeEquationContent(event.content, editorSettings.render_latex as LatexRenderer);
    }
});

editor.on('GetContent', (event) => {
    if (storageFormat === 'latex-html') {
        event.content = toStoredEquationContent(event.content);
    }
});

editor.on('SetContent', () => {
    setOnClickEquationContent(editor);
});
```

The `GetContent` transformer must modify only the event serialization string; it must not inspect or replace nodes in `editor.getBody()`.

- [ ] **Step 4: Run integration tests and static checks**

Run:

```bash
npm test && npm run lint && npm run build
```

Expected: all three commands exit 0. The existing test proves default output is unchanged; new tests prove compact hydration and lazy migration.

- [ ] **Step 5: Commit plugin integration**

```bash
git add src/main/ts/Plugin.ts src/test/ts/browser/PluginTest.ts
git commit -m "feat: support compact latex equation storage"
```

### Task 3: Make the demo and public configuration contract usable

**Files:**
- Modify: `src/demo/html/index.html:8-10`
- Modify: `src/demo/html/v6.html:8-10`
- Modify: `src/demo/ts/Demo.ts:10-30`
- Modify: `README.md`

**Interfaces:**
- Consumes `equation_editor_storage_format: 'latex-html'` and `equation_editor_config.render_latex` from Task 2.
- Produces a demo that loads MathLive in the parent TinyMCE page and documents the application integration contract.

- [ ] **Step 1: Document the expected demo behavior before changing it**

Add to `README.md` an acceptance example showing that the host must load MathLive before its compiled demo/plugin script, configure:

```ts
equation_editor_storage_format: 'latex-html',
equation_editor_config: {
    render_latex: (latex) => (window as any).MathLive.convertLatexToMarkup(latex),
}
```

State the exact stored output and that an old `.mq-math-mode[data-latex]` record is compacted on its next successful save. State that consumers rendering content outside TinyMCE must render `.equation-latex[data-latex]` themselves.

- [ ] **Step 2: Build the demo to establish the current failure**

Run:

```bash
npm run build
```

Expected: exit 0 before the change; this establishes the baseline build command. Manual check: the current parent demo page has no MathLive script and therefore cannot provide `render_latex`.

- [ ] **Step 3: Configure the parent-page MathLive renderer in the demo**

Add the MathLive 0.96.2 script before `scratch/compiled/demo.js` in both `src/demo/html/index.html` and `src/demo/html/v6.html`:

```html
<script src="https://unpkg.com/mathlive@0.96.2/dist/mathlive.min.js"></script>
```

In `Demo.ts`, configure the plugin with `equation_editor_storage_format: 'latex-html'` and:

```ts
render_latex: (latex) => (window as any).MathLive.convertLatexToMarkup(latex),
```

Keep existing `mathlive_config` intact. Do not add MathLive as an npm dependency: this release keeps the existing CDN/version model and explicitly requires the host-provided renderer.

- [ ] **Step 4: Verify build, tests, and the manual round trip**

Run:

```bash
npm test && npm run lint && npm run build
```

Expected: all commands exit 0. Then run `npm start`, open `src/demo/html/index.html`, insert `y^x`, retrieve editor content from the browser console, and verify it is a compact `equation-latex` span. Reload that value into the editor and verify it is visibly rendered and opens the equation dialog on click.

- [ ] **Step 5: Commit documentation and demo integration**

```bash
git add README.md src/demo/ts/Demo.ts src/demo/html/index.html src/demo/html/v6.html
git commit -m "docs: explain compact latex equation storage"
```

## Final verification and delivery

- [ ] Confirm `git status --short` contains no changes from these tasks and preserves any pre-existing `.vscode/settings.json` change.
- [ ] Run `npm test && npm run lint && npm run build` once more after the final commit.
- [ ] Verify the committed diff only contains the transformer, plugin, tests, demo, and README changes described above.
- [ ] In the release notes, mark `latex-html` as opt-in and list the host requirement to provide `render_latex`.
