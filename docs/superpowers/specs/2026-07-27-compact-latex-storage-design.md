# Compact LaTeX storage for equations

## Decision

Persist every equation as a compact semantic HTML node containing LaTeX, not
MathLive's rendered DOM. MathLive markup exists only in TinyMCE while the user
edits content.

This schema is for local development and replaces the earlier
`.equation-latex[data-latex]` token. There is no reader for that token or
database migration. A separate load-time fallback rehydrates legacy rendered
`.mq-math-mode[data-latex]` records because their MathLive child markup may be
incompatible with the current renderer.

## Persisted contract

Each saved equation is exactly one empty `span`:

```html
<span data-math="latex" data-display="inline" data-latex="\\frac{a}{b}"></span>
```

`data-math="latex"` identifies the node type. `data-latex` is the canonical
equation value. `data-display` is required in newly serialized content and is
either `inline` or `block`.

```html
<span data-math="latex" data-display="block" data-latex="\\int_0^1 x^2\\,dx"></span>
```

The token has no MathLive child markup and does not depend on a particular
MathLive rendering version. The surrounding rich HTML is preserved unchanged.
There is intentionally no schema version attribute: changing the renderer or
CSS is not a persisted-data breaking change. Add a separate version attribute
only if the stored contract itself becomes incompatible.

## Runtime flow

### Load into TinyMCE

Before content enters TinyMCE, replace either
`span[data-math="latex"][data-latex]` or legacy
`span.mq-math-mode[data-latex]` with a freshly rendered runtime node:

```html
<span class="mq-math-mode" data-latex="..." data-display="inline|block">{MathLive markup}</span>
```

The `render_latex(latex)` hook produces the child markup. For legacy runtime
records, discard the entire old MathLive child tree and render from
`data-latex`; never reuse the old markup. The application normally implements
the hook with `MathLive.convertLatexToMarkup(latex)` after loading MathLive in
the TinyMCE parent page. If rendering fails, retain the runtime node and show
the LaTeX text as a fallback.

The runtime node remains non-editable and clickable. Its `data-display` value
is normalized to `inline` unless the stored node explicitly specifies `block`.

### Save from TinyMCE

When TinyMCE serializes HTML in `latex-html` mode, replace each runtime
`span.mq-math-mode[data-latex]` with the persisted node. Copy `data-latex` and
emit `data-display="block"` only for a runtime block equation; otherwise emit
`data-display="inline"`.

Serialization operates on TinyMCE's output string, never the live editor DOM.
An equation without non-empty `data-latex` remains unchanged and logs a warning
instead of losing content.

### Editing behavior

New equations default to `data-display="inline"`. When an existing equation is
opened in the dialog, its runtime `data-display` is passed through the dialog
and back to insertion so an unchanged block equation remains block after
pressing Insert.

## Compatibility and API

- `equation_editor_storage_format: 'mathlive-html'` keeps rendered MathLive
  HTML as the output and remains the default.
- `equation_editor_storage_format: 'latex-html'` enables the compact schema.
- `equation_editor_config.render_latex: (latex: string) => string` is required
  in `latex-html` mode and hydrates persisted math nodes before editing.
- The plugin does not hydrate `.equation-latex[data-latex]`; callers must
  convert old local fixtures themselves if they still need them.
- Legacy `.mq-math-mode[data-latex]` content is accepted only as a renderer
  fallback. The next `getContent()` or save serializes it as the new persisted
  schema.

## Safety and validation

- Construct persisted nodes with DOM APIs; do not interpolate unescaped LaTeX
  into HTML attributes.
- Preserve LaTeX bytes, including valid `\\` line breaks and `cases` content.
- Consumers outside TinyMCE render `[data-math="latex"][data-latex]` and use
  `data-display` to choose inline or block layout.
- Server-side sanitization must allow only `data-math="latex"`,
  `data-display="inline|block"`, and an appropriately bounded `data-latex`
  value for math nodes.

## Verification

Browser tests must prove:

1. Saving a runtime equation produces the exact compact node with
   `data-math`, `data-display`, and `data-latex`.
2. A compact inline or block node hydrates into a clickable runtime MathLive
   node and keeps its display mode through save.
3. An existing block equation remains `block` after opening the dialog and
   pressing Insert without edits.
4. Text, links, and non-equation HTML remain unchanged by conversion.
5. Special LaTeX characters and multiline formulas preserve their exact
   `data-latex` bytes.
6. Legacy `.mq-math-mode[data-latex]` markup is discarded and re-rendered from
   its LaTeX before being saved as the new schema.
7. `mathlive-html` remains covered by its existing output assertion.

## Out of scope

- Bulk database migration or compatibility parsing for `.equation-latex`.
- Rendering compact nodes outside TinyMCE.
- A UI control for users to select inline versus block mode.
- Converting full rich-text documents into delimiter-based LaTeX or Markdown.
