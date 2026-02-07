import { FormInput } from "@/components/core/form-input"
import { UltraActivity, UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import styles from './pc-menu.module.css'
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import { hasDHCPClient } from "@/types/typeguards";
import { IUltraPcFields } from "./pc-menu";
import { sendDHCPDiscover } from "@/services/isc-dhcp-service";

export function DhcpClientField({
    fields,
    onDhcpClientChange
}: {
    fields: IUltraPcFields,
    onDhcpClientChange: ($input: HTMLInputElement) => void
}) {

    const [getVisible, setVisible, subscribeToVisible] = ultraState<boolean>(false);
    const [isDhcpEnabled, setDhcpEnabled, subscribeToDhcpEnabled] = ultraState<boolean>(false);

    function onLoad() {
        if (!pmCtx.get().isVisible) {
            onCleanup();
            return;
        }
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        if (!hasDHCPClient(elementAPI)) {
            setVisible(false);
            setDhcpEnabled(false);
            return;
        }
        setVisible(true);
        const dhcpIfaces = elementAPI.dhcpClient.getDhcpIfaces();
        setDhcpEnabled(
            dhcpIfaces.includes(fields.get('iface'))
        );
    }

    function onChange(
        event: Event
    ) {
        const $input = event.target as HTMLInputElement;
        setDhcpEnabled($input.checked);
        onDhcpClientChange($input);
    }

    function onCleanup() {
        setVisible(false);
        setDhcpEnabled(false);
    }

    async function onSearch() {
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        await sendDHCPDiscover(
            elementAPI,
            fields.get('iface')
        )
    }

    return UltraActivity({

        mode: {
            state: getVisible,
            subscriber: subscribeToVisible
        },

        component: UltraComponent({

            component: '<div></div>',

            className: [styles['dhcp-client-field']],

            children: [

                FormInput({
                    
                    id: 'dhcp-client-field',
                    name: 'dhcp-client-field',
                    label: 'DHCP Client',
                    type: 'checkbox',
                    className: [styles['form-item']],
                    
                    getValue: isDhcpEnabled,
                    
                    changeSubscriber: subscribeToDhcpEnabled,
                    
                    onChange: onChange,
                    
                    adTriggers: [
                        {
                            subscriber: pmCtx.subscribe,
                            triggerFunction: onLoad,
                            defer: true
                        }
                    ],

                    adChildren: [
                        UltraActivity({
                            mode: { state: isDhcpEnabled, subscriber: subscribeToDhcpEnabled },
                            component: '<button type="button">Search</button>',
                            className: ['btn-modern-blue', 'small'],
                            eventHandler: { click: onSearch },
                            type: 'visibility'
                        })
                    ]

                }),

            ]

        }),

    })

}