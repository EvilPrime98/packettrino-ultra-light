import { FormInput } from "@/components/core/form-input"
import { UltraActivity, UltraComponent, ultraState } from "@/ultra-light/ultra-light";
import styles from './pc-menu.module.css'
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import { hasDHCPClient } from "@/types/typeguards";
import { Loader } from "@/components/core/loader";
import { IUltraPcFields } from "./pc-menu";

export function DhcpClientField({
    fields,
    blockFields,
    onDhcpClientChange,
    onDhcpProcess
}: {
    /**
     * Composite state object that holds the fields of the PC menu.
     */
    fields: IUltraPcFields,
    /**
     * Blocks/Unblocks the form fields.
     */
    blockFields: (state: boolean) => void,
    /**
     * Executed when the DHCP client checkbox state changes.
     */
    onDhcpClientChange: ($input: HTMLInputElement) => void
    /**
     * Executed when the DHCP process button is clicked.
     */
    onDhcpProcess: () => Promise<void>
}) {

    const [getVisible, setVisible, subscribeToVisible] = ultraState<boolean>(false);
    const [isDhcpEnabled, setDhcpEnabled, subscribeToDhcpEnabled] = ultraState<boolean>(false);
    const [isSearching, setSearching, subscribeToSearching] = ultraState<boolean>(false);

    /**
     * Executes when:
     * - the PC Menu context changes
     * - the selected interface changes
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
            blockFields(false);
        }else{
            setVisible(true);
            const dhcpIfaces = elementAPI.dhcpClient.getDhcpIfaces();
            const currIface = fields.iface.get();
            if (dhcpIfaces.includes(currIface)) {
                setDhcpEnabled(true);
                blockFields(true);
            }else {
                setDhcpEnabled(false);
                blockFields(false);
            }
        }
    }

    /**
     * Executes when the DHCP client checkbox state changes.
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
     * Starts a DHCP (discover) process on the selected interface.
     * @returns 
     */
    async function onSearch() {
        setSearching(true);
        await onDhcpProcess();
        setSearching(false);
    }

    function onCleanup() {
        setVisible(false);
        setDhcpEnabled(false);
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

        trigger: [
            {
                subscriber: pmCtx.subscribe,
                triggerFunction: onLoad,
                defer: true
            },
            { 
                subscriber: fields.iface.subscribe, 
                triggerFunction: onLoad
            }
        ]

    })

}