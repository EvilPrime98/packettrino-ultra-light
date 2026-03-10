import { IRoutingRule } from "@/types/TConfig";
import { UltraComponent, UltraLightElement } from "ultra-light.js";

export function RoutingTable({
    onClose,
    routingRules,
    subscribeToRoutingRules
}: {
    onClose: () => void;
    routingRules: () => IRoutingRule[];
    subscribeToRoutingRules: (fn: (value: IRoutingRule[]) => void) => () => void;
}) {

    function handleRoutingRules(self: UltraLightElement) {
        self.innerHTML = '';
        routingRules().forEach(rule =>
            self.appendChild(RoutingRuleRow(rule))
        );
    }

    return UltraComponent({

        component: '<article class="modal-table routing-table"></article>',

        children: [

            UltraComponent({

                component: (`
                    <table>
                        <thead>
                            <th>Destination Network</th>
                            <th>Destination Netmask</th>
                            <th>Gateway</th>
                            <th>Interface</th>
                            <th>Next Hop</th>
                        </thead>
                    </table>
                `),

                children: [

                    UltraComponent({
                        component: '<tbody></tbody>',
                        children: [
                            ...routingRules().map(rule =>
                                RoutingRuleRow(rule)
                            )
                        ],
                        trigger: [{
                            subscriber: subscribeToRoutingRules,
                            triggerFunction: handleRoutingRules
                        }]
                    })

                ],

            }),

            UltraComponent({
                component: `<button class="close-button">Close</button>`,
                eventHandler: {
                    'click': (event: Event) => {
                        event.stopPropagation();
                        onClose();
                    }
                }
            })

        ],

        eventHandler: {
            'click': (event: Event) => {
                event.stopPropagation();
            }
        },

    });

}

function RoutingRuleRow(
    routingRule: IRoutingRule
) {
    return UltraComponent({
        component: (`
            <tr>
                <td>${routingRule.destinationIp}</td>
                <td>${routingRule.destinationNetmask}</td>
                <td>${routingRule.gateway}</td>
                <td>${routingRule.iface}</td>
                <td>${routingRule.nextHop}</td>
            </tr>
        `),
    })
}