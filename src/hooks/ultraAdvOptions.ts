import { TLayer2Config, TLayer3Config } from "@/types/TConfig";
import { hasDHCPServer, isLayer3 } from "@/types/typeguards";
import { DHCP_SERVER_MENU_CONTEXT} from "@/context/dhcp-server-menu-context";
import { TERMINAL_CONTEXT} from "@/context/terminal-context";
import { PC_MENU_CTX } from "@/context/pc-menu-context";
import { type AdvancedOption, ADVANCED_OPTIONS } from "@/types/types";
import { ultraState } from "@/ultra-light/ultra-light";
import { TOASTER_CONTEXT as toCtx } from "@/context/toaster-context";

/**
 * Returns a stateful getter, setter and subscriber for the advanced options of a network element.
 * The options are generated based on the element API, its package options and the 
 * optional starting options.
 * @param elementApi Element API of the network element.
 * @param startingOptions Optional starting options.
 * @returns 
 */
export function ultraAdvOptions(
    elementApi: TLayer2Config | TLayer3Config | null,
    startingOptions: AdvancedOption[] = []
) {

    const [
        getOptions, 
        setOptions, 
        subscribeOptions
    ] = ultraState<AdvancedOption[]>(generateOptions());

    function generateOptions(): AdvancedOption[] {

        const options = [...startingOptions ];

        if (elementApi && isLayer3(elementApi) 
            && hasDHCPServer(elementApi)) {
            options.push({ id: 'dhcp-server', message: "DHCP Server", callback: dhcpServerCallback });
        }

        if (elementApi && isLayer3(elementApi)) {
            options.push({ message: "Terminal", callback: terminalCallback, id: 'terminal' });
        }
            
        if (elementApi && isLayer3(elementApi)){
            options.push({ message: "Network Configuration", callback: networkConfigCallback, id: 'network-config' });
        }

        return options;

    }

    function dhcpServerCallback() {
        if (DHCP_SERVER_MENU_CONTEXT.get()?.isVisible) return;
        if (!elementApi || !isLayer3(elementApi)) return;
        if (!hasDHCPServer(elementApi)) return;
        DHCP_SERVER_MENU_CONTEXT.get().update({
            "isVisible": true,
            "serverAPI": elementApi
        })
    }

    function terminalCallback() {
        if (TERMINAL_CONTEXT.get().isVisible) return;
        if (!elementApi || !isLayer3(elementApi)) return;
        TERMINAL_CONTEXT.get().update({
            "isVisible": true,
            "elementAPI": elementApi,
        })
    }

    function networkConfigCallback() {
        if (PC_MENU_CTX.get()?.isVisible) return;
        if (!elementApi || !isLayer3(elementApi)) return;
        PC_MENU_CTX.get().update({
            "isVisible": true,
            "pcElementAPI": elementApi
        })
    }

    function deleteOption(
        optionId: string
    ){
        
        if (optionId === ADVANCED_OPTIONS.delete) {
            toCtx.get().createNotification(
                "You can't delete this option!",
                'error'
            );
            return;
        }

        const newOptions = [...getOptions()];

        if (newOptions.length === 3) {
            toCtx.get().createNotification(
                "You need to have at least 3 options!",
                'error'
            );
            return;
        }

        setOptions(newOptions.filter(option => option.id !== optionId));

    }

    elementApi?.subscribeToProperties(() => {
        setOptions(generateOptions());
    });

    return {
        get: getOptions,
        set: setOptions,
        subscribe: subscribeOptions,
        delete: deleteOption
    }

}