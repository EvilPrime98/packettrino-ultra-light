import { IRoutingRule } from "@/types/TConfig";
import { UltraComponent, UltraLightElement, ultraState } from "@/ultra-light/ultra-light";
import styles from './router-menu.module.css';
import { ip_route } from "@/services/routing_service";
import { TOASTER_CONTEXT as toCtx } from "@/components/core/toaster";
import { ROUTER_MENU_CTX as rmCtx } from "@/context/router-menu-context";

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

    function updateRulesTable(self: UltraLightElement) {
        const rules = getRoutingRules();
        const $table = self as HTMLTableElement;
        $table.innerHTML = "";
        rules.forEach(rule => {
            $table.appendChild(RoutingRuleRow(rule));
        });
    }

    function onFieldsChange(field: keyof IRouterMenuRoutingFields, value: string) {
        setFields({
            ...getFields(),
            [field]: value
        });
    }

    function onAddRule(){

        try {
            
            const routerAPI = rmCtx.get().routerElementAPI;

            if (!routerAPI) return;

            const { destinationIp, gatewayIface, nextHop } = getFields();

            ip_route(routerAPI, {
                'add': destinationIp,
                'via': nextHop,
                'dev': gatewayIface
            });

            onRoutingRulesChange();

            toCtx.get().createNotification(
                `Rule to ${destinationIp} added`,
                "success"
            )

        }catch(e){
            
            toCtx.get().createNotification(
                `Error: ${(e instanceof Error) ? e.message : 'Unknown Error'}`,
                "error"
            )

        }

    }

    function onDelRule(){
        
        try {

            const routerAPI = rmCtx.get().routerElementAPI;

            if (!routerAPI) return;

            const { destinationIp, gatewayIface, nextHop } = getFields();

            ip_route(routerAPI, {
                'del': destinationIp,
                'via': nextHop,
                'dev': gatewayIface
            });

            onRoutingRulesChange();

            toCtx.get().createNotification(
                `Rule to ${destinationIp} deleted`,
                "success"
            )

        }catch(e){
            
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
                        component: `<button class="btn-modern-blue dark" style="padding: 10px;" id="btn-add-rule">Añadir Regla</button>`,
                        eventHandler: { 'click': onAddRule }
                    }),

                    UltraComponent({
                        component: `<button class="btn-modern-red dark" style="padding: 10px;" id="btn-del-rule">Eliminar Regla</button>`,
                        eventHandler: { 'click': () => onDelRule() }
                    })

                ]

            }),

            UltraComponent({

                component: (`<div class="${styles['table-wrapper']}"></div>`),

                children: [

                    UltraComponent({
                        component: `<table id="routing-rules-table" class="${styles['inner-table']}"></table>`,
                        trigger: [
                            { subscriber: subscribeToRoutingRules, triggerFunction: updateRulesTable }
                        ]
                    })

                ]
                
            })

        ]

    })

}

function RoutingRuleRow(rule: IRoutingRule){
    return UltraComponent({
        component: (`
            <tr>
                <td>${rule.destinationIp}</td>
                <td>${rule.gateway}</td>
                <td>${rule.nextHop}</td>
            </tr>
        `)
    })
}