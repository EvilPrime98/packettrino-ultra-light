import { FormInput } from "@/components/core/form-input"
import { UltraActivity, ultraState } from "@/ultra-light/ultra-light";
import styles from './pc-menu.module.css'
import { PC_MENU_CTX as pmCtx } from "@/context/pc-menu-context";
import { hasDHCPClient } from "@/types/typeguards";
import { IUltraPcFields } from "./pc-menu";

export function DhcpClientField({ fields }: { fields: IUltraPcFields }) {

    const [
        getVisible,
        setVisible,
        subscribeToVisible
    ] = ultraState<boolean>(false);

    const [
        isDhcpEnabled,
        setDhcpEnabled,
        subscribeToDhcpEnabled
    ] = ultraState<boolean>(false);

    function onLoad() {
        if (!pmCtx.get().isVisible) return;
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        if (!hasDHCPClient(elementAPI)){
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
            className: [styles['form-item']],
            getValue: isDhcpEnabled,
            changeSubscriber: subscribeToDhcpEnabled,
            onChange,
            adTriggers: [
                { 
                    subscriber: pmCtx.subscribe, 
                    triggerFunction: onLoad, 
                    defer: true 
                }
            ]
        })

    })

}
