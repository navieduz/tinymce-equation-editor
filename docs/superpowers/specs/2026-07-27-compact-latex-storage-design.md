# Delimited LaTeX storage for equations

## Decision

Persist equations as standard LaTeX delimiters embedded directly in rich-text
HTML. Do not persist renderer markup or a custom `data-*` math node.

```html
<p>Diện tích là \(S=\frac{1}{2}ah\).</p>
<p>\[\int_0^1 x^2\,dx=\frac{1}{3}\]</p>
```

`\(...\)` represents inline math. `\[...\]` represents block math. This is
the only persisted equation contract. The plugin does not read or migrate the
previous `data-math`, `.equation-latex`, or stored `.mq-math-mode` formats.

## Runtime flow

### Load into TinyMCE

Before content enters TinyMCE, parse delimiters only from HTML text nodes.
Replace each complete delimiter pair with a non-editable runtime span:

```html
<span class="mq-math-mode" data-latex="..." data-display="inline|block">{MathLive markup}</span>
```

Use `render_latex(latex)` to create the MathLive child markup. `\(` produces
`data-display="inline"`; `\[` produces `data-display="block"`.

The parser does not scan raw HTML, element attributes, or text inside `code`,
`pre`, `script`, or `style`. A delimiter without a matching closing delimiter
remains normal text. A delimiter pair must occur in one text node; it cannot
span HTML elements or block boundaries.

### Save from TinyMCE

When TinyMCE serializes HTML in `latex-html` mode, replace every runtime
`.mq-math-mode[data-latex]` with a text node. Emit `\[latex\]` if
`data-display` is `block`; otherwise emit `\(latex\)`.

Serialization operates on the output string's detached DOM and never mutates
the live editor DOM. A runtime span without a non-empty `data-latex` remains
unchanged and emits a warning.

## Compatibility and API

- `equation_editor_storage_format: 'mathlive-html'` retains rendered MathLive
  HTML and remains the default.
- `equation_editor_storage_format: 'latex-html'` enables delimited LaTeX
  storage.
- `equation_editor_config.render_latex: (latex: string) => string` is required
  in `latex-html` mode to hydrate delimiters before editing.
- External consumers render saved `\(...\)` and `\[...\]` with their chosen
  LaTeX renderer.

## Safety and validation

- Use DOM text nodes when serializing delimiters; do not interpolate LaTeX into
  raw HTML.
- Preserve LaTeX bytes, including valid `\\` line breaks and `cases` content.
- Treat delimiter parsing as content syntax only; do not parse attributes or
  code examples.
- Server-side sanitization must preserve backslashes and normal HTML escaping
  in text content.

## Verification

Browser tests must prove:

1. Runtime inline and block equations serialize exactly to `\(...\)` and
   `\[...\]`.
2. Delimited inline and block equations hydrate into clickable runtime spans
   with the correct display mode.
3. Text, links, special LaTeX characters, and multiline formulas round-trip
   unchanged.
4. Unclosed delimiters and delimiters in `code` remain literal text.
5. Renderer failure displays LaTeX fallback text without losing the equation.
6. `mathlive-html` remains covered by its existing output assertion.

## Out of scope

- Reading or migrating earlier `data-math`, `.equation-latex`, or stored
  MathLive markup formats.
- A bulk database migration.
- A block/inline selection UI.
- Converting full rich-text documents into standalone `.tex` files.
