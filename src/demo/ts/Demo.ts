import Plugin from '../../main/ts/Plugin';

declare let tinymce: any;

Plugin();

init('textarea.tinymce', false);
init('div.inline', true);

function init(selector, inline: boolean) {
    tinymce.init({
        selector,
        inline,
        // verify_html: false,
        extended_valid_elements: 'span[class|style|data-atom-id]',
        plugins: 'code equation-editor',
        toolbar: 'equation-editor',
        content_css: [
            'https://unpkg.com/mathlive@0.96.2/dist/mathlive-static.css',
            'https://unpkg.com/mathlive@0.96.2/dist/mathlive-fonts.css'
        ],
        equation_editor_group: 'advanced',
        equation_editor_storage_format: 'latex-html',
        equation_editor_config: {
            render_latex: (latex) => (window as any).MathLive.convertLatexToMarkup(latex),
            mathlive_config: {
                smartMode: true,
            },
        },

    });
}
