import { UltraComponent, ultraState, UltraActivity, ultraCompState } from "@ultra-light";
import { PC_MENU_CTX as pmCtx } from "@context/pc-menu-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { PcFormValidator } from "@/schemas/pc-menu-schema";
import InterfaceField from "./interface-field";
import styles from "./pc-menu.module.css";
import BasicButtons from "./basic-buttons";
import { ip_addr } from "@/services/ifaces_service";
import { ip_route } from "@/services/routing_service";
import { encodeCidr } from "@/utils/network_lib";
import PcMenuFrame from "./pc-menu-frame";
import Ipv4Forwarding from "./ipv4-forwarding";
import { DhcpClientField } from "./dhcp-client-field";
import { hasDHCPClient } from "@/types/typeguards";
import { dhcp_service } from "@/services/isc-dhcp-service";
import { FormInput } from "@/components/core/form-input";

export interface IUltraPcFields {
    iface: {
        get: () => string;
        set: (newValue: string) => void;
        subscribe: (fn: (value: string) => void) => () => void;
    };
    ip: {
        get: () => string;
        set: (newValue: string) => void;
        subscribe: (fn: (value: string) => void) => () => void;
    };
    netmask: {
        get: () => string;
        set: (newValue: string) => void;
        subscribe: (fn: (value: string) => void) => () => void;
    };
    gateway: {
        get: () => string;
        set: (newValue: string) => void;
        subscribe: (fn: (value: string) => void) => () => void;
    };
}

