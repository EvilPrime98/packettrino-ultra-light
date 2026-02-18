import { UltraLightElement, UltraRenderableElement } from "@/ultra-light/types";
import { UltraComponent, UltraTrigger } from "@/ultra-light/ultra-light";

/**
 * Renders a form input element. The default structure is a
 * div element with an optional label and an input element.
 * @param param0
 * @example 
 * FormInput({
 *     id: 'input-id',
 *     name: 'input-name',
 *     label: 'Input Label',
 *     type: 'text',
 *     getValue: () => 'input-value',
 *     changeSubscriber: (fn: (value: any) => void) => () => void,
 *     onInput: (event: Event) => void,
 *     onChange: (event: Event) => void,
 *     className: ['class-1', 'class-2'],
 *     adTriggers: [
 *         { subscriber: subscriber, triggerFunction: triggerFunction }
 *     ],
 *     adChildren: [
 *         <div>Child 1</div>,
 *         <div>Child 2</div>
 *     ]
 * })
 * 
 * The above code will render a div element with the following structure:
 * 
 * <div class="class-1 class-2">
 *     <label for="input-name">Input Label</label>
 *     <input type="text" id="input-id" name="input-name" />
 *     <div>Child 1</div>
 *     <div>Child 2</div>
 * </div>
 * @returns 
 */
export function FormInput({
    id,
    name,
    getValue,
    changeSubscriber,
    onInput,
    onChange,
    className,
    type,
    label,
    adTriggers,
    adChildren,
    disabled,
    disabledSubscriber,
}: {
    /**
     * Unique identifier of the input.
     */
    id: string;
    /**
     * Name of the input.
     */
    name: string;
    /**
     * Stateful function that returns the current value of the input.
     */
    getValue: () => string | number | boolean;
    /**
     * Stateful subscriber function that is triggered when the input value changes.
     */
    changeSubscriber: (fn: (value: any) => void) => () => void;
    /** 
     * Optional event handler for the input element.
     */
    onInput?: (event: Event) => void;
    /**
     * Optional event handler for the input element.
     */
    onChange?: (event: Event) => void;
    /**
     * Optional class names for the input element. These will be applied to the wrapper div.
     */
    className?: string[];
    /**
     * Type of the input. Defaults to "text".
     */
    type?: string;
    /**
     * Optional label for the input.
     */
    label?: string;
    /**
     * Optional aditional triggers for the input. If provided, they will be applied to the input element.
     */
    adTriggers?: UltraTrigger[];
    /**
     * Optional additional children. If provided, they will be rendered as siblings of the input element.
     */
    adChildren?: (Node | UltraRenderableElement | UltraLightElement | null)[] | undefined;
    /**
     * Optional disabled state. If provided, it will be applied to the input element.
     */
    disabled?: () => boolean;
    /**
     * Optional disabled subscriber. If provided, it will be triggered when the disabled state changes.
     */
    disabledSubscriber?: (fn: (value: boolean) => void) => () => void;

}) {

    if (type === 'checkbox') {

        return UltraComponent({

            component: `<div></div>`,

            className: (!className) ? [] : className,

            children: [

                (label) ? `<label for="${name}">${label}</label>` : null,

                UltraComponent({

                    component: (`
                        <input 
                            id="${id}" 
                            name="${name}"
                            type="checkbox" 
                            class="btn-toggle"
                        />
                    `),

                    eventHandler: (onChange) ? { 'change': onChange } : {},

                    trigger: [

                        {
                            subscriber: changeSubscriber,
                            triggerFunction: ($input: HTMLElement) => {
                                ($input as HTMLInputElement).checked = Boolean(getValue());
                            }
                        },

                        ...(disabledSubscriber ? [{
                            subscriber: disabledSubscriber,
                            triggerFunction: ($input: HTMLElement) => {
                                ($input as HTMLInputElement).disabled = disabled ? !disabled() : false;
                            }
                        }] : []),


                        ...adTriggers || []

                    ],

                }),

                ...adChildren || []

            ]

        })

    }

    return UltraComponent({

        component: '<div></div>',

        className: (!className) ? [] : className,

        children: [

            (label) ? `<label for="${name}">${label}</label>` : null,

            UltraComponent({

                component: (`
                    <input 
                        type="${type || 'text'}"
                        id="${id}" 
                        name="${name}"
                        ${disabled?.() ? 'disabled' : ''}
                    />
                `),

                trigger: [

                    {
                        subscriber: changeSubscriber,
                        triggerFunction: ($input: HTMLElement) => {
                            ($input as HTMLInputElement).value = getValue().toString();
                        }
                    },

                    ...(disabledSubscriber ? [{
                        subscriber: disabledSubscriber,
                        triggerFunction: ($input: HTMLElement) => {
                            if (!disabled) return;
                            ($input as HTMLInputElement).disabled = disabled();
                        }
                    }] : []),

                    ...adTriggers || []

                ]

            }),

            ...adChildren || []

        ],

        eventHandler: (onInput) ? { 'input': onInput } : {}

    })

}