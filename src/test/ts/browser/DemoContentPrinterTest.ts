import { UnitTest } from '@ephox/bedrock';
import { expect } from 'chai';
import { bindContentPrinter } from '../../../demo/ts/DemoContentPrinter';

UnitTest.test('browser.DemoContentPrinterTest', () => {
    const button = document.createElement('button');
    const output = document.createElement('textarea');
    const editor = {
        getContent: () => '<p><span class="equation-latex" data-latex="y^x"></span></p>',
    };

    bindContentPrinter(editor, button, output);
    button.click();

    expect(output.value).to.equal(
        '<p><span class="equation-latex" data-latex="y^x"></span></p>'
    );
});
