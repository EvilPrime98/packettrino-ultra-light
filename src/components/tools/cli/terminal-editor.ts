import { UltraActivity, UltraComponent } from "ultra-light.js";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import styles from './terminal.module.css';
import { nano_write } from "@/commands/nano";

export default function TerminalEditor({
    getEditorState,
    setEditorState,
    subscribeToEditorState,
    getEditorContent,
    setEditorContent,
    subscribeToEditorContent
}: {
    getEditorState: () => boolean;
    setEditorState: (value: boolean) => void;
    subscribeToEditorState: (fn: (value: boolean) => void) => () => void;
    getEditorContent: () => string;
    setEditorContent: (value: string) => void;
    subscribeToEditorContent: (fn: (value: string) => void) => () => void;
}) {

    function onKeydown(event: Event){

        const kEvent = event as KeyboardEvent;
        const $textArea = kEvent.target as HTMLTextAreaElement;

        kEvent.stopPropagation();

        if (kEvent.ctrlKey && kEvent.key === 's') {
            kEvent.preventDefault();
            onSave();
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

    function updateEditorContent(self: HTMLElement) {
        const $textArea = self as HTMLTextAreaElement;
        $textArea.value = getEditorContent();
    }

    function onSave(){
        
        const elementAPI = tCtx.get().elementAPI;
        if (!elementAPI) return;
                
        nano_write(
            elementAPI, 
            tCtx.get().editorPath, 
            getEditorContent()
        );

    }

    function onInput(event: Event){
        const $textArea = event.target as HTMLTextAreaElement;
        setEditorContent($textArea.value);
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
                    'keydown': onKeydown,
                    'input': onInput
                },
                trigger: [
                    { subscriber: tCtx.subscribe, triggerFunction: onContextChange },
                    { subscriber: subscribeToEditorContent, triggerFunction: updateEditorContent }
                ]
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