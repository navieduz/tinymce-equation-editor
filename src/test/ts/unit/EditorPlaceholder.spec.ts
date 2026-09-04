import { expect } from 'chai';

declare const require: any;

class FakeMathfield {
    public selection = { ranges: [[0, 0]], direction: 'none' };
    public shadowRoot = {
        querySelector: (selector: string) =>
            selector === '.ML__selected'
                ? {
                      getBoundingClientRect: () => ({
                          bottom: 20,
                          left: 10,
                          right: 30,
                          top: 10,
                      }),
                  }
                : null,
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

    const context = {
        MathLive: {
            convertLatexToMarkup: () => '',
            renderMathInDocument: () => undefined,
        },
        MathfieldElement() {
            return new FakeMathfield();
        },
        Vue(value) {
            options = value;
            return value;
        },
        document: {
            getElementById: () => ({ appendChild: () => undefined }),
        },
        setTimeout: () => undefined,
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
});
