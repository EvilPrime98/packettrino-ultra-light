import { FormInput } from "@/components/core/form-input"
import { UltraActivity, ultraState } from "ultra-light.js";
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
    const [getLeaseTime, setLeaseTime, subscribeToLeaseTime] = ultraState<number>(0);
    let leaseTimeUnsubscribe: () => void;

    /**
     * Executes when:
     * - the PC Menu context changes
     * @returns 
     */
    function onContextChange() {
        if (!pmCtx.get().isVisible) {
            onCleanup();
            setVisible(false);
            return;
        }
    }

    /**
     * Executes: 
     * - on initial load
     * - when the selected interface changes.
     */
    function dhcpClientHandler() {
        
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        
        if (!hasDHCPClient(elementAPI)) {
            onCleanup();
            setVisible(false);
            return;
        }

        setVisible(true);
        
        const dhcpIfaces = elementAPI.dhcpClient.getDhcpIfaces();
        const currIface = fields.iface.get();
        
        if (!dhcpIfaces.includes(currIface)) {
            onCleanup();
            return;
        }
        
        setDhcpEnabled(true);
        blockFields(true);

        const lease = elementAPI.dhcpClient.getLeases()
        .find(lease => lease.ifaceId === currIface);

        if (lease) {
            setLeaseTime(lease.leasetime);
            leaseTimeUnsubscribe = elementAPI.dhcpClient.subscribeToLeases(() => {
                setLeaseTime(lease.leasetime);
            })
        }else{
            setLeaseTime(0);
            leaseTimeUnsubscribe();
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
     * In case the interfaces gets a lease, it updates the lease time.
     * @returns 
     */
    async function onSearch() {
        setSearching(true);
        await onDhcpProcess();
        setSearching(false);
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        if (!hasDHCPClient(elementAPI)) return;
        const leases = elementAPI.dhcpClient.getLeases();
        const lease = leases.find(lease => lease.ifaceId === fields.iface.get());
        if (lease) {
            setLeaseTime(lease.leasetime);
            leaseTimeUnsubscribe = elementAPI.dhcpClient.subscribeToLeases(() => {
                setLeaseTime(lease.leasetime);
            })
        }
    }

    /**
     * Executes when the lease time (if there is one) changes.
     * @param self 
     */
    function updateLeaseTime(
        self: HTMLElement
    ) {
        const $span = self as HTMLSpanElement;
        const leaseTime = getLeaseTime();
        $span.innerText = (leaseTime > 0) ? `${leaseTime}s` : 'Search';
    }

    function onCleanup() {
        blockFields(false);
        setDhcpEnabled(false);
        setLeaseTime(0);
        leaseTimeUnsubscribe?.();
    }

    return UltraActivity({

        mode: {
            state: getVisible,
            subscriber: subscribeToVisible
        },

        component: FormInput({

            id: 'dhcp-client-field',
            name: 'dhcp-client-field',
            label: 'DHCP Client',
            type: 'checkbox',
            className: [styles['dhcp-client-field']],
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
                        },
                        {
                            subscriber: subscribeToLeaseTime,
                            triggerFunction: ($button: HTMLElement) => {
                                ($button as HTMLButtonElement).disabled = getLeaseTime() > 0;
                            }
                        }
                    ],
                    children: [

                        UltraActivity({
                            mode: { state: () => !isSearching(), subscriber: subscribeToSearching },
                            component: '<span>Search</span>',
                            trigger: [
                                { subscriber: subscribeToLeaseTime, triggerFunction: updateLeaseTime }
                            ]
                        }),

                        UltraActivity({
                            mode: { state: isSearching, subscriber: subscribeToSearching },
                            component: Loader({ size: 20, border: 3 }),
                        })

                    ]
                })

            ]

        }),

        trigger: [
            {
                subscriber: pmCtx.subscribe,
                triggerFunction: onContextChange,
                defer: true
            },
            {
                subscriber: fields.iface.subscribe,
                triggerFunction: dhcpClientHandler
            }
        ]

    })

}