export default function PcMenu() {

    const fields: IUltraPcFields = ultraCompState({
        iface: '',
        ip: '',
        netmask: '',
        gateway: ''
    })

    const [eventCleaner, setEventCleaner,] = ultraState<(() => void) | null>(null);
    const [blockedFields, setBlockedFields, subscribeToBlockedFields] = ultraState(false);

    /**
     * Executes when the PC menu is opened. Sets 
     * up the initial values of the fields and starts listening to
     * global events.
     */
    function onStart() {
        setEventCleaner(onGlobalEvents());
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const ifaces = elementAPI.getIfaces();
        const initialIfaceId = Object.keys(ifaces)[0];
        fields.iface.set(initialIfaceId);
        fields.gateway.set(elementAPI.getDefaultGateway());
    }

    /**
     * Keydown event handler.
     * @param event 
     */
    function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") onClose();
        if (event.key === "Enter") onSave();
    }

    /**
     * Executes when the PC menu is closed. Cleans up
     * the state of the PC menu.
     */
    function onClose() {
        onCleanup();
        pmCtx.get().update({
            isVisible: false,
            pcElementAPI: null,
        });
    }

    /**
     * Executes when the user clicks the save button.
     * It validates the input fields and sends a packet to the PC element
     * to update its properties.
     */
    function onSave() {

        if (!pmCtx.get()?.isVisible) return;
        const { pcElementAPI } = pmCtx.get();
        if (!pcElementAPI) return;

        const ip = fields.ip.get();
        const netmask = fields.netmask.get();
        const gateway = fields.gateway.get();
        const ifaceId = fields.iface.get();

        try {

            PcFormValidator({
                newIp: ip,
                newNetmask: netmask,
                newGateway: gateway,
                newDnsServers: []
            });

            ip_addr(pcElementAPI, {
                "add": encodeCidr(ip, netmask),
                "dev": ifaceId
            });

            if (gateway) {
                ip_route(pcElementAPI, {
                    "add": encodeCidr("0.0.0.0", "0.0.0.0"),
                    "via": gateway,
                    "dev": ifaceId
                });
            }

            toCtx.get().createNotification(
                `Interface ${fields.iface.get().toUpperCase()} updated successfully!`,
                'success'
            )

        } catch (error: unknown) {

            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown error';

            toCtx.get().createNotification(
                errorMessage,
                'error'
            )

        }

    }

    /**
     * Executes when the PC menu is opened. It adds global
     * events to the window.
     * @returns A function that removes the added global events from the window.
     */
    function onGlobalEvents() {
        window.addEventListener("keydown", onKeydown);
        return () => {
            window.removeEventListener("keydown", onKeydown);
        }
    }

    /**
     * This function cleans up the state of the PC menu.
     */
    function onCleanup() {
        eventCleaner()?.();
        fields.iface.set("");
        fields.ip.set("");
        fields.netmask.set("");
        fields.gateway.set("");
        setBlockedFields(false);
    }

    /**
     * Executes when the DHCP client checkbox is changed.
     * It enables or disables the DHCP client on the PC element interface.
     * @param $input A node reference to the input element.
     */
    function onDhcpClientChange(
        $input: HTMLInputElement
    ){
        try {
            const elementAPI = pmCtx.get().pcElementAPI;
            if (!elementAPI) return;
            if (!hasDHCPClient(elementAPI)) return;
            if ($input.checked) {
                elementAPI.dhcpClient.addDhcpIface(fields.iface.get()); //TODO: we need to alter the fields
                toCtx.get().createNotification(
                    `DHCP Client enabled on ${fields.iface.get()}`,
                    'success'
                );
            }else {
                elementAPI.dhcpClient.removeDhcpIface(fields.iface.get());
                toCtx.get().createNotification(
                    `DHCP Client disabled on ${fields.iface.get()}`,
                    'success'
                );
            }
            setBlockedFields($input.checked);
        }catch (error) {
            toCtx.get().createNotification(
                (error instanceof Error) ? error.message : 'Unknown error',
                'error'
            );
        }
    }

    /**
     * Executes when the DHCP process button is clicked.
     * It sends a DHCP (discover) packet for the selected interface.
     */
    async function onDhcpProcess(){
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        try {
            await dhcp_service(
                elementAPI,
                fields.iface.get(),
                'discover'
            )
            const ifaces = elementAPI.getIfaces();
            fields.ip.set(ifaces[fields.iface.get()].ip);
            fields.netmask.set(ifaces[fields.iface.get()].netmask);
        } catch (e) {
            toCtx.get().createNotification(
                (e instanceof Error) ? e.message : 'Error while searching DHCP server...',
                'error'
            )
        }
    }

    /**
     * Executes when the interface changes. Updates the fields.
     */
    function onIfaceChange() {
        const elementProperties = pmCtx.get().pcElementAPI;
        if (!elementProperties) return;
        const ifaceId = fields.iface.get();
        const iface = elementProperties.getIfaces()[ifaceId];
        if (!iface) return;
        fields.iface.set(ifaceId);
        fields.ip.set(iface.ip);
        fields.netmask.set(iface.netmask);  
    }

    return UltraActivity({

        mode: {
            state: () => pmCtx.get()?.isVisible,
            subscriber: pmCtx.subscribe
        },

        component: '<form></form>',

        className: ['modal', 'draggable-modal', styles['pc-form']],

        children: [

            PcMenuFrame({ onClose }),

            UltraComponent({
                
                component: `<section class="basic-section"></section>`,
                
                children: [
                    
                    InterfaceField({ fields }),
                    
                    FormInput({
                        id: 'ip-field',
                        name: 'ip-field',
                        label: 'IP(ipv4):',
                        className: [styles['form-item']],
                        getValue: () => fields.ip.get(),
                        changeSubscriber: fields.ip.subscribe,
                        onInput: (event: Event) => {
                            event.stopPropagation();
                            const $input = event.target as HTMLInputElement;
                            fields.ip.set($input.value);
                        },
                        disabled: blockedFields,
                        disabledSubscriber: subscribeToBlockedFields
                    }),

                    FormInput({
                        id: 'netmask-field',
                        name: 'netmask-field',
                        label: 'Netmask:',
                        className: [styles['form-item']],
                        getValue: () => fields.netmask.get(),
                        changeSubscriber: fields.netmask.subscribe,
                        onInput: (event: Event) => {
                            event.stopPropagation();
                            const $input = event.target as HTMLInputElement;
                            fields.netmask.set($input.value);
                        },
                        disabled: blockedFields,
                        disabledSubscriber: subscribeToBlockedFields
                    }),

                    FormInput({
                        id: 'gateway-field',
                        name: 'gateway-field',
                        label: 'Gateway:',
                        className: [styles['form-item']],
                        getValue: () => fields.gateway.get(),
                        changeSubscriber: fields.gateway.subscribe,
                        onInput: (event: Event) => {
                            event.stopPropagation();
                            const $input = event.target as HTMLInputElement;
                            fields.gateway.set($input.value);
                        },
                        disabled: blockedFields,
                        disabledSubscriber: subscribeToBlockedFields
                    }),
                    
                    Ipv4Forwarding(),

                    DhcpClientField({
                        fields,
                        blockFields: setBlockedFields,
                        onDhcpClientChange,
                        onDhcpProcess
                    })

                ],
            }),

            BasicButtons({ onSave }),

        ],

        trigger: [
            
            {
                subscriber: pmCtx.subscribe,
                triggerFunction: (self: HTMLElement) => {
                    self.classList.toggle(styles["hidden"], !pmCtx.get()?.isVisible);
                    if (pmCtx.get()?.isVisible) onStart();
                }
            },

            {
                subscriber: fields.iface.subscribe,
                triggerFunction: onIfaceChange
            }

        ],

    })

}
