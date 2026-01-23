import { UltraActivity, UltraComponent } from "@ultra-light";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import styles from './terminal.module.css';

export default function TerminalEditor({
    getEditorState,
    setEditorState,
    subscribeToEditorState
}: {
    getEditorState: () => boolean;
    setEditorState: (value: boolean) => void;
    subscribeToEditorState: (fn: (value: boolean) => void) => () => void;
}) {

    function onKeydown(event: Event){

        const kEvent = event as KeyboardEvent;
        const $textArea = kEvent.target as HTMLTextAreaElement;

        kEvent.stopPropagation();

        if (kEvent.ctrlKey && kEvent.key === 's') {
            kEvent.preventDefault();
            setEditorState(false);
            return;
        }

        if (kEvent.ctrlKey && kEvent.key === 'x') {
            kEvent.preventDefault();
            $textArea.value = '';
            setEditorState(false);
            return;
        }

        if (kEvent.key === 'Tab') {
            kEvent.preventDefault();
            const start = $textArea.selectionStart;
            const end = $textArea.selectionEnd;
            $textArea.value = $textArea.value.substring(0, start) + '\t' + $textArea.value.substring(end);
            $textArea.selectionStart = $textArea.selectionEnd = start + 1;
            return;
        }

        if (kEvent.ctrlKey && kEvent.key === 'a') {
            kEvent.preventDefault();
            const pos = $textArea.selectionStart;
            const text = $textArea.value;
            const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
            $textArea.selectionStart = $textArea.selectionEnd = lineStart;
            return;
        }

        if (kEvent.ctrlKey && kEvent.key === 'e') {
            kEvent.preventDefault();
            const pos = $textArea.selectionStart;
            const text = $textArea.value;
            let lineEnd = text.indexOf('\n', pos);
            if (lineEnd === -1) lineEnd = text.length;
            $textArea.selectionStart = $textArea.selectionEnd = lineEnd;
            return;
        }

        if (kEvent.ctrlKey && kEvent.key === 'k') {
            kEvent.preventDefault();
            const pos = $textArea.selectionStart;
            const text = $textArea.value;
            let lineEnd = text.indexOf('\n', pos);
            if (lineEnd === -1) lineEnd = text.length;
            else lineEnd += 1;
            const cutText = text.substring(pos, lineEnd);
            tCtx.set({ ...tCtx.get(), clipboardLine: cutText });
            $textArea.value = text.substring(0, pos) + text.substring(lineEnd);
            $textArea.selectionStart = $textArea.selectionEnd = pos;
            return;
        }

        if (kEvent.ctrlKey && kEvent.key === 'u') {
            kEvent.preventDefault();
            const clipboardLine = tCtx.get().clipboardLine || '';
            const pos = $textArea.selectionStart;
            const text = $textArea.value;
            $textArea.value = text.substring(0, pos) + clipboardLine + text.substring(pos);
            $textArea.selectionStart = $textArea.selectionEnd = pos + clipboardLine.length;
            return;
        }

        if (kEvent.key === 'Escape') {
            kEvent.preventDefault();
            $textArea.value = '';
            setEditorState(false);
            return;
        }

    }

    function onContextChange(self: HTMLElement) {
        if (tCtx.get().isVisible === false) return;
        const $textArea = self as HTMLTextAreaElement;
        $textArea.focus();
        $textArea.setSelectionRange(0, 0);
    }

    return UltraActivity({

        mode: {
            state: getEditorState,
            subscriber: subscribeToEditorState
        },

        component: '<div></div>',

        className: [
            styles['editor-wrapper'],
        ],

        children: [
            
            UltraComponent({
                component: '<textarea id="file-editor"></textarea>',
                className: [styles['file-editor']],
                eventHandler: {
                    'mousedown': event => event.stopPropagation(),
                    'mouseup': event => event.stopPropagation(),
                    'click': event => event.stopPropagation(),
                    'dragstart': event => event.stopPropagation(),
                    'keydown': onKeydown
                },
                trigger: [{ subscriber: tCtx.subscribe, triggerFunction: onContextChange }]
            }),

            UltraComponent({
                component: '<div></div>',
                className: [styles['editor-buttons']],
                children: [
                    '<p><span>^S</span>Save and Exit</p>',
                    '<p><span>^X</span>Exit</p>',
                    '<p><span>^K</span>Cut Text</p>',
                    '<p><span>^U</span>Uncut Text</p>',
                ]
            })

        ]

    })

}