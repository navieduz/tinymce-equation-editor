import { UnitTest } from '@ephox/bedrock';
import { expect } from 'chai';
import {
    toRuntimeEquationContent,
    toStoredEquationContent,
} from '../../../main/ts/EquationContentTransformer';

UnitTest.test('browser.EquationContentTransformerTest', () => {
    expect(
        toStoredEquationContent(
            '<p>A <span class="mq-math-mode" data-latex="y^x"><var>y</var></span> B</p>'
        )
    ).to.equal(
        '<p>A <span data-math="latex" data-display="inline" data-latex="y^x"></span> B</p>'
    );

    expect(
        toRuntimeEquationContent(
            '<p><span data-math="latex" data-display="inline" data-latex="\\\\frac{a}{b}"></span></p>',
            (value) => '<span class="rendered">' + value + '</span>'
        )
    ).to.equal(
        '<p><span class="mq-math-mode" data-latex="\\\\frac{a}{b}" data-display="inline" contenteditable="false"><span class="rendered">\\\\frac{a}{b}</span></span></p>'
    );

    const latex = '\\begin{cases}x & y \\\\ z\\end{cases}';
    const runtimeContent =
        '<p><span class="mq-math-mode" data-latex="\\begin{cases}x &amp; y \\\\ z\\end{cases}"><span>rendered</span></span><a href="/lesson">link</a></p>';
    const storedContent = toStoredEquationContent(runtimeContent);
    const roundTrippedContent = toStoredEquationContent(
        toRuntimeEquationContent(storedContent, (value) => '<span>' + value + '</span>')
    );
    const document = window.document.implementation.createHTMLDocument('equation-content-test');
    document.body.innerHTML = roundTrippedContent;

    expect(document.body.querySelector('[data-math="latex"]')!.getAttribute('data-latex')).to.equal(latex);
    expect(document.body.querySelector('a')!.getAttribute('href')).to.equal('/lesson');
    expect(document.body.querySelector('a')!.textContent).to.equal('link');

    const original = '<p><span class="mq-math-mode"><var>y</var></span></p>';
    expect(toStoredEquationContent(original)).to.equal(original);

    const renderedFallback = toRuntimeEquationContent(
        '<p><span data-math="latex" data-latex="y^x"></span></p>',
        () => {
            throw new Error('renderer failed');
        }
    );
    expect(renderedFallback).to.equal(
        '<p><span class="mq-math-mode" data-latex="y^x" data-display="inline" contenteditable="false">y^x</span></p>'
    );

    const blockContent = toStoredEquationContent(
        '<p><span class="mq-math-mode" data-latex="\\int_0^1 x^2\\,dx" data-display="block"><span>rendered</span></span></p>'
    );
    expect(blockContent).to.equal(
        '<p><span data-math="latex" data-display="block" data-latex="\\int_0^1 x^2\\,dx"></span></p>'
    );
    expect(
        toRuntimeEquationContent(blockContent, (value) => '<span>' + value + '</span>')
    ).to.equal(
        '<p><span class="mq-math-mode" data-latex="\\int_0^1 x^2\\,dx" data-display="block" contenteditable="false"><span>\\int_0^1 x^2\\,dx</span></span></p>'
    );

    const legacyLatex =
        'S_{\\triangle ABC}=\\frac{AH\\times BC}{2}=148,4\\text{ (dm}^2\\text{)}';
    const legacyContent =
        '<p><span class="mq-math-mode" data-latex="' +
        legacyLatex +
        '" contenteditable="false"><span class="ML__mathlive"><span class="ML__base">old MathLive markup</span></span></span></p>';
    const hydratedLegacyContent = toRuntimeEquationContent(
        legacyContent,
        (value) => '<span class="rendered-current">' + value + '</span>'
    );
    expect(hydratedLegacyContent).to.equal(
        '<p><span class="mq-math-mode" data-latex="' +
            legacyLatex +
            '" data-display="inline" contenteditable="false"><span class="rendered-current">' +
            legacyLatex +
            '</span></span></p>'
    );
    expect(toStoredEquationContent(hydratedLegacyContent)).to.equal(
        '<p><span data-math="latex" data-display="inline" data-latex="' +
            legacyLatex +
            '"></span></p>'
    );
});
