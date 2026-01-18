import { UltraActivity, UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import styles from './note.module.css';
import { AdvancedOptions } from "@/components/core/adv-options";
import type { AdvancedOption } from "@/types/types";
import DragIcon from "@/components/icons/drag-icon";

interface TextObjectProps {
    id: string;
    x: number;
    y: number;
}

export default function TextObject({ id, x, y }: TextObjectProps) {

    const [
        getOptionsState,
        setOptionsState,
        subscribeToOptionsState
    ] = ultraState<boolean>(false);

    const [, setIsDeleting, subscribeIsDeleting] = ultraState<boolean>(false);
    const [currentEvent, setCurrentEvent,] = ultraState<Event | null>(null);

    const options: AdvancedOption[] = [
        { message: "Delete", callback: () => setIsDeleting(true) }
    ];

    function onRightClick(event: Event) {
        event.preventDefault();
        setCurrentEvent(event);
        setOptionsState(true);
    }

    function onDelete(self: UltraLightElement) {
        self._cleanup?.();
        self.remove();
    }

    function onInput(event: Event) {

        const $input = event.target as HTMLInputElement;
        const $textObject = $input.parentElement as HTMLElement;
        const content = $input.value;

        requestAnimationFrame(() => {
            const temp = document.createElement('span');
            temp.style.cssText = `
                visibility: hidden;
                position: absolute;
                white-space: pre;
                font: ${window.getComputedStyle($input).font};
            `;
            temp.textContent = content || 'W';
            document.body.appendChild(temp);
            const { width } = temp.getBoundingClientRect();
            temp.remove();
            const dragIconWidth = 30;
            const newWidth = Math.max(40, width + dragIconWidth + 20);
            $textObject.style.width = `${newWidth}px`;
            $textObject.style.marginLeft = `-${newWidth / 2}px`;
            $textObject.setAttribute("data-text", content);
        });

    }

    function onDragIconMouseDown(event: Event) {

        event.preventDefault();
        const mEvent = event as MouseEvent;
        const $dragIcon = mEvent.currentTarget as HTMLElement;
        const $textObject = $dragIcon.closest('article') as HTMLElement;

        const rect = $textObject.getBoundingClientRect();
        const offsetX = mEvent.clientX - rect.left;
        const offsetY = mEvent.clientY - rect.top;
        const marginLeft = parseFloat(getComputedStyle($textObject).marginLeft) || 0;

        function moveText(moveEvent: Event) {
            const mEvent = moveEvent as MouseEvent;
            document.body.style.cursor = "grabbing";
            const x = mEvent.clientX - offsetX - marginLeft;
            const y = mEvent.clientY - offsetY;
            const maxX = window.innerWidth - $textObject.offsetWidth;
            const maxY = window.innerHeight - $textObject.offsetHeight;
            $textObject.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            $textObject.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        }

        function stopDragging() {
            document.removeEventListener('mousemove', moveText);
            document.removeEventListener('mouseup', stopDragging);
            const input = $textObject.querySelector('input');
            if (input) input.focus();
            document.body.style.cursor = "default";
        }

        document.addEventListener('mousemove', moveText);
        document.addEventListener('mouseup', stopDragging);

    }

    return UltraComponent({

        component: (`
            <article 
                class="${styles['text-annotation']}"
                id="text-${id}"
                data-text=""
            >
            </article>
        `),

        styles: {
            top: `${y}px`,
            left: `${x}px`,
        },

        children: [

            UltraActivity({

                component: AdvancedOptions({
                    onClose: () => setOptionsState(false),
                    contextClickEvent: currentEvent,
                    options: [...options],
                    subscribeAdvOptionsState: subscribeToOptionsState
                }),

                mode: {
                    state: getOptionsState,
                    subscriber: subscribeToOptionsState,
                }

            }),

            UltraComponent({
                component: DragIcon({ size: 30 }),
                eventHandler: {
                    'mousedown': onDragIconMouseDown
                }
            }),

            UltraComponent({

                component: `<input type="text" placeholder="Your Thoughts..." />`,

                eventHandler: {
                    'input': onInput
                }

            })

        ],

        eventHandler: {
            "contextmenu": onRightClick
        },

        trigger: [
            {
                subscriber: subscribeIsDeleting,
                triggerFunction: onDelete
            }
        ]

    });

}