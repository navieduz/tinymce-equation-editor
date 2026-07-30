import ButtonsTransformer, { ButtonConfig } from './ButtonsTransformer';
import {
    LatexRenderer,
    toRuntimeEquationContent,
    toStoredEquationContent,
} from './EquationContentTransformer';

declare const tinymce: any;
declare const document: any;

interface Group {
    name: string;
    buttons: Array<ButtonConfig>;
}

interface DataEquationWindow {
    latex?: string;
    display?: string;
    currentTarget?: string;
}

export interface EditorSettings {
    url: string;
    origin: string;
    title: string;
    space_after_content: string;
    btn_cancel_text: string;
    btn_ok_text: string;
    mathlive_config?: object;
    render_latex?: LatexRenderer;
    width?: number;
    height?: number;
}

const setup = (editor, url) => {
    if (editor.editorManager.majorVersion === '6') {
        editor.options.register('equation_editor_config', {
            processor: 'object',
        });
        editor.options.register('equation_editor_storage_format', {
            processor: 'string',
            default: 'latex-html',
        });
        editor.options.register('equation_editor_group', {
            processor: 'string',
            default: 'basic',
        });
        editor.options.register('equation_editor_button_bar', {
            processor: 'object',
        });
        editor.options.register('equation_editor_button_groups', {
            processor: 'object',
        });
    }
    const editorSettings: EditorSettings = getEditorSettings(editor);
    const storageFormat = getStorageFormat(editor);

    // Editor global params
    let groups = getSettings(editor, 'equation_editor_button_groups');
    let btnBar = getSettings(editor, 'equation_editor_button_bar');
    let groupName = getSettings(editor, 'equation_editor_group');

    if (typeof groupName === 'undefined') {
        groupName = 'basic';
    } else if (typeof groupName !== 'string') {
        throw new Error("'equation_editor_group' property must be a string");
    }

    if (typeof groups === 'undefined') {
        groups = {
            basic: [
                {
                    name: 'Số',
                    buttons: [
                        {
                            cmd: false,
                            text: '0',
                        },
                        {
                            cmd: false,
                            text: '1',
                        },
                        {
                            cmd: false,
                            text: '2',
                        },
                        {
                            cmd: false,
                            text: '3',
                        },
                        {
                            cmd: false,
                            text: '4',
                        },
                        {
                            cmd: false,
                            text: '5',
                        },
                        {
                            cmd: false,
                            text: '6',
                        },
                        {
                            cmd: false,
                            text: '7',
                        },
                        {
                            cmd: false,
                            text: '8',
                        },
                        {
                            cmd: false,
                            text: '9',
                        },
                        {
                            cmd: false,
                            text: ',',
                        },
                        {
                            cmd: false,
                            text: '.',
                        },
                        {
                            cmd: false,
                            text: '\\pi',
                        },
                        {
                            cmd: false,
                            text: 'i',
                        },
                        {
                            cmd: false,
                            text: 'e',
                        },
                        {
                            cmd: false,
                            text: '\\infty',
                        },
                    ],
                },
                {
                    name: 'Số học và Đơn vị',
                    buttons: [
                        {
                            cmd: false,
                            text: '+',
                        },
                        {
                            cmd: false,
                            text: '-',
                        },
                        {
                            cmd: false,
                            text: '\\times',
                        },
                        {
                            cmd: false,
                            text: '\\div',
                        },
                        {
                            cmd: true,
                            latex: '\\dfrac{\\placeholder{}}{\\placeholder{}}',
                            text: '\\dfrac{a}{b}',
                        },
                        {
                            cmd: false,
                            text: '\\pm',
                        },
                        {
                            cmd: true,
                            latex: '\\overline{\\placeholder{}}',
                            text: '\\overline{x}',
                        },
                        {
                            cmd: false,
                            text: '\\cdot',
                        },
                        {
                            cmd: true,
                            latex: '/',
                            text: '/',
                        },
                        {
                            cmd: false,
                            text: '$',
                        },
                        {
                            cmd: false,
                            text: '\\degree',
                        },
                        {
                            cmd: false,
                            text: '%',
                        },
                    ],
                },
            ],
            intermediate: [
                {
                    name: 'Lũy thừa, Căn, Logarit',
                    buttons: [
                        {
                            cmd: true,
                            latex: '\\placeholder{}^{\\placeholder{}}',
                            text: 'y^x',
                        },
                        {
                            cmd: true,
                            latex: '\\sqrt{\\placeholder{}}',
                            text: '\\sqrt{x}',
                        },
                        {
                            cmd: true,
                            latex: '\\sqrt[\\placeholder{3}]{\\placeholder{}}',
                            text: '\\sqrt[\\placeholder{3}]{\\placeholder{x}}',
                        },
                        {
                            cmd: true,
                            latex: '\\sqrt[\\placeholder{}]{\\placeholder{}}',
                            text: '\\sqrt[\\placeholder{n}]{\\placeholder{x}}',
                        },
                        {
                            cmd: true,
                            latex: 'e^{\\placeholder{}}',
                            text: 'e^x',
                        },
                        {
                            cmd: false,
                            text: '\\ln',
                        },
                        {
                            cmd: false,
                            text: '\\log',
                        },
                        {
                            cmd: true,
                            latex: '\\log_{\\placeholder{}}',
                            text: '\\log_b',
                        },
                    ],
                },
                {
                    name: 'Quan hệ',
                    buttons: [
                        {
                            cmd: false,
                            text: '=',
                        },
                        {
                            cmd: false,
                            text: '\\neq',
                        },
                        {
                            cmd: false,
                            text: '\\sim',
                        },
                        {
                            cmd: false,
                            text: '\\not\\sim',
                        },
                        {
                            cmd: false,
                            text: '\\lt',
                        },
                        {
                            cmd: false,
                            text: '\\gt',
                        },
                        {
                            cmd: false,
                            text: '\\approx',
                        },
                        {
                            cmd: false,
                            text: '\\not\\approx',
                        },
                        {
                            cmd: false,
                            text: '\\le',
                        },
                        {
                            cmd: false,
                            text: '\\ge',
                        },
                        {
                            cmd: false,
                            text: '\\simeq',
                        },
                        {
                            cmd: false,
                            text: '\\not\\simeq',
                        },
                        {
                            cmd: false,
                            text: '\\therefore',
                        },
                    ],
                },
                {
                    name: 'Hình học',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\rightarrow',
                        },
                        {
                            cmd: false,
                            text: '\\leftrightarrow',
                        },
                        {
                            cmd: true,
                            latex: '\\overline{\\placeholder{}}',
                            text: '\\overline{AB}',
                        },
                        {
                            cmd: true,
                            latex: '\\overarc{\\placeholder{}}',
                            text: '\\overarc{AB}',
                        },
                        {
                            cmd: false,
                            text: '\\parallel',
                        },
                        {
                            cmd: false,
                            text: '\\perp',
                        },
                        {
                            cmd: false,
                            text: '\\angle',
                        },
                        {
                            cmd: false,
                            text: 'm\\angle',
                        },
                        {
                            cmd: false,
                            text: '\\bigtriangleup',
                        },
                        {
                            cmd: false,
                            text: '▱',
                        },
                        {
                            cmd: false,
                            text: '\\bigodot',
                        },
                    ],
                },
                {
                    name: 'Dấu ngoặc',
                    buttons: [
                        {
                            cmd: true,
                            latex: '(\\placeholder{})',
                            text: '(\\cdot)',
                        },
                        {
                            cmd: true,
                            latex: '[\\placeholder{}]',
                            text: '[\\cdot]',
                        },
                        {
                            cmd: true,
                            latex: '\\left| \\placeholder{} \\right|',
                            text: '|\\cdot|',
                        },
                        {
                            cmd: true,
                            latex: '(\\placeholder{},\\placeholder{})',
                            text: '(x,y)',
                        },
                        {
                            cmd: true,
                            latex: '[\\placeholder{},\\placeholder{}]',
                            text: '[x,y]',
                        },
                        {
                            cmd: true,
                            latex: '(\\placeholder{},\\placeholder{}]',
                            text: '(x,y]',
                        },
                        {
                            cmd: true,
                            latex: '[\\placeholder{},\\placeholder{})',
                            text: '[x,y)',
                        },
                    ],
                },
            ],
            advanced: [
                {
                    name: 'Khoảng cách',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\,',
                        },
                        {
                            cmd: false,
                            text: '\\;',
                        },
                        {
                            cmd: false,
                            text: '\\:',
                        },
                        {
                            cmd: false,
                            text: '\\quad',
                        },
                        {
                            cmd: false,
                            text: '\\qquad',
                        },
                        {
                            cmd: true,
                            latex: '\\hspace{\\placeholder{1em}}',
                            text: '\\hspace{1em}',
                        },
                    ],
                },
                {
                    name: 'Số',
                    buttons: [
                        {
                            cmd: false,
                            text: '0',
                        },
                        {
                            cmd: false,
                            text: '1',
                        },
                        {
                            cmd: false,
                            text: '2',
                        },
                        {
                            cmd: false,
                            text: '3',
                        },
                        {
                            cmd: false,
                            text: '4',
                        },
                        {
                            cmd: false,
                            text: '5',
                        },
                        {
                            cmd: false,
                            text: '6',
                        },
                        {
                            cmd: false,
                            text: '7',
                        },
                        {
                            cmd: false,
                            text: '8',
                        },
                        {
                            cmd: false,
                            text: '9',
                        },
                        {
                            cmd: false,
                            text: ',',
                        },
                        {
                            cmd: false,
                            text: '.',
                        },
                        {
                            cmd: false,
                            text: '\\pi',
                        },
                        {
                            cmd: false,
                            text: 'i',
                        },
                        {
                            cmd: false,
                            text: 'e',
                        },
                        {
                            cmd: false,
                            text: '\\infty',
                        },
                    ],
                },
                {
                    name: 'Số học và Đơn vị',
                    buttons: [
                        {
                            cmd: false,
                            text: '+',
                        },
                        {
                            cmd: false,
                            text: '-',
                        },
                        {
                            cmd: false,
                            text: '\\times',
                        },
                        {
                            cmd: false,
                            text: '\\div',
                        },
                        {
                            cmd: true,
                            latex: '\\dfrac{\\placeholder{}}{\\placeholder{}}',
                            text: '\\dfrac{a}{b}',
                        },
                        {
                            cmd: false,
                            text: '\\pm',
                        },
                        {
                            cmd: true,
                            latex: '\\overline{\\placeholder{}}',
                            text: '\\overline{x}',
                        },
                        {
                            cmd: false,
                            text: '\\cdot',
                        },
                        {
                            cmd: true,
                            latex: '/',
                            text: '/',
                        },
                        {
                            cmd: false,
                            text: '$',
                        },
                        {
                            cmd: false,
                            text: '\\degree',
                        },
                        {
                            cmd: false,
                            text: '%',
                        },
                    ],
                },
                {
                    name: 'Lượng giác',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\sin',
                        },
                        {
                            cmd: false,
                            text: '\\sec',
                        },
                        {
                            cmd: false,
                            text: '\\sin^{-1}',
                        },
                        {
                            cmd: false,
                            text: '\\sec^{-1}',
                        },
                        {
                            cmd: false,
                            text: '\\cos',
                        },
                        {
                            cmd: false,
                            text: '\\csc',
                        },
                        {
                            cmd: false,
                            text: '\\cos^{-1}',
                        },
                        {
                            cmd: false,
                            text: '\\csc^{-1}',
                        },
                        {
                            cmd: false,
                            text: '\\tan',
                        },
                        {
                            cmd: false,
                            text: '\\cot',
                        },
                        {
                            cmd: false,
                            text: '\\tan^{-1}',
                        },
                        {
                            cmd: false,
                            text: '\\cot^{-1}',
                        },
                        {
                            cmd: false,
                            text: '\\arccos',
                        },
                        {
                            cmd: false,
                            text: '\\arctan',
                        },
                    ],
                },
                {
                    name: 'Thống kê',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\mu',
                        },
                        {
                            cmd: false,
                            text: '\\sigma',
                        },
                        {
                            cmd: true,
                            latex: '\\overline{\\placeholder{}}',
                            text: '\\overline{x}',
                        },
                        {
                            cmd: true,
                            latex: '\\overline{\\placeholder{}}',
                            text: '\\overline{y}',
                        },
                        {
                            cmd: true,
                            latex: '\\placeholder{}^{\\placeholder{}}',
                            text: 'x^i',
                        },
                        {
                            cmd: true,
                            latex: '\\placeholder{}_{\\placeholder{}}',
                            text: 'x_i',
                        },
                        {
                            cmd: true,
                            latex: '\\placeholder{}!',
                            text: 'x!',
                        },
                        {
                            cmd: false,
                            text: '\\Sigma',
                        },
                        {
                            cmd: true,
                            latex: '\\binom{\\placeholder{n}}{\\placeholder{k}}',
                            text: '\\binom{n}{k}',
                        },
                        {
                            cmd: true,
                            latex: 'P(\\placeholder{})',
                            text: 'P(A)',
                        },
                        {
                            cmd: true,
                            latex: 'P(\\placeholder{} \\mid \\placeholder{})',
                            text: 'P(A \\mid B)',
                        },
                    ],
                },
                {
                    name: 'Chữ cái Hy Lạp',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\alpha',
                        },
                        {
                            cmd: false,
                            text: '\\beta',
                        },
                        {
                            cmd: false,
                            text: '\\gamma',
                        },
                        {
                            cmd: false,
                            text: '\\delta',
                        },
                        {
                            cmd: false,
                            text: '\\theta',
                        },
                        {
                            cmd: false,
                            text: '\\pi',
                        },
                        {
                            cmd: false,
                            text: '\\Alpha',
                        },
                        {
                            cmd: false,
                            text: '\\Beta',
                        },
                        {
                            cmd: false,
                            text: '\\Gamma',
                        },
                        {
                            cmd: false,
                            text: '\\varGamma',
                        },
                        {
                            cmd: false,
                            text: '\\Delta',
                        },
                        {
                            cmd: false,
                            text: '\\varDelta',
                        },
                        {
                            cmd: false,
                            text: '\\lambda',
                        },
                        {
                            cmd: false,
                            text: '\\phi',
                        },
                        {
                            cmd: false,
                            text: '\\omega',
                        },
                        {
                            cmd: false,
                            text: '\\epsilon',
                        },
                    ],
                },
                {
                    name: 'Giải tích',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\int',
                        },
                        {
                            cmd: true,
                            latex: '\\int_{\\placeholder{a}}^{\\placeholder{b}} \\placeholder{} \\, d\\placeholder{x}',
                            text: '\\int_{a}^{b} f(x) \\, dx',
                        },
                        {
                            cmd: true,
                            latex: 'd\\placeholder{x}',
                            text: 'dx',
                        },
                        {
                            cmd: true,
                            latex: '\\frac{d}{d\\placeholder{x}}',
                            text: '\\frac{d}{dx}',
                        },
                        {
                            cmd: true,
                            latex: '\\lim_{\\placeholder{x} \\to \\placeholder{}}',
                            text: '\\lim',
                        },
                        {
                            cmd: true,
                            latex: '\\sum_{\\placeholder{i}=\\placeholder{1}}^{\\placeholder{n}}',
                            text: '\\sum',
                        },
                        {
                            cmd: true,
                            latex: '\\prod_{\\placeholder{i}=\\placeholder{1}}^{\\placeholder{n}}',
                            text: '\\prod',
                        },
                        {
                            cmd: false,
                            text: '\\infty',
                        },
                    ],
                },
                {
                    name: 'Ma trận',
                    buttons: [
                        {
                            cmd: true,
                            latex: '\\begin{bmatrix} \\placeholder{} & \\placeholder{} \\\\ \\placeholder{} & \\placeholder{} \\end{bmatrix}',
                            text: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
                        },
                        {
                            cmd: true,
                            latex: '\\begin{bmatrix} \\placeholder{} & \\placeholder{} & \\placeholder{} \\\\ \\placeholder{} & \\placeholder{} & \\placeholder{} \\\\ \\placeholder{} & \\placeholder{} & \\placeholder{} \\end{bmatrix}',
                            text: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}',
                        },
                        {
                            cmd: true,
                            latex: '\\begin{pmatrix} \\placeholder{} & \\placeholder{} \\\\ \\placeholder{} & \\placeholder{} \\end{pmatrix}',
                            text: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
                        },
                        {
                            cmd: true,
                            latex: '\\begin{vmatrix} \\placeholder{} & \\placeholder{} \\\\ \\placeholder{} & \\placeholder{} \\end{vmatrix}',
                            text: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
                        },
                    ],
                },
                {
                    name: 'Hệ phương trình',
                    buttons: [
                        {
                            cmd: true,
                            latex: '\\begin{cases} \\placeholder{} \\\\ \\placeholder{} \\end{cases}',
                            text: '\\begin{cases} x + y \\\\ x - y \\end{cases}',
                        },
                        {
                            cmd: true,
                            latex: '\\begin{cases} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{cases}',
                            text: '\\begin{cases} x + y + z \\\\ x - y + z \\\\ x + y + z \\end{cases}',
                        },
                        {
                            cmd: true,
                            latex: '\\begin{cases} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{cases}',
                            text: '\\begin{cases} x + y + z + w \\\\ x - y + z + w \\\\ x + y + z + w \\\\ x + y + z + w \\end{cases}',
                        },
                        {
                            cmd: true,
                            latex: '\\left[ \\begin{matrix} \\placeholder{} \\\\ \\placeholder{} \\end{matrix} \\right.',
                            text: '\\left[ \\begin{matrix} x + y \\\\ x - y \\end{matrix} \\right.',
                        },
                        {
                            cmd: true,
                            latex: '\\left[ \\begin{matrix} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{matrix} \\right.',
                            text: '\\left[ \\begin{matrix} x + y + z \\\\ x - y + z \\\\ x + y + z \\end{matrix} \\right.',
                        },
                        {
                            cmd: true,
                            latex: '\\left[ \\begin{matrix} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{matrix} \\right.',
                            text: '\\left[ \\begin{matrix} x + y + z + w \\\\ x - y + z + w \\\\ x + y + z + w \\\\ x + y + z + w \\end{matrix} \\right.',
                        },
                    ],
                },
                {
                    name: 'Lũy thừa, Căn, Logarit',
                    buttons: [
                        {
                            cmd: true,
                            latex: '\\placeholder{}^{\\placeholder{}}',
                            text: 'y^x',
                        },
                        {
                            cmd: true,
                            latex: '\\placeholder{}_{\\placeholder{}}',
                            text: 'x_i',
                        },
                        {
                            cmd: true,
                            latex: '\\sqrt{\\placeholder{}}',
                            text: '\\sqrt{x}',
                        },
                        {
                            cmd: true,
                            latex: '\\sqrt[\\placeholder{3}]{\\placeholder{}}',
                            text: '\\sqrt[\\placeholder{3}]{\\placeholder{x}}',
                        },
                        {
                            cmd: true,
                            latex: '\\sqrt[\\placeholder{}]{\\placeholder{}}',
                            text: '\\sqrt[\\placeholder{n}]{\\placeholder{x}}',
                        },
                        {
                            cmd: true,
                            latex: 'e^{\\placeholder{}}',
                            text: 'e^x',
                        },
                        {
                            cmd: false,
                            text: '\\ln',
                        },
                        {
                            cmd: false,
                            text: '\\log',
                        },
                        {
                            cmd: true,
                            latex: '\\log_{\\placeholder{}}',
                            text: '\\log_b',
                        },
                    ],
                },
                {
                    name: 'Quan hệ',
                    buttons: [
                        {
                            cmd: false,
                            text: '=',
                        },
                        {
                            cmd: false,
                            text: '\\neq',
                        },
                        {
                            cmd: false,
                            text: '\\sim',
                        },
                        {
                            cmd: false,
                            text: '\\backsim',
                        },
                        {
                            cmd: false,
                            text: '\\not\\sim',
                        },
                        {
                            cmd: false,
                            text: '\\lt',
                        },
                        {
                            cmd: false,
                            text: '\\gt',
                        },
                        {
                            cmd: false,
                            text: '\\approx',
                        },
                        {
                            cmd: false,
                            text: '\\not\\approx',
                        },
                        {
                            cmd: false,
                            text: '\\le',
                        },
                        {
                            cmd: false,
                            text: '\\ge',
                        },
                        {
                            cmd: false,
                            text: '\\simeq',
                        },
                        {
                            cmd: false,
                            text: '\\not\\simeq',
                        },
                        {
                            cmd: false,
                            text: '\\equiv',
                        },
                        {
                            cmd: false,
                            text: '\\therefore',
                        },
                        {
                            cmd: false,
                            text: '\\pm',
                        },
                        {
                            cmd: false,
                            text: '\\mp',
                        },
                        {
                            cmd: true,
                            text: '\\vdots',
                        },
                        {
                            cmd: true,
                            text: '\\not\\vdots',
                        },
                    ],
                },
                {
                    name: 'Hình học',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\leftarrow',
                        },
                        {
                            cmd: false,
                            text: '\\rightarrow',
                        },
                        {
                            cmd: false,
                            text: '\\leftrightarrow',
                        },
                        {
                            cmd: false,
                            text: '\\Leftarrow',
                        },
                        {
                            cmd: false,
                            text: '\\Rightarrow',
                        },
                        {
                            cmd: false,
                            text: '\\Leftrightarrow',
                        },
                        {
                            cmd: true,
                            latex: '\\overline{\\placeholder{}}',
                            text: '\\overline{ABC}',
                        },
                        {
                            cmd: true,
                            latex: '\\widehat{#?}',
                            text: '\\widehat{ABC}',
                        },
                        {
                            cmd: true,
                            latex: '\\overrightarrow{\\placeholder{}\\placeholder{}}',
                            text: '\\overrightarrow{AB}',
                        },
                        {
                            cmd: true,
                            latex: '\\overleftarrow{\\placeholder{}\\placeholder{}}',
                            text: '\\overleftarrow{AB}',
                        },
                        {
                            cmd: true,
                            latex: '\\overgroup{\\placeholder{}}',
                            text: '\\overgroup{ABC}',
                        },
                        {
                            cmd: false,
                            text: '\\parallel',
                        },
                        {
                            cmd: false,
                            text: '\\perp',
                        },
                        {
                            cmd: false,
                            text: '\\angle',
                        },
                        {
                            cmd: false,
                            text: 'm\\angle',
                        },
                        {
                            cmd: false,
                            text: '\\bigtriangleup',
                        },
                        {
                            cmd: false,
                            text: '▱',
                        },
                        {
                            cmd: false,
                            text: '\\bigodot',
                        },
                        {
                            cmd: false,
                            text: '\\degree',
                        },
                    ],
                },
                {
                    name: 'Tập hợp',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\mathbb{N}',
                        },
                        {
                            cmd: false,
                            text: '\\mathbb{Q}',
                        },
                        {
                            cmd: false,
                            text: '\\mathbb{R}',
                        },
                        {
                            cmd: false,
                            text: '\\mathbb{Z}',
                        },
                        {
                            cmd: false,
                            text: '\\mathbb{C}',
                        },
                        {
                            cmd: false,
                            text: '\\emptyset',
                        },
                        {
                            cmd: false,
                            text: '\\varnothing',
                        },
                        {
                            cmd: false,
                            text: '\\cap',
                        },
                        {
                            cmd: false,
                            text: '\\cup',
                        },
                        {
                            cmd: false,
                            text: '\\subset',
                        },
                        {
                            cmd: false,
                            text: '\\supset',
                        },
                        {
                            cmd: false,
                            text: '\\subseteq',
                        },
                        {
                            cmd: false,
                            text: '\\supseteq',
                        },
                        {
                            cmd: false,
                            text: '\\setminus',
                        },
                        {
                            cmd: false,
                            text: '\\smallsetminus',
                        },
                        {
                            cmd: false,
                            text: '\\complement',
                        },
                        {
                            cmd: false,
                            text: '\\in',
                        },
                        {
                            cmd: false,
                            text: '\\notin',
                        },
                    ],
                },
                {
                    name: 'Lượng từ và Logic',
                    buttons: [
                        {
                            cmd: false,
                            text: '\\forall',
                        },
                        {
                            cmd: false,
                            text: '\\exists',
                        },
                        {
                            cmd: false,
                            text: '\\nexists',
                        },
                        {
                            cmd: false,
                            text: '\\land',
                        },
                        {
                            cmd: false,
                            text: '\\lor',
                        },
                        {
                            cmd: false,
                            text: '\\neg',
                        },
                    ],
                },
                {
                    name: 'Dấu ngoặc',
                    buttons: [
                        {
                            cmd: true,
                            latex: '(\\placeholder{})',
                            text: '(\\cdot)',
                        },
                        {
                            cmd: true,
                            latex: '[\\placeholder{}]',
                            text: '[\\cdot]',
                        },
                        {
                            cmd: true,
                            latex: '\\left| \\placeholder{} \\right|',
                            text: '|\\cdot|',
                        },
                        {
                            cmd: true,
                            latex: '(\\placeholder{},\\placeholder{})',
                            text: '(x,y)',
                        },
                        {
                            cmd: true,
                            latex: '[\\placeholder{},\\placeholder{}]',
                            text: '[x,y]',
                        },
                        {
                            cmd: true,
                            latex: '(\\placeholder{},\\placeholder{}]',
                            text: '(x,y]',
                        },
                        {
                            cmd: true,
                            latex: '[\\placeholder{},\\placeholder{})',
                            text: '[x,y)',
                        },
                    ],
                },
            ]
        };
    }

    if (typeof btnBar === 'undefined') {
        btnBar = [
            {
                text: '+',
            },
            {
                text: '-',
            },
            {
                text: '\\times',
            },
            {
                text: '\\div',
            },
            {
                text: 'y^x',
                latex: 'y^x',
                cmd: true,
            },
            {
                text: '\\sqrt{x}',
                latex: '\\sqrt{x}',
                cmd: true,
            },
            {
                latex: '\\sqrt[\\placeholder{}]{\\placeholder{}}',
                text: '\\sqrt[\\placeholder{n}]{\\placeholder{x}}',
                cmd: true,
            },
            {
                latex: '\\log_b',
                text: '\\log_b',
                cmd: false,
            },
        ];
    }

    // ----- Events ----- //
    editor.on('BeforeSetContent', (event) => {
        if (storageFormat === 'latex-html') {
            event.content = toRuntimeEquationContent(
                event.content,
                editorSettings.render_latex as LatexRenderer
            );
        }
    });

    editor.on('GetContent', (event) => {
        if (storageFormat === 'latex-html' && event.format === 'html') {
            event.content = toStoredEquationContent(event.content);
        }
    });

    editor.on('SetContent', () => {
        setOnClickEquationContent(editor);
    });

    editor.on('init', () => {
        setTimeout(() => {
            setOnClickEquationContent(editor);
        }, 500);
    });

    // ----- Commands ----- //
    editor.addCommand('equation-window', function (
        data: DataEquationWindow = {}
    ) {
        let htmlLatex = data.currentTarget
            ? (data.currentTarget as any).innerHTML
            : '';

        editor.windowManager.openUrl({
            url: editorSettings.url,
            title: editorSettings.title,
            width: editorSettings?.width ?? 820,
            height: editorSettings?.height ?? 500,
            buttons: [
                {
                    type: 'cancel',
                    text: editorSettings.btn_cancel_text,
                },
                {
                    type: 'custom',
                    text: editorSettings.btn_ok_text,
                    primary: true,
                },
            ],
            onAction: () => {
                editor.execCommand('equation-insert', {
                    html: htmlLatex,
                    latex: data.latex,
                    display: data.display,
                    currentTarget: data.currentTarget,
                });
                editor.windowManager.close();
            },
            onMessage: (instance, message) => {
                switch (message.mceAction) {
                    case 'equation-update':
                        htmlLatex = message.html;
                        data.latex = message.latex;
                        break;
                    case 'equation-mounted':
                        sendParams(
                            editorSettings,
                            btnBar,
                            groups,
                            groupName,
                            data.latex
                        );
                        break;
                }
            },
        });
    });

    editor.addCommand('equation-insert', (data) => {
        if (!data) {
            return;
        }

        // Add span.mq-math-mode
        const display = data.display === 'block' ? 'block' : 'inline';
        const content = `<span class='mq-math-mode' data-latex='${data.latex}' data-display='${display}'>${data.html}</span>${editorSettings.space_after_content}`;

        if (data.currentTarget) {
            editor.selection.select(data.currentTarget);
        }
        editor.selection.setContent(content);
        setOnClickEquationContent(editor);
    });

    // Register button
    editor.ui.registry.addButton('equation-editor', {
        title: 'Editor de ecuaciones',
        text: 'f(x)',
        onAction: () => {
            editor.execCommand('equation-window', {});
        },
    });
};

