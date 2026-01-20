import { UltraComponent, UltraTrigger } from "@ultra-light";
import styles from "./settings.module.css";
import { UltraLightElement, UltraRenderableElement } from "@/ultra-light/types";

interface IOptionProps {
    /**
     * The input type of the option. Default is 'text'.
     */
    type?: 'checkbox'|'range'|'text';
    /**
     * The id of the input element.
     */
    id: string;
    /**
     * The label of the option.
     */
    label: string;
    /**
     * Optional function to be called when the input value changes.
     */
    onChange?: (event: Event) => void;
    /**
     * Optional function to be called when the input value changes.
     */
    onInput?: (event: Event) => void;
    /**
     * Optional array of triggers to be subscribed to.
     */
    triggers?: UltraTrigger[];
    /**
     * Optional array of children components. They will be rendered as 
     * SIBLINGS to the input element.
     */
    children?: (UltraRenderableElement | Node | UltraLightElement)[];
    /**
     * Optional object containing the range properties. Only used when type is 'range'.
     */
    range?: {
        min: number;
        max: number;
        value: number;
    }
}

/**
 * Returns a component that represents an option in the settings menu. It's made of
 * a label, an input, and a checkbox or a range.
 * @param param0 
 * @returns 
 */
export default function Option({
    type = 'text',
    id,
    label,
    onChange,
    onInput,
    triggers = [],
    children = [],
    range = {
        min: 0,
        max: 100,
        value: 0
    }
}: IOptionProps) {

    const eventHandlers: Record<string, EventListenerOrEventListenerObject> = {};

    if (onChange) eventHandlers['change'] = (event: Event) => {
        onChange(event);
    }

    if (onInput) eventHandlers['input'] = (event: Event) => {
        onInput(event);
    }

    if (type === 'checkbox') {

        return UltraComponent({

            component: `<div class="${styles['options-group']}"></div>`,

            children: [

                `<label for="${id}"> ${label} </label>`,

                UltraComponent({

                    component: (`
                        <input 
                            type="checkbox" 
                            class="btn-toggle"
                            id="${id}"
                            name="${id}"
                        />
                    `),

                    eventHandler: eventHandlers,
                    
                    trigger: triggers

                }),

                ...children

            ]

        })
        
    }

    if (type === 'range') {

        return UltraComponent({

            component: `<div class="${styles['options-group']}"></div>`,

            children: [

                `<label for="${id}"> ${label} </label>`,

                UltraComponent({

                    component: (`
                        <input 
                            type="range" 
                            class="btn-input" 
                            id="${id}" 
                            name="${id}" 
                            min="${range.min}" 
                            max="${range.max}"
                            value="${range.value}"
                        />
                    `),

                    eventHandler: eventHandlers,

                    trigger: triggers

                }),

                ...children

            ]

        })

    }

    return UltraComponent({

        component: `<div class="${styles['options-group']}"></div>`,

        children: [

            `<label for="${id}"> ${label} </label>`,

            UltraComponent({

                component: (`
                    <input 
                        type="text" 
                        class="btn-input" 
                        id="${id}" 
                        name="${id}"
                    />
                `),

                eventHandler: eventHandlers,

                trigger: triggers

            }),

            ...children

        ]

    })

}