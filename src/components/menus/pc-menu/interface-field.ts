import {
    UltraComponent,
    ultraState
} from "@ultra-light";
import { PC_MENU_CTX as pmCtx } from "@context/pc-menu-context";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";
import AddIcon from "@/components/icons/add-icon";
import styles from "./pc-menu.module.css";
import { IUltraPcFields } from "./pc-menu";

export default function InterfaceField({ fields }: { fields: IUltraPcFields }) {

    const [
        ifacesList,
        setIfacesList,
        subscribeIfacesList
    ] = ultraState<string[]>([]);

    function onLoadIfaces(self: HTMLElement) {
        if (!pmCtx.get()?.isVisible) return;
        if (!self || !(self instanceof HTMLSelectElement)) return;
        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const ifaceIds = Object.keys(elementAPI.getIfaces());
        self.innerHTML = ifaceIds
        .map(ifaceId => `<option value="${ifaceId}">${ifaceId}</option>`)
        .join('');
        setIfacesList(ifaceIds);
    };

    function onIfaceChanges(event: Event) {
        const element = event.target;
        if (!element || !(element instanceof HTMLSelectElement)) return;
        const elementProperties = pmCtx.get().pcElementAPI;
        if (!elementProperties) return;
        const iface = elementProperties.getIfaces()[element.value];
        if (!iface) return;
        fields.set('iface', element.value);
        fields.set('ip', iface.ip || "");
        fields.set('netmask', iface.netmask || "");
    }

    function onAddIface() {

        const elementAPI = pmCtx.get().pcElementAPI;
        if (!elementAPI) return;
        const newIfaceId = elementAPI.getNewIfaceId();

        try {

            elementAPI.addInterface(newIfaceId);

            toCtx.get().createNotification(
                `Interface ${newIfaceId} added successfully`,
                'success'
            )

            setIfacesList([...ifacesList(), newIfaceId]);

        } catch (error: unknown) {

            const message = error instanceof Error
                ? error.message
                : 'Unknown error';

            toCtx.get().createNotification(
                message,
                'error'
            );

        }

    }

    function onSync(self: HTMLElement) {
        if (!self || !(self instanceof HTMLSelectElement)) return;
        self.innerHTML = ifacesList()
            .map(iface => `<option value="${iface}">${iface}</option>`)
            .join('');
    }

    return UltraComponent({

        component: `<div class="${styles['form-item']}"></div>`,

        children: [

            `<label for="iface">Interface:</label>`,

            UltraComponent({
                component: `<select id="iface" name="iface"></select>`,
                eventHandler: { 'change': onIfaceChanges },
                trigger: [
                    { subscriber: pmCtx.subscribe, triggerFunction: onLoadIfaces },
                    { subscriber: subscribeIfacesList, triggerFunction: onSync }
                ]
            }),

            UltraComponent({
                component: AddIcon({ size: 55, className: styles['icon'] }),
                eventHandler: { 'click': onAddIface },
            })

        ],

    })



}