export default () => {
    tinymce.PluginManager.add('equation-editor', setup);
};

function getSettings(editor, key) {
    if (editor.editorManager.majorVersion === '6') {
        return editor.options.get(key);
    }
    return editor.settings[key];
}

function getStorageFormat(editor): 'mathlive-html' | 'latex-html' {
    const storageFormat = getSettings(editor, 'equation_editor_storage_format');

    if (typeof storageFormat === 'undefined') {
        return 'mathlive-html';
    }
    if (storageFormat === 'mathlive-html' || storageFormat === 'latex-html') {
        return storageFormat;
    }
    throw new Error(
        "'equation_editor_storage_format' must be 'mathlive-html' or 'latex-html'"
    );
}

function getEditorSettings(editor): EditorSettings {
    // equation_editor_config
    let editorSettings = getSettings(editor, 'equation_editor_config');

    if (typeof editorSettings === 'undefined') {
        editorSettings = {};
    } else if (typeof editorSettings !== 'object') {
        throw new Error("'equation_editor_config' property must be an object");
    }

    // url
    if (typeof editorSettings.url === 'undefined') {
        editorSettings.url = 'editor/equation_editor.html';
    } else if (typeof editorSettings.url !== 'string') {
        throw new Error(
            "'url' property must be a string in equation_editor_config"
        );
    }

    // origin
    if (typeof editorSettings.origin === 'undefined') {
        editorSettings.origin = document.location.origin;
    } else if (typeof editorSettings.origin !== 'string') {
        throw new Error(
            "'origin' property must be a string in equation_editor_config"
        );
    }

    // title
    if (typeof editorSettings.title === 'undefined') {
        editorSettings.title = 'Equation Editor';
    } else if (typeof editorSettings.title !== 'string') {
        throw new Error(
            "'title' property must be a string in equation_editor_config"
        );
    }

    // space_after_content
    if (typeof editorSettings.space_after_content === 'undefined') {
        editorSettings.space_after_content = '&nbsp;';
    } else if (typeof editorSettings.space_after_content !== 'string') {
        throw new Error(
            "'space_after_content' property must be a string in equation_editor_config"
        );
    }

    // btn_cancel_text
    if (typeof editorSettings.btn_cancel_text === 'undefined') {
        editorSettings.btn_cancel_text = 'Cancel';
    } else if (typeof editorSettings.btn_cancel_text !== 'string') {
        throw new Error(
            "'btn_cancel_text' property must be a string in equation_editor_config"
        );
    }

    // btn_ok_text
    if (typeof editorSettings.btn_ok_text === 'undefined') {
        editorSettings.btn_ok_text = 'Insert';
    } else if (typeof editorSettings.btn_ok_text !== 'string') {
        throw new Error(
            "'btn_ok_text' property must be a string in equation_editor_config"
        );
    }

    if (typeof editorSettings.mathlive_config !== 'object' && typeof editorSettings.mathlive_config !== 'undefined') {
        throw new Error(
            "'mathlive_config' property must be a object with config of mathlive, see http://docs.mathlive.io/tutorial-CONFIG.html"
        );
    }

    if (
        typeof editorSettings.render_latex !== 'undefined' &&
        typeof editorSettings.render_latex !== 'function'
    ) {
        throw new Error(
            "'render_latex' property must be a function in equation_editor_config"
        );
    }

    return editorSettings;
}

