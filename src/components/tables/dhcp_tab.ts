import { UltraComponent } from "@/ultra-light/ultra-light";

export function DhcpLeasesTable({
    onClose
}: {
    onClose: () => void;
}) {

    return UltraComponent({
        
        component: '<article></article>',
        
        className: [
            'modal-table',
            'dhcp-table'
        ],
        
        children: [
            
            UltraComponent({
                
                component: '<table></table>',
                
                children: [
                    
                    `<thead>
                        <tr>
                            <th>IP</th>
                            <th>MAC</th>
                            <th>Lease Time</th>
                        </tr>
                    </thead>`,

                    UltraComponent({
                        component: '<tbody></tbody>',
                    })
                ]

            }),

            UltraComponent({
                component: '<button>Close</button>',
                className: ['close-button'],
                eventHandler: {
                    'click': onClose
                }
            })
        ],

        eventHandler: {
            'click': (event: Event) => {
                event.stopPropagation();
            }
        }

    })
    
}