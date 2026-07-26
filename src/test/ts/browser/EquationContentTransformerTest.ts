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
        '<p>A <span class="equation-latex" data-latex="y^x"></span> B</p>'
    );

    expect(
        toRuntimeEquationContent(
            '<p><span class="equation-latex" data-latex="\\\\frac{a}{b}"></span></p>',
            (value) => '<span class="rendered">' + value + '</span>'
        )
    ).to.equal(
        '<p><span class="mq-math-mode" data-latex="\\\\frac{a}{b}" contenteditable="false"><span class="rendered">\\\\frac{a}{b}</span></span></p>'
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

    expect(document.body.querySelector('.equation-latex')!.getAttribute('data-latex')).to.equal(latex);
    expect(document.body.querySelector('a')!.getAttribute('href')).to.equal('/lesson');
    expect(document.body.querySelector('a')!.textContent).to.equal('link');

    const original = '<p><span class="mq-math-mode"><var>y</var></span></p>';
    expect(toStoredEquationContent(original)).to.equal(original);

    const renderedFallback = toRuntimeEquationContent(
        '<p><span class="equation-latex" data-latex="y^x"></span></p>',
        () => {
            throw new Error('renderer failed');
        }
    );
    expect(renderedFallback).to.equal(
        '<p><span class="mq-math-mode" data-latex="y^x" contenteditable="false">y^x</span></p>'
    );
});
