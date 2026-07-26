interface ContentEditor {
    getContent(): string;
}

export function bindContentPrinter(
    editor: ContentEditor,
    button: HTMLButtonElement,
    output: HTMLTextAreaElement
) {
    button.addEventListener('click', () => {
        output.value = editor.getContent();
    });
}