function sendParams(editorSettings: EditorSettings, btnBar, groups, groupName, latex) {
    const iframe = document.querySelector("iframe[src='" + editorSettings.url + "']");
    const buttonBar = new ButtonsTransformer(btnBar).transform();

    for (const name in groups) {
        if (!groups.hasOwnProperty(name)) {
            continue;
        }

        const buttonGroup = groups[name];

        if (!(buttonGroup instanceof Array)) {
            throw new Error('Groups must be an array ');
        }

        const transformGroup: Array<Group> = buttonGroup.map((group) => {
            if (typeof group.name === 'undefined') {
                throw new Error('You must define group name property');
            } else if (typeof group.name !== 'string') {
                throw new Error('Group name must be a string');
            } else if (typeof group.buttons === 'undefined') {
                throw new Error('You must define buttons property');
            }

            const buttons = new ButtonsTransformer(group.buttons).transform();
            return {
                name: group.name,
                buttons,
            };
        });

        groups[name] = transformGroup;
    }

    // Send params to Equation Editor iframe
    iframe.contentWindow.postMessage(
        {
            equation_editor_group: groupName,
            equation_editor_button_bar: buttonBar,
            equation_editor_button_groups: groups,
            mathlive_config: editorSettings.mathlive_config,
            latex,
        },
        editorSettings.origin
    );
}

function setOnClickEquationContent(editor) {
    const tinymceDoc = editor.getDoc();
    const mqSpan = tinymceDoc.getElementsByClassName('mq-math-mode');

    // Add onclick listener to all equation content
    for (const equationContent of mqSpan) {
        equationContent.contentEditable = 'false';
        if (equationContent.onclick) {
            continue;
        }

        equationContent.onclick = (event) => {
            event.stopPropagation();
            editor.execCommand('equation-window', {
                latex: event.currentTarget.dataset.latex,
                display: event.currentTarget.dataset.display,
                currentTarget: event.currentTarget,
            });
        };
    }
}
