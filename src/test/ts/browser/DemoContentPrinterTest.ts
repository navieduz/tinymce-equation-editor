import { UnitTest } from '@ephox/bedrock';
import { expect } from 'chai';
import { bindContentPrinter } from '../../../demo/ts/DemoContentPrinter';

UnitTest.test('browser.DemoContentPrinterTest', () => {
    const button = document.createElement('button');
    const output = document.createElement('textarea');
    const editor = {
        getContent: () => '<p><span data-math="latex" data-display="inline" data-latex="y^x"></span></p>',
    };

    bindContentPrinter(editor, button, output);
    button.click();

    expect(output.value).to.equal(
        '<p><span data-math="latex" data-display="inline" data-latex="y^x"></span></p>'
    );
});
