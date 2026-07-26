import { Pipeline, Logger, GeneralSteps, Step } from '@ephox/agar';
import { TinyLoader, TinyApis } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock';
import { expect } from 'chai';
import Plugin from '../../../main/ts/Plugin';

// This an example of a browser test of the editor.
UnitTest.asynctest('browser.PluginTest', (success, failure) => {
    Plugin();

    const runCompactStorageTests = () => {
        TinyLoader.setup(
            (editor, onSuccess, onFailure) => {
                Pipeline.async(
                    {},
                    [
                        Logger.t(
                            'hydrate compact equations and save compact content',
                            GeneralSteps.sequence([
                                Step.sync(() => {
                                    editor.setContent(
                                        '<p><span class="equation-latex" data-latex="y^x"></span></p>'
                                    );
                                }),
                                Step.sync(() => {
                                    expect(
                                        editor.getBody().querySelector('.mq-math-mode')
                                    ).not.to.equal(null);
                                    expect(editor.getContent()).to.equal(
                                        '<p><span class="equation-latex" data-latex="y^x"></span></p>'
                                    );
                                }),
                            ])
                        ),
                        Logger.t(
                            'lazily migrate rendered equations when saving',
                            GeneralSteps.sequence([
                                Step.sync(() => {
                                    editor.setContent(
                                        '<p><span class="mq-math-mode" data-latex="y^x"><var>y</var></span></p>'
                                    );
                                }),
                                Step.sync(() => {
                                    expect(editor.getContent()).to.equal(
                                        '<p><span class="equation-latex" data-latex="y^x"></span></p>'
                                    );
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
                equation_editor_storage_format: 'latex-html',
                equation_editor_config: {
                    render_latex: (latex) =>
                        '<span class="fixture-render">' + latex + '</span>',
                },
            },
            success,
            failure
        );
    };

    TinyLoader.setup(
        (editor, onSuccess, onFailure) => {
            const tinyApis = TinyApis(editor);

            Pipeline.async(
                {},
                [
                    Logger.t(
                        'test equation-insert command',
                        GeneralSteps.sequence([
                            tinyApis.sExecCommand('equation-insert', {
                                html:
                                    '<var>y</var><span class="mq-supsub mq-non-leaf mq-sup-only"><span class="mq-sup"><var>x</var></span></span>',
                                latex: 'y^x',
                            }),
                            tinyApis.sAssertContent(
                                '<p><span class="mq-math-mode" data-latex="y^x" contenteditable="false"><var>y</var><span class="mq-supsub mq-non-leaf mq-sup-only"><span class="mq-sup"><var>x</var></span></span></span>&nbsp;<br data-mce-bogus="1"></p>'
                            ),
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
        runCompactStorageTests,
        failure
    );
});
