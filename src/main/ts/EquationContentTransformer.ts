import { convertLatexToMarkup} from 'mathlive';
export type LatexRenderer = (latex: string) => string;

const createEquationDocument = (content: string): Document => {
    const equationDocument = document.implementation.createHTMLDocument('equation-content');
    equationDocument.body.innerHTML = content;
    return equationDocument;
};

const createRuntimeEquation = (
    equationDocument: Document,
    latex: string,
    display: 'inline' | 'block',
    renderLatex: LatexRenderer
): HTMLSpanElement => {
    const runtimeEquation = equationDocument.createElement('span');
    runtimeEquation.className = 'mq-math-mode';
    runtimeEquation.dataset.latex = latex;
    runtimeEquation.dataset.display = display;
    runtimeEquation.contentEditable = 'false';

    try {
        runtimeEquation.innerHTML = typeof renderLatex === 'function' ? renderLatex(latex) : convertLatexToMarkup(latex);
    } catch (error) {
        runtimeEquation.textContent = latex;
        // tslint:disable-next-line:no-console
        console.warn('Unable to render equation LaTeX', error);
    }

    return runtimeEquation;
};

const shouldParseTextNode = (textNode: Text): boolean => {
    let parent = textNode.parentElement;

    while (parent !== null) {
        if (['CODE', 'PRE', 'SCRIPT', 'STYLE'].indexOf(parent.tagName) !== -1) {
            return false;
        }
        parent = parent.parentElement;
    }

    return true;
};

export const toStoredEquationContent = (content: string): string => {
    const equationDocument = createEquationDocument(content);
    const equations = Array.prototype.slice.call(
        equationDocument.body.querySelectorAll('span.mq-math-mode')
    ) as HTMLSpanElement[];

    for (const equation of equations) {
        const latex = equation.dataset.latex;

        if (latex === undefined || latex.length === 0) {
            // tslint:disable-next-line:no-console
            console.warn('Unable to compact equation without data-latex');
            continue;
        }

        const delimiter = equation.dataset.display === 'block' ? ['\\[', '\\]'] : ['\\(', '\\)'];
        const compactEquation = equationDocument.createTextNode(
            delimiter[0] + latex + delimiter[1]
        );
        equation.parentNode!.replaceChild(compactEquation, equation);
    }

    return equationDocument.body.innerHTML;
};

export const toRuntimeEquationContent = (
    content: string,
    renderLatex: LatexRenderer
): string => {
    const equationDocument = createEquationDocument(content);
    const walker = equationDocument.createTreeWalker(
        equationDocument.body,
        NodeFilter.SHOW_TEXT,
        null
    );
    const textNodes: Text[] = [];
    let textNode = walker.nextNode();

    while (textNode !== null) {
        textNodes.push(textNode as Text);
        textNode = walker.nextNode();
    }

    for (const node of textNodes) {
        if (!shouldParseTextNode(node)) {
            continue;
        }

        const delimiterPattern = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;
        const fragment = equationDocument.createDocumentFragment();
        let lastIndex = 0;
        let match = delimiterPattern.exec(node.data);

        while (match !== null) {
            fragment.appendChild(
                equationDocument.createTextNode(node.data.slice(lastIndex, match.index))
            );
            fragment.appendChild(
                createRuntimeEquation(
                    equationDocument,
                    match[1] || match[2] || match[3] || match[4],
                    match[2] || match[3] ? 'block' : 'inline',
                    renderLatex
                )
            );
            lastIndex = delimiterPattern.lastIndex;
            match = delimiterPattern.exec(node.data);
        }

        if (lastIndex === 0) {
            continue;
        }

        fragment.appendChild(equationDocument.createTextNode(node.data.slice(lastIndex)));
        node.parentNode!.replaceChild(fragment, node);
    }

    return equationDocument.body.innerHTML;
};
