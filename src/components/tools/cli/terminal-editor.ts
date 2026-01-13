import { UltraComponent } from "@ultra-light";

export default function TerminalEditor() {

    // $terminal.querySelector(".file-editor-error").addEventListener("mousedown", event => { event.stopPropagation(); });
    // $terminal.querySelector(".file-editor-error").addEventListener("mouseup", event => { event.stopPropagation(); });
    // $terminal.querySelector(".file-editor").addEventListener("mousedown", event => { event.stopPropagation(); });
    // $terminal.querySelector(".file-editor").addEventListener("mouseup", event => { event.stopPropagation(); });
    // $terminal.querySelector(".file-editor").addEventListener("click", event => { event.stopPropagation(); });
    // $terminal.querySelector(".file-editor").addEventListener("dragstart", event => { event.stopPropagation(); });
    // $terminal.querySelector(".file-editor").addEventListener("keydown", fileEditorKeyboard);

    return (
        UltraComponent({
            component: `
            <div class="editor-wrapper" style="display: none;">
                <div class="editor-buttons">
                    <p><span>^S</span>Guardar y Salir</p>
                </div>
                <p class="file-editor-error"></p>
                <textarea class="file-editor" data-file=""></textarea>
                <div class="editor-frame"> <span></span>       
            </div>
            `
        })
    )
}