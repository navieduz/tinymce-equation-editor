var app = new Vue({
    el: '#app',
    data: {
        defaultGroup: '',
        buttonBar: [],
        buttonGroups: {},
        currentGroup: [],
        mathField: '',
        latex: '',
        mathLiveConfig: {},
        placeholderSelection: null,
        restorePlaceholderOnClick: false,
        placeholderHighlightObserver: null,
    },
    created() {
        if (window.addEventListener) {
            // For standards-compliant web browsers
            window.addEventListener('message', this.getParams, false);
        } else {
            window.attachEvent('onmessage', this.getParams);
        }
    },

    mounted() {
        setTimeout(function() {
            MathLive.renderMathInDocument();
        }, 200);
        window.parent.postMessage(
            {
                mceAction: 'equation-mounted',
                status: true,
            },
            '*'
        );
    },

    methods: {
        collapse(event) {
            event.target.classList.toggle('active');
            var content = event.target.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        },
        getParams(evt) {
            let data = evt.data;
            /*
            console.log('received', data);
            */
            this.defaultGroup = data.equation_editor_group;
            this.buttonBar = data.equation_editor_button_bar;
            this.buttonGroups = data.equation_editor_button_groups;
            this.currentGroup = this.buttonGroups[this.defaultGroup];
            this.latex = data.latex;
            this.mathLiveConfig = data.mathlive_config;
            this.initEquation();
            this.mathField.focus();
        },

        initEquation() {
            this.placeholderHighlightObserver?.disconnect();
            this.placeholderHighlightObserver = null;
            this.mathField = new MathfieldElement();
            this.placeholderSelection = null;
            this.restorePlaceholderOnClick = false;

            this.mathField.addEventListener('input', (ev) => {
                this.placeholderSelection = null;
                this.restorePlaceholderOnClick = false;
                this.latex = this.mathField.getValue();
                this.sendLatex();
            });

            this.mathField.addEventListener(
                'keydown',
                (event) => {
                    if (
                        (event.key !== 'ArrowRight' &&
                            event.key !== 'ArrowLeft') ||
                        event.shiftKey ||
                        event.altKey ||
                        event.ctrlKey ||
                        event.metaKey
                    ) {
                        return;
                    }

                    const placeholder = this.placeholderSelection?.ranges?.[0];
                    const current = this.mathField.selection?.ranges?.[0];
                    if (
                        !placeholder ||
                        !current ||
                        current[0] !== current[1]
                    ) {
                        return;
                    }

                    const returnsToPlaceholder =
                        (event.key === 'ArrowRight' &&
                            current[0] === placeholder[0] - 1) ||
                        (event.key === 'ArrowLeft' &&
                            current[0] === placeholder[1] + 1);
                    if (!returnsToPlaceholder) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();
                    this.mathField.selection = this.placeholderSelection;
                    this.restorePlaceholderHighlight();
                    setTimeout(() => this.restorePlaceholderHighlight(), 0);
                },
                true
            );

            this.mathField.addEventListener(
                'pointerdown',
                (event) => {
                    const selected = this.mathField.shadowRoot?.querySelector(
                        '.ML__selected'
                    );
                    const rect = selected?.getBoundingClientRect();
                    this.restorePlaceholderOnClick = Boolean(
                        this.placeholderSelection &&
                            rect &&
                            event.clientX >= rect.left &&
                            event.clientX <= rect.right &&
                            event.clientY >= rect.top &&
                            event.clientY <= rect.bottom
                    );
                    if (!this.restorePlaceholderOnClick) {
                        this.placeholderSelection = null;
                    }
                },
                true
            );

            this.mathField.addEventListener('click', () => {
                if (this.restorePlaceholderOnClick) {
                    this.mathField.selection = this.placeholderSelection;
                    this.restorePlaceholderHighlight();
                    setTimeout(() => this.restorePlaceholderHighlight(), 0);
                }
                this.restorePlaceholderOnClick = false;
            });

            if (typeof this.mathLiveConfig === 'object') {
                for (const [key, value] of Object.entries(this.mathLiveConfig)) {
                    this.mathField[key] = value;
                }
            }

            if (this.latex) {
                this.mathField.setValue(this.latex);
            }

            document.getElementById('math-field').appendChild(this.mathField);

            const content = this.mathField.shadowRoot?.querySelector(
                '[part="content"]'
            );
            if (content && typeof MutationObserver !== 'undefined') {
                this.placeholderHighlightObserver = new MutationObserver(() => {
                    if (this.placeholderSelection) {
                        this.restorePlaceholderHighlight();
                    }
                });
                this.placeholderHighlightObserver.observe(content, {
                    childList: true,
                    subtree: true,
                });
            }

            this.mathField.inlineShortcuts = {
                ...this.mathField.inlineShortcuts,
                '/': '\\dfrac{#?}{#?}',
            }
        },

        restorePlaceholderHighlight() {
            const root = this.mathField.shadowRoot;
            const content = root?.querySelector('[part="content"]');
            const selected = root?.querySelector('.ML__selected');
            if (!content || !selected || root.querySelector('.ML__selection')) {
                return;
            }

            const contentRect = content.getBoundingClientRect();
            const selectedRect = selected.getBoundingClientRect();
            const selection = document.createElement('div');
            selection.className = 'ML__selection';
            selection.style.position = 'absolute';
            selection.style.left = selectedRect.left - contentRect.left + 'px';
            selection.style.top = selectedRect.top - contentRect.top + 'px';
            selection.style.width = Math.ceil(selectedRect.width) + 'px';
            selection.style.height =
                Math.max(1, Math.ceil(selectedRect.height - 1)) + 'px';
            content.prepend(selection);
        },

        insert(button) {
            if (
                this.mathField.insert(button.latex, {
                    focus: true,
                    selectionMode: 'placeholder',
                })
            ) {
                const preservePlaceholderSelection = () => {
                    const selection = this.mathField.selection;
                    this.placeholderSelection =
                        selection.ranges[0][0] === selection.ranges[0][1]
                            ? null
                            : selection;
                    this.restorePlaceholderHighlight();
                };
                preservePlaceholderSelection();
                setTimeout(preservePlaceholderSelection, 0);
            }
        },

        sendLatex() {
            var content = {
                mceAction: 'equation-update',
                html: MathLive.convertLatexToMarkup(this.latex),
                latex: this.latex,
            }
            //console.info('Send', content);
            window.parent.postMessage(content, '*');
        },
    },
});
