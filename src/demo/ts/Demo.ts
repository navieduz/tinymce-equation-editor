import Plugin from '../../main/ts/Plugin';
import { bindContentPrinter } from './DemoContentPrinter';

declare let tinymce: any;

Plugin();

init('textarea.tinymce', false, 'textarea-content-button', 'textarea-content-output');
init('div.inline', true, 'inline-content-button', 'inline-content-output');

function init(selector, inline: boolean, buttonId: string, outputId: string) {
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
        setup: (editor) => {
            editor.on('init', () => {
                const button = document.getElementById(buttonId) as HTMLButtonElement;
                const output = document.getElementById(outputId) as HTMLTextAreaElement;
                bindContentPrinter(editor, button, output);
            });
        },
    });
}
