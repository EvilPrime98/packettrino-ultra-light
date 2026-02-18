import { UltraComponent, ultraState, UltraActivity } from "@ultra-light";
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

/**
 * Defines the structure of the reducer that holds the state of the PC menu fields.
 */
export interface IUltraPcFields {
    /**
     * Staful getter for one of the fields.
     * @param key 
     * @returns 
     */
    get: (key: 'iface' | 'ip' | 'netmask' | 'gateway') => string;
    /**
     * Staful setter for one of the fields.
     * @param key 
     * @param value 
     */
    set: (key: 'iface' | 'ip' | 'netmask' | 'gateway', value: string) => void;
    /**
     * Staful subscriber for one of the fields.
     * @param key 
     * @returns 
     */
    subscribe: (key: 'iface' | 'ip' | 'netmask' | 'gateway') => (fn: (value: string) => void) => () => void;
}

export default function PcMenu() {

    /**
     * Reducer that holds the state of the PC menu fields.
     */
    const fields: IUltraPcFields = (function () {

        const [getInterfaceField, setInterfaceField, subscribeToInterfaceField] = ultraState<string>('');
        const [getIpField, setIpField, subscribeToIpField] = ultraState<string>('');
        const [getNetmaskField, setNetmaskField, subscribeToNetmaskField] = ultraState<string>('');
        const [getGatewayField, setGatewayField, subscribeToGatewayField] = ultraState<string>('');

        const fieldOperations = {
            iface: {
                get: getInterfaceField,
                set: setInterfaceField,
                subscribe: subscribeToInterfaceField
            },
            ip: {
                get: getIpField,
                set: setIpField,
                subscribe: subscribeToIpField
            },
            netmask: {
                get: getNetmaskField,
                set: setNetmaskField,
                subscribe: subscribeToNetmaskField
            },
            gateway: {
                get: getGatewayField,
                set: setGatewayField,
                subscribe: subscribeToGatewayField
            }
        } as const;

        type FieldKey = keyof typeof fieldOperations;

        function get(key: FieldKey) {
            return fieldOperations[key].get();
        }

        function set(key: FieldKey, value: string) {
            fieldOperations[key].set(value);
        }

        function subscribe(key: FieldKey) {
            return fieldOperations[key].subscribe;
        }

        return {
            get,
            set,
            subscribe
        };

    })();

    /**
     * State that holds a function that cleans up the global events.
     */
    const [eventCleaner, setEventCleaner,] = ultraState<(() => void) | null>(null);

    /**
     * State that indicates whether the fields are blocked or not.
     */
    const [blockedFields, setBlockedFields, subscribeToBlockedFields] = ultraState(false);

    /**
     * This function is called when the PC menu is opened. Sets 
     * up the initial values of the fields and starts listening to
     * global events.
     */
    function onStart() {
        setEventCleaner(onGlobalEvents());
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const ifaces = elementAPI.getIfaces();
        const initialIfaceId = Object.keys(ifaces)[0];
        fields.set('iface', initialIfaceId);
        fields.set('ip', ifaces[initialIfaceId].ip);
        fields.set('netmask', ifaces[initialIfaceId].netmask);
        fields.set('gateway', elementAPI.getDefaultGateway());
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
     * This function is called when the PC menu is closed. Cleans up
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
     * This function is called when the user clicks the save button.
     * It validates the input fields and sends a packet to the PC element
     * to update its properties.
     */
    function onSave() {

        if (!pmCtx.get()?.isVisible) return;
        const { pcElementAPI } = pmCtx.get();
        if (!pcElementAPI) return;

        const ip = fields.get('ip');
        const netmask = fields.get('netmask');
        const gateway = fields.get('gateway');
        const ifaceId = fields.get('iface');

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
                `Interface ${fields.get('iface').toUpperCase()} updated successfully!`,
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
     * This function is called when the PC menu is opened. It adds global
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
     * This function cleans up 
     * the state of the PC menu.
     */
    function onCleanup() {
        eventCleaner()?.();
        fields.set('iface', "");
        fields.set('ip', "");
        fields.set('netmask', "");
        fields.set('gateway', "");
        setBlockedFields(false);
    }

    /**
     * This function is called when the DHCP client checkbox is changed.
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
                elementAPI.dhcpClient.addDhcpIface(fields.get('iface')); //TODO: we need to alter the fields
                toCtx.get().createNotification(
                    `DHCP Client enabled on ${fields.get('iface')}`,
                    'success'
                );
            }else {
                elementAPI.dhcpClient.removeDhcpIface(fields.get('iface'));
                toCtx.get().createNotification(
                    `DHCP Client disabled on ${fields.get('iface')}`,
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
     * This function is called when the DHCP process button is clicked.
     * It sends a DHCP (discover) packet for the selected interface.
     */
    async function onDhcpProcess(){
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        try {
            await dhcp_service(
                elementAPI,
                fields.get('iface'),
                'discover'
            )
            const ifaces = elementAPI.getIfaces();
            fields.set('ip', ifaces[fields.get('iface')].ip);
            fields.set('netmask', ifaces[fields.get('iface')].netmask);
        } catch (e) {
            toCtx.get().createNotification(
                (e instanceof Error) ? e.message : 'Error while searching DHCP server...',
                'error'
            )
        }
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
                        getValue: () => fields.get('ip'),
                        changeSubscriber: fields.subscribe('ip'),
                        onInput: (event: Event) => {
                            event.stopPropagation();
                            const $input = event.target as HTMLInputElement;
                            fields.set('ip', $input.value);
                        },
                        disabled: blockedFields,
                        disabledSubscriber: subscribeToBlockedFields
                    }),

                    FormInput({
                        id: 'netmask-field',
                        name: 'netmask-field',
                        label: 'Netmask:',
                        className: [styles['form-item']],
                        getValue: () => fields.get('netmask'),
                        changeSubscriber: fields.subscribe('netmask'),
                        onInput: (event: Event) => {
                            event.stopPropagation();
                            const $input = event.target as HTMLInputElement;
                            fields.set('netmask', $input.value);
                        },
                        disabled: blockedFields,
                        disabledSubscriber: subscribeToBlockedFields
                    }),

                    FormInput({
                        id: 'gateway-field',
                        name: 'gateway-field',
                        label: 'Gateway:',
                        className: [styles['form-item']],
                        getValue: () => fields.get('gateway'),
                        changeSubscriber: fields.subscribe('gateway'),
                        onInput: (event: Event) => {
                            event.stopPropagation();
                            const $input = event.target as HTMLInputElement;
                            fields.set('gateway', $input.value);
                        },
                        disabled: blockedFields,
                        disabledSubscriber: subscribeToBlockedFields
                    }),
                    
                    Ipv4Forwarding(),

                    DhcpClientField({ 
                        fields,
                        blockFields: () => setBlockedFields(true),
                        onDhcpClientChange,
                        onDhcpProcess
                    })

                ],
            }),

            BasicButtons({ onSave }),

        ],

        trigger: [{
            subscriber: pmCtx.subscribe,
            triggerFunction: (self: HTMLElement) => {
                self.classList.toggle(styles["hidden"], !pmCtx.get()?.isVisible);
                if (pmCtx.get()?.isVisible) onStart();
            }
        }]

    })

}
