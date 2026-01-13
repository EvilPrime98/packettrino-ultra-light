import { TPcElementProperties } from "@/types/TConfig";
import { UltraComponent, UltraLightElement } from "@ultra-light";

export function ARPTable({ 
    onClose,
    arpCache,
    subscribeToProperties
}: { 
    onClose?: () => void ;
    arpCache: () => Record<string, {mac: string, timeOutId: NodeJS.Timeout | null}>;
    subscribeToProperties: (fn: (value: TPcElementProperties) => void) => () => void;
}) {

    const clickHandler = (event: Event) => {
        event.stopPropagation();
        onClose?.();
    }

    const updateTable = (self: UltraLightElement) => {
        
        self.innerHTML = '';
        const currentArpCache = arpCache();
        for (const ip in currentArpCache) {
            self.appendChild(
                UltraComponent({
                    component: `<tr><td>${ip}</td><td>${currentArpCache[ip].mac}</td></tr>`
                })
            );
        }
    }

    return (

        UltraComponent({

            component: `<article class="modal-table arp-table"></article>`,

            children:[

                UltraComponent({
                    
                    component: `<table></table>`,
                    
                    children: [

                        '<thead><tr><th>IP</th><th>MAC</th></tr></thead>',

                        UltraComponent({
                            
                            component: '<tbody></tbody>',
                            
                            children: Object.keys(arpCache()).map(ip => {
                                return UltraComponent({
                                    component: `<tr><td>${ip}</td><td>${arpCache()[ip].mac}</td></tr>`
                                })
                            }),

                            trigger: [{ subscriber: subscribeToProperties, triggerFunction: updateTable }]

                        })

                    ],

                }),

                UltraComponent({
                    component: '<button class="close-button">Close</button>',
                    eventHandler: { 'click': clickHandler }
                })
                
            ],

            eventHandler:{
                'click': (event: Event) => {
                    event.stopPropagation();
                }
            }

        })

    )

}