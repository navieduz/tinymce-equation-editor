import { expect } from 'chai';

declare const require: any;

let mutationObserverCallbacks: Array<() => void> = [];

function FakeMutationObserver(callback: () => void) {
    mutationObserverCallbacks.push(callback);
    return {
        observe: () => undefined,
        disconnect: () => undefined,
    };
}

class FakeMathfield {
    public selection = { ranges: [[0, 0]], direction: 'none' };
    public delayedInput = false;
    public selectionOverlay: any = null;
    public selectedElement = {
        getBoundingClientRect: () => ({
            bottom: 30,
            height: 20,
            left: 10,
            right: 30,
            top: 10,
            width: 20,
        }),
    };
    public contentElement = {
        getBoundingClientRect: () => ({
            bottom: 30,
            left: 0,
            right: 100,
            top: 0,
        }),
        prepend: (element: any) => {
            this.selectionOverlay = element;
        },
    };
    public shadowRoot = {
        querySelector: (selector: string) => {
            if (selector === '.ML__selected') {
                return this.selectedElement;
            }
            if (selector === '[part="content"]') {
                return this.contentElement;
            }
            if (selector === '.ML__selection') {
                return this.selectionOverlay;
            }
            return null;
        },
    };
    public inlineShortcuts = {};
    private listeners: Record<string, Array<(event?: any) => void>> = {};

    public addEventListener(type: string, listener: (event?: any) => void) {
        this.listeners[type] = this.listeners[type] || [];
        this.listeners[type].push(listener);
    }

    public dispatch(type: string, event: any = {}) {
        if (type === 'pointerdown') {
            this.selection = { ranges: [[0, 0]], direction: 'none' };
        }
        (this.listeners[type] || []).forEach((listener) => listener(event));
    }

    public insert() {
        this.selection = { ranges: [[1, 2]], direction: 'none' };
        this.dispatch('input');
        if (this.delayedInput) {
            setTimeout(() => this.dispatch('input'), 0);
        }
        return true;
    }

    public getValue() {
        return '';
    }
}

function loadEditorMethods() {
    const fs = require('fs');
    const vm = require('vm');
    let options: any;
    mutationObserverCallbacks = [];

    const context = {
        MathLive: {
            convertLatexToMarkup: () => '',
            renderMathInDocument: () => undefined,
        },
        MathfieldElement() {
            return new FakeMathfield();
        },
        MutationObserver: FakeMutationObserver,
        Vue(value) {
            options = value;
            return value;
        },
        document: {
            createElement: () => ({ className: '', style: {} }),
            getElementById: () => ({ appendChild: () => undefined }),
        },
        setTimeout: (callback) => setTimeout(callback, 0),
        window: {
            addEventListener: () => undefined,
            parent: { postMessage: () => undefined },
        },
    };

    vm.runInNewContext(
        fs.readFileSync('src/demo/html/editor/js/script.js', 'utf8'),
        context
    );

    return options.methods;
}

