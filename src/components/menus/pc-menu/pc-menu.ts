import { UltraComponent, ultraState, UltraActivity } from "@ultra-light";
import { PC_MENU_CTX as pmCtx } from "@context/pc-menu-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import { PcFormValidator } from "@/schemas/pc-menu-schema";
import InterfaceField from "./interface-field";
import styles from "./pc-menu.module.css";
import IpField from "./ip-field";
import NetmaskField from "./netmask-field";
import GatewayField from "./gateway-field";
import BasicButtons from "./basic-buttons";
import { ip_addr } from "@/services/ifaces_service";
import { ip_route } from "@/services/routing_service";
import { encodeCidr } from "@/utils/network_lib";
import PcMenuFrame from "./pc-menu-frame";
import Ipv4Forwarding from "./ipv4-forwarding";
import { DhcpClientField } from "./dhcp-client-field";

export interface IUltraPcFields {
    get: (key: 'iface' | 'ip' | 'netmask' | 'gateway') => string;
    set: (key: 'iface' | 'ip' | 'netmask' | 'gateway', value: string) => void;
    subscribe: (key: 'iface' | 'ip' | 'netmask' | 'gateway') => (fn: (value: string) => void) => () => void;
}

export default function PcMenu() {

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

    const [eventCleaner, setEventCleaner,] = ultraState<(() => void) | null>(null);

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

    function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") onClose();
        if (event.key === "Enter") onSave();
    }

    function onClose() {
        onCleanup();
        pmCtx.get().update({
            isVisible: false,
            pcElementAPI: null,
        });
    }

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

    function onGlobalEvents() {
        window.addEventListener("keydown", onKeydown);
        return () => {
            window.removeEventListener("keydown", onKeydown);
        }
    }

    function onCleanup() {
        eventCleaner()?.();
        fields.set('iface', "");
        fields.set('ip', "");
        fields.set('netmask', "");
        fields.set('gateway', "");
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
                    IpField({ fields }),
                    NetmaskField({ fields }),
                    GatewayField({ fields }),
                    Ipv4Forwarding(),
                    DhcpClientField({ fields })
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
