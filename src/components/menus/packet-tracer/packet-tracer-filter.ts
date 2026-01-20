import { UltraComponent } from "@/ultra-light/ultra-light";
import styles from './packet-tracer.module.css'

export default function FilterTraffic({
    setFilter,
    onFilterbyDevice,
    onClean
}: {
    setFilter: (value: string) => void;
    onFilterbyDevice: () => void
    onClean: () => void
}) {

    function onInput(event: Event) {
        const $input = event.target as HTMLInputElement;
        setFilter($input.value);
    }

    return UltraComponent({

        component: `<div class="${styles['filter-traffic']}"></div>`,

        children: [

            UltraComponent({
                component: '<input type="text" id="filter"/>',
                className: [styles['filter-input']],
                eventHandler: {
                    'input': onInput
                }
            }),

            UltraComponent({
                component: '<button class="btn-blue" id="clean-traffic-button">Clear</button>',
                eventHandler: { click: onClean }
            }),

            UltraComponent({
                component: '<div></div>',
                className: [styles['options-group']],
                children: [
                    '<input type="checkbox" id="exclude-layer-2-devices" class="btn-toggle"/>',
                    '<label for="exclude-layer-2-devices">Exclude Layer 2 devices</label>'
                ],
                eventHandler: { change: onFilterbyDevice }
            })

        ]

    })

}