describe('Equation editor placeholder interaction', () => {
    it('keeps a newly inserted placeholder editable after clicking it', () => {
        const methods = loadEditorMethods();
        const state: any = {
            initEquation: methods.initEquation,
            insert: methods.insert,
            restorePlaceholderHighlight: methods.restorePlaceholderHighlight,
            latex: '',
            mathLiveConfig: {},
            mathField: null,
            sendLatex: () => undefined,
        };

        state.initEquation();
        state.insert({ latex: '\\widehat{#?}' });

        state.mathField.dispatch('pointerdown', {
            clientX: 20,
            clientY: 15,
        });
        state.mathField.dispatch('click');

        expect(state.mathField.selection).to.deep.equal({
            ranges: [[1, 2]],
            direction: 'none',
        });
    });

    it('renders a fallback highlight when MathLive omits an accent selection overlay', () => {
        const methods = loadEditorMethods();
        const state: any = {
            initEquation: methods.initEquation,
            insert: methods.insert,
            restorePlaceholderHighlight: methods.restorePlaceholderHighlight,
            latex: '',
            mathLiveConfig: {},
            mathField: null,
            sendLatex: () => undefined,
        };

        state.initEquation();
        state.insert({ latex: '\\widehat{#?}' });

        expect(state.mathField.selectionOverlay).to.include({
            className: 'ML__selection',
        });
        expect(state.mathField.selectionOverlay.style).to.include({
            height: '19px',
            left: '10px',
            position: 'absolute',
            top: '10px',
            width: '20px',
        });
    });

    it('reselects a widehat placeholder with ArrowRight from before it', () => {
        const methods = loadEditorMethods();
        const state: any = {
            initEquation: methods.initEquation,
            insert: methods.insert,
            restorePlaceholderHighlight: methods.restorePlaceholderHighlight,
            latex: '',
            mathLiveConfig: {},
            mathField: null,
            sendLatex: () => undefined,
        };

        state.initEquation();
        state.insert({ latex: '\\widehat{#?}' });
        state.mathField.selection = { ranges: [[0, 0]], direction: 'none' };

        const event = {
            key: 'ArrowRight',
            preventDefault: () => undefined,
            stopPropagation: () => undefined,
        };
        state.mathField.dispatch('keydown', event);

        expect(state.mathField.selection).to.deep.equal({
            ranges: [[1, 2]],
            direction: 'none',
        });
    });

    it('reselects a widehat placeholder with ArrowLeft from after it', () => {
        const methods = loadEditorMethods();
        const state: any = {
            initEquation: methods.initEquation,
            insert: methods.insert,
            restorePlaceholderHighlight: methods.restorePlaceholderHighlight,
            latex: '',
            mathLiveConfig: {},
            mathField: null,
            sendLatex: () => undefined,
        };

        state.initEquation();
        state.insert({ latex: '\\widehat{#?}' });
        state.mathField.selection = { ranges: [[3, 3]], direction: 'none' };

        const event = {
            key: 'ArrowLeft',
            preventDefault: () => undefined,
            stopPropagation: () => undefined,
        };
        state.mathField.dispatch('keydown', event);

        expect(state.mathField.selection).to.deep.equal({
            ranges: [[1, 2]],
            direction: 'none',
        });
    });

    it('does not reselect a placeholder for modified arrow keys', () => {
        const methods = loadEditorMethods();
        const state: any = {
            initEquation: methods.initEquation,
            insert: methods.insert,
            restorePlaceholderHighlight: methods.restorePlaceholderHighlight,
            latex: '',
            mathLiveConfig: {},
            mathField: null,
            sendLatex: () => undefined,
        };

        state.initEquation();
        state.insert({ latex: '\\widehat{#?}' });
        state.mathField.selection = { ranges: [[0, 0]], direction: 'none' };
        state.mathField.dispatch('keydown', {
            key: 'ArrowRight',
            shiftKey: true,
            preventDefault: () => undefined,
            stopPropagation: () => undefined,
        });

        expect(state.mathField.selection).to.deep.equal({
            ranges: [[0, 0]],
            direction: 'none',
        });
    });

    it('restores the fallback highlight after MathLive rerenders', () => {
        const methods = loadEditorMethods();
        const state: any = {
            initEquation: methods.initEquation,
            insert: methods.insert,
            restorePlaceholderHighlight: methods.restorePlaceholderHighlight,
            latex: '',
            mathLiveConfig: {},
            mathField: null,
            sendLatex: () => undefined,
        };

        state.initEquation();
        state.insert({ latex: '\\widehat{#?}' });
        state.mathField.selectionOverlay = null;
        mutationObserverCallbacks[0]();

        expect(state.mathField.selectionOverlay).to.include({
            className: 'ML__selection',
        });
    });

    it('keeps the arrow re-selection after MathLive emits a delayed input event', (done) => {
        const methods = loadEditorMethods();
        const state: any = {
            initEquation: methods.initEquation,
            insert: methods.insert,
            restorePlaceholderHighlight: methods.restorePlaceholderHighlight,
            latex: '',
            mathLiveConfig: {},
            mathField: null,
            sendLatex: () => undefined,
        };

        state.initEquation();
        state.mathField.delayedInput = true;
        state.insert({ latex: '\\widehat{#?}' });
        setTimeout(() => {
            try {
                state.mathField.selection = {
                    ranges: [[0, 0]],
                    direction: 'none',
                };
                state.mathField.dispatch('keydown', {
                    key: 'ArrowRight',
                    preventDefault: () => undefined,
                    stopPropagation: () => undefined,
                });

                expect(state.mathField.selection).to.deep.equal({
                    ranges: [[1, 2]],
                    direction: 'none',
                });
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});
