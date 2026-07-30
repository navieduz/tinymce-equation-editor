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
    ).to.equal('<p>A \\(y^x\\) B</p>');

    expect(
        toRuntimeEquationContent(
            '<p>A \\(\\frac{a}{b}\\) B</p>',
            (value) => '<span class="rendered">' + value + '</span>'
        )
    ).to.equal(
        '<p>A <span class="mq-math-mode" data-latex="\\frac{a}{b}" data-display="inline" contenteditable="false"><span class="rendered">\\frac{a}{b}</span></span> B</p>'
    );

    const dollarDelimitedContent = toRuntimeEquationContent(
        '<p>$y^x$</p><p>$$\\int_0^1 x^2\\,dx$$</p>',
        (value) => '<span>' + value + '</span>'
    );
    expect(dollarDelimitedContent).to.equal(
        '<p><span class="mq-math-mode" data-latex="y^x" data-display="inline" contenteditable="false"><span>y^x</span></span></p><p><span class="mq-math-mode" data-latex="\\int_0^1 x^2\\,dx" data-display="block" contenteditable="false"><span>\\int_0^1 x^2\\,dx</span></span></p>'
    );
    expect(toStoredEquationContent(dollarDelimitedContent)).to.equal(
        '<p>\\(y^x\\)</p><p>\\[\\int_0^1 x^2\\,dx\\]</p>'
    );

    const latex = '\\begin{cases}x & y \\\\ z\\end{cases}';
    const storedContent =
        '<p>\\(' +
        latex.replace('&', '&amp;') +
        '\\)<a href="/lesson">link</a></p>';
    const roundTrippedContent = toStoredEquationContent(
        toRuntimeEquationContent(storedContent, (value) => '<span>' + value + '</span>')
    );
    expect(roundTrippedContent).to.equal(storedContent);

    expect(
        toRuntimeEquationContent('<p>\\(unclosed</p>', () => '<span>rendered</span>')
    ).to.equal('<p>\\(unclosed</p>');
    expect(
        toRuntimeEquationContent(
            '<p><code><span>\\(literal\\)</span></code></p>',
            () => '<span>rendered</span>'
        )
    ).to.equal('<p><code><span>\\(literal\\)</span></code></p>');

    const renderedFallback = toRuntimeEquationContent(
        '<p>\\(y^x\\)</p>',
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
    expect(blockContent).to.equal('<p>\\[\\int_0^1 x^2\\,dx\\]</p>');
    expect(
        toRuntimeEquationContent(blockContent, (value) => '<span>' + value + '</span>')
    ).to.equal(
        '<p><span class="mq-math-mode" data-latex="\\int_0^1 x^2\\,dx" data-display="block" contenteditable="false"><span>\\int_0^1 x^2\\,dx</span></span></p>'
    );
});
