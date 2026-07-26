export type LatexRenderer = (latex: string) => string;

const createEquationDocument = (content: string): Document => {
    const equationDocument = document.implementation.createHTMLDocument('equation-content');
    equationDocument.body.innerHTML = content;
    return equationDocument;
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

        const compactEquation = equationDocument.createElement('span');
        compactEquation.className = 'equation-latex';
        compactEquation.dataset.latex = latex;
        equation.parentNode!.replaceChild(compactEquation, equation);
    }

    return equationDocument.body.innerHTML;
};

export const toRuntimeEquationContent = (
    content: string,
    renderLatex: LatexRenderer
): string => {
    const equationDocument = createEquationDocument(content);
    const equations = Array.prototype.slice.call(
        equationDocument.body.querySelectorAll('span.equation-latex[data-latex]')
    ) as HTMLSpanElement[];

    for (const equation of equations) {
        const latex = equation.dataset.latex;
        const runtimeEquation = equationDocument.createElement('span');

        runtimeEquation.className = 'mq-math-mode';
        runtimeEquation.dataset.latex = latex;
        runtimeEquation.contentEditable = 'false';

        try {
            runtimeEquation.innerHTML = renderLatex(latex);
        } catch (error) {
            runtimeEquation.textContent = latex;
            // tslint:disable-next-line:no-console
            console.warn('Unable to render equation LaTeX', error);
        }

        equation.parentNode!.replaceChild(runtimeEquation, equation);
    }

    return equationDocument.body.innerHTML;
};
