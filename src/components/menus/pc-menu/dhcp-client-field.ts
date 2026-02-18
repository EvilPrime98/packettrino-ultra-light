import { FormInput } from "@/components/core/form-input"
import { UltraActivity, UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import styles from './pc-menu.module.css'
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import { hasDHCPClient } from "@/types/typeguards";
import { IUltraPcFields } from "./pc-menu";
import { Loader } from "@/components/core/loader";

export function DhcpClientField({
    fields,
    blockFields,
    onDhcpClientChange,
    onDhcpProcess
}: {
    /**
     * The fields reducer object from the PC Menu component.
     */
    fields: IUltraPcFields,
    /**
     * Blocks the form fields.
     */
    blockFields: () => void,
    /**
     * A function that is called when the DHCP client checkbox state changes.
     */
    onDhcpClientChange: ($input: HTMLInputElement) => void
    /**
     * A function that is called when the DHCP process button is clicked.
     */
    onDhcpProcess: () => Promise<void>
}) {

    //State that indicates whether the DHCP client field should be visible or not.
    const [getVisible, setVisible, subscribeToVisible] = ultraState<boolean>(false);
    //State that indicates whether the DHCP client is enabled or not for the interface.
    const [isDhcpEnabled, setDhcpEnabled, subscribeToDhcpEnabled] = ultraState<boolean>(false);
    //State that indicates if there's a dhcp process running.
    const [isSearching, setSearching, subscribeToSearching] = ultraState<boolean>(false);

    /**
     * This function is called when the PC Menu context changes.
     * @returns 
     */
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

        if (dhcpIfaces.includes(fields.get('iface'))) {
            setDhcpEnabled(true);
            blockFields();
        }
        
    }

    /**
     * This function is called when the DHCP client checkbox state changes.
     * @param event 
     */
    function onChange(
        event: Event
    ) {
        const $input = event.target as HTMLInputElement;
        setDhcpEnabled($input.checked);
        onDhcpClientChange($input);
    }

    /**
     * Cleans up the DHCP client field and sets its states to their initial values.
     */
    function onCleanup() {
        setVisible(false);
        setDhcpEnabled(false);
    }

    /**
     * Starts a DHCP (discover) process on the selected interface.
     * @returns 
     */
    async function onSearch() {
        setSearching(true);
        await onDhcpProcess();
        setSearching(false);
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
                            type: 'visibility',
                            component: '<button type="button"></button>',
                            className: ['btn-modern-blue', 'small'],
                            eventHandler: { click: onSearch },
                            trigger: [
                                {
                                    subscriber: subscribeToSearching,
                                    triggerFunction: ($button: HTMLElement) => {
                                        ($button as HTMLButtonElement).disabled = isSearching();
                                    }
                                }
                            ],
                            children: [

                                UltraActivity({
                                    mode: { state: () => !isSearching(), subscriber: subscribeToSearching },
                                    component: '<span>Search</span>',
                                }),

                                UltraActivity({
                                    mode: { state: isSearching, subscriber: subscribeToSearching },
                                    component: Loader({ size: 20, border: 3 }),
                                })

                            ]
                        })

                    ]

                }),

            ]

        }),

    })

}