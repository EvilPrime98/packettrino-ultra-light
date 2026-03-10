import { IRoutingRule } from "@/types/TConfig";
import { UltraActivity, UltraComponent, UltraLightElement, ultraState } from "ultra-light.js";
import styles from './router-menu.module.css';
import { ip_route } from "@/services/routing_service";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { ROUTER_MENU_CTX as rmCtx } from "@/context/router-menu-context";
import { encodeCidr } from "@/utils/network_lib";
import CrossIcon from "@/components/icons/cross-icon";

export interface IRouterMenuRoutingFields {
    destinationIp: string;
    gatewayIface: string;
    nextHop: string;
}

export default function RoutingRulesSection({
    onRoutingRulesChange,
    getRoutingRules,
    subscribeToRoutingRules
}: {
    onRoutingRulesChange: () => void;
    getRoutingRules: () => IRoutingRule[];
    subscribeToRoutingRules: (fn: (value: IRoutingRule[]) => void) => () => void;
}) {

    const [getFields, setFields] = ultraState<IRouterMenuRoutingFields>({
        destinationIp: "",
        gatewayIface: "",
        nextHop: ""
    })

    const [
        hasRoutingRules, 
        setHasRoutingRules, 
        subscribeToHasRoutingRules
    ] = ultraState<boolean>(false);

    function updateRulesTable(self: UltraLightElement) {
        const rules = getRoutingRules();
        const $tBody = self as HTMLTableElement;
        try {
            $tBody.replaceChildren(
                ...rules.map(rule => RoutingRuleRow(rule, onDelRule))
            );
            setHasRoutingRules(rules.length > 0);
        } catch (error) {
            console.error('Error al actualizar la tabla de reglas:', error);
        }
    }

    function onFieldsChange(field: keyof IRouterMenuRoutingFields, value: string) {
        setFields({
            ...getFields(),
            [field]: value
        });
    }

    function onAddRule() {

        try {

            const routerAPI = rmCtx.get().routerElementAPI;

            if (!routerAPI) return;

            const { destinationIp, gatewayIface, nextHop } = getFields();

            if (!destinationIp || !gatewayIface || !nextHop) {
                throw new Error("Some of the fields are empty");
            }

            const result = ip_route(routerAPI, {
                'add': destinationIp,
                'via': nextHop,
                'dev': gatewayIface
            });

            onRoutingRulesChange();

            toCtx.get().createNotification(
                result as string,
                "success"
            )

        } catch (e) {

            toCtx.get().createNotification(
                `Error: ${(e instanceof Error) ? e.message : 'Unknown Error'}`,
                "error"
            )

        }

    }

    function onDelRule(
        rule: IRoutingRule
    ) {

        try {

            const routerAPI = rmCtx.get().routerElementAPI;

            if (!routerAPI) return;

            const {
                destinationIp,
                destinationNetmask,
                iface,
                nextHop
            } = rule;

            ip_route(routerAPI, {
                'del': encodeCidr(destinationIp, destinationNetmask),
                'via': nextHop,
                'dev': iface
            });

            onRoutingRulesChange();

            toCtx.get().createNotification(
                `Rule to ${destinationIp} deleted`,
                "success"
            )

        } catch (e) {

            toCtx.get().createNotification(
                `Error: ${(e instanceof Error) ? e.message : 'Unknown Error'}`,
                "error"
            )

        }

    }

    return UltraComponent({

        component: (`<section id="routing-rules-section"></section>`),

        children: [

            UltraComponent({

                component: (`
                    <div class="${styles['form-item']}">
                        <label for="destination-ip">Destination IP (CIDR):</label>
                    </div>
                `),

                children: [

                    UltraComponent({

                        component: (`
                            <input 
                                type="text" 
                                id="destination-ip" 
                                name="destination-ip" 
                                placeholder="192.168.0.0/24"
                            />`
                        ),

                        eventHandler: {
                            'input': (event: Event) => onFieldsChange(
                                'destinationIp',
                                (event.target as HTMLInputElement).value
                            )
                        }

                    })

                ]

            }),

            UltraComponent({

                component: (`
                    <div class="${styles['form-item']}">
                        <label for="gateway-interface">Gateway Interface:</label>
                    </div>
                `),

                children: [

                    UltraComponent({

                        component: (`
                            <input 
                                type="text" 
                                id="gateway-interface" 
                                name="gateway-interface" 
                                placeholder="enp0s3"
                            />
                        `),

                        eventHandler: {
                            'input': (event: Event) => onFieldsChange(
                                'gatewayIface',
                                (event.target as HTMLInputElement).value
                            )
                        }

                    })

                ]

            }),

            UltraComponent({

                component: (`
                    <div class="${styles['form-item']}">
                        <label for="nexthop">Next Hop:</label>
                    </div>
                `),

                children: [

                    UltraComponent({

                        component: (`
                            <input 
                                type="text" 
                                id="nexthop" 
                                name="nexthop" 
                                placeholder="0.0.0.0"
                            />
                        `),

                        eventHandler: {
                            'input': (event: Event) => onFieldsChange(
                                'nextHop',
                                (event.target as HTMLInputElement).value
                            )
                        }

                    })

                ]

            }),

            UltraComponent({

                component: (`<div class="${styles['form-item']}"></div>`),

                children: [

                    UltraComponent({
                        component: `<button id="btn-add-rule">Add Rule</button>`,
                        styles: { 'padding': '10px' },
                        className: ['btn-modern-blue', 'dark'],
                        eventHandler: { 'click': onAddRule }
                    })

                ]

            }),

            UltraActivity({
                mode: {
                    state: hasRoutingRules,
                    subscriber: subscribeToHasRoutingRules
                },
                component: '<div></div>',
                className: [styles['table-wrapper']],
                children: [
                    UltraComponent({
                        component: `<table id="routing-rules-table"></table>`,
                        className: [styles['inner-table']],
                        children: [
                            '<thead><tr><th>Destination</th><th>Gateway</th><th>Next Hop</th></tr></thead>',
                            UltraComponent({
                                component: `<tbody></tbody>`,
                                trigger: [
                                    { subscriber: subscribeToRoutingRules, triggerFunction: updateRulesTable }
                                ]
                            })
                        ]
                    })
                ]
            })

        ]

    })

}

function RoutingRuleRow(
    rule: IRoutingRule,
    onDeleteRule: (rule: IRoutingRule) => void
) {

    const cidrDestination = encodeCidr(rule.destinationIp, rule.destinationNetmask);
    const isDirectRoutingRule = rule.nextHop === '0.0.0.0';

    return UltraComponent({

        component: (`
            <tr>
                <td>${cidrDestination}</td>
                <td>${rule.gateway}</td>       
            </tr>
        `),

        children: [

            UltraComponent({

                component: `<td></td>`,

                className: [styles['delete-cell']],

                children: [

                    `<span>${rule.nextHop}</span>`,

                    isDirectRoutingRule ? null : UltraComponent({
                        
                        component: CrossIcon({
                            size: 20,
                            color: 'red',
                            className: styles['delete-cell-icon'],
                        }),

                        eventHandler: {
                            'click': () => onDeleteRule(rule)
                        }

                    }),

                ]

            })

        ]

    })

}