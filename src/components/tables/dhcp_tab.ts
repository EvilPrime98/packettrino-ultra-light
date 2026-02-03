import { TLayer3Config } from "@/types/TConfig";
import { hasDHCPServer } from "@/types/typeguards";
import { UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";

export function DhcpLeasesTable({
    onClose,
    serverAPI
}: {
    onClose: () => void;
    serverAPI: TLayer3Config;
}) {

    if (!hasDHCPServer(serverAPI)) {
        return UltraComponent({
            component: '<article></article>'
        })
    }

    const [,setLeaseIps,] = ultraState<string[]>([]);
    const trackedIps = new Set<string>();
    
    function onMount($table: UltraLightElement){
        
        if (!hasDHCPServer(serverAPI)) return;
        
        serverAPI.dhcpserver.subscribeToLeases(() => {
            updateLeases($table);
        });

        updateLeases($table);

    }

    function updateLeases($tbody: HTMLElement) {

        if (!hasDHCPServer(serverAPI)) return;
        const currentLeases = serverAPI.dhcpserver.getLeases();
        const newIps: string[] = [];

        for (const ip in currentLeases) {
            if (!trackedIps.has(ip)) {
                trackedIps.add(ip);
                newIps.push(ip);
            }
        }

        if (newIps.length > 0) {
            const fragment = document.createDocumentFragment();
            newIps.forEach(ip => {
                fragment.appendChild(
                    DhcpLeasesTableRow({ ip, serverAPI })
                );
            });
            $tbody.appendChild(fragment);
            setLeaseIps([...trackedIps]);
        }

    };

    return UltraComponent({

        component: '<article></article>',

        className: ['modal-table', 'dhcp-table'],

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
                        onMount: [onMount]
                    })

                ]
            }),

            UltraComponent({
                component: '<button>Close</button>',
                className: ['close-button'],
                eventHandler: {'click': onClose}
            })

        ],

        eventHandler: {
            'click': (event: Event) => {
                event.stopPropagation();
            }
        }

    });

}

function DhcpLeasesTableRow({
    ip,
    serverAPI
}: {
    ip: string;
    serverAPI: TLayer3Config;
}) {

    if (!hasDHCPServer(serverAPI)) {
        return UltraComponent({
            component: '<tr></tr>'
        })
    }

    const {
        mac,
        leaseTime: initLeaseTime
    } = serverAPI.dhcpserver.getLeases()[ip];

    const onLeaseTimeChange = ($td: UltraLightElement) => {
        const leases = serverAPI.dhcpserver.getLeases();
        const lease = leases[ip];
        if (!lease) {
            $td._cleanup?.();
            $td.remove();
            return;
        }
        $td.innerText = lease.leaseTime.toString();
    }

    return UltraComponent({

        component: '<tr></tr>',

        children: [

            UltraComponent({
                component: `<td>${ip}</td>`
            }),

            UltraComponent({
                component: `<td>${mac}</td>`
            }),

            UltraComponent({
                component: `<td>${initLeaseTime}</td>`,
                trigger: [{
                    subscriber: serverAPI.dhcpserver.subscribeToLeases,
                    triggerFunction: onLeaseTimeChange
                }]
            })

        ]

    })

}