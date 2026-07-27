import { Pipeline, Logger, GeneralSteps, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock';
import { expect } from 'chai';
import Plugin from '../../../main/ts/Plugin';

Plugin();

UnitTest.asynctest('browser.EquationDialogTest', (success, failure) => {
    TinyLoader.setup(
        (editor, onSuccess, onFailure) => {
            Pipeline.async(
                {},
                [
                    Logger.t(
                        'editing a second equation without changes preserves its rendered HTML',
                        GeneralSteps.sequence([
                            Step.sync(() => {
                                editor.setContent(
                                    '<p><span class="mq-math-mode" data-latex="a" data-display="inline"><var>a</var></span><span class="mq-math-mode" data-latex="b" data-display="block"><var>b</var></span></p>'
                                );

                                const dialogs: Array<any> = [];
                                const openUrl = editor.windowManager.openUrl;
                                const close = editor.windowManager.close;
                                editor.windowManager.openUrl = (dialog) => {
                                    dialogs.push(dialog);
                                    return {};
                                };
                                editor.windowManager.close = () => undefined;

                                try {
                                    const equations = editor.getBody().getElementsByClassName(
                                        'mq-math-mode'
                                    );
                                    editor.execCommand('equation-window', {
                                        latex: 'a',
                                        display: 'inline',
                                        currentTarget: equations[0],
                                    });
                                    dialogs[0].onMessage(null, {
                                        mceAction: 'equation-update',
                                        html: '<var>changed-a</var>',
                                        latex: 'changed-a',
                                    });
                                    editor.execCommand('equation-window', {
                                        latex: 'b',
                                        display: 'block',
                                        currentTarget: equations[1],
                                    });
                                    dialogs[1].onAction();

                                    const updatedEquations = editor
                                        .getBody()
                                        .getElementsByClassName('mq-math-mode');
                                    expect(
                                        updatedEquations[1].getAttribute('data-latex')
                                    ).to.equal('b');
                                    expect(updatedEquations[1].innerHTML).to.equal(
                                        '<var>b</var>'
                                    );
                                    expect(
                                        updatedEquations[1].getAttribute('data-display')
                                    ).to.equal('block');
                                } finally {
                                    editor.windowManager.openUrl = openUrl;
                                    editor.windowManager.close = close;
                                }
                            }),
                        ])
                    ),
                ],
                onSuccess,
                onFailure
            );
        },
        {
            plugins: 'equation-editor',
            toolbar: 'equation-editor',
        },
        success,
        failure
    );
});
