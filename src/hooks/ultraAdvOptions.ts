import { TLayer2Config, TLayer3Config } from "@/types/TConfig";
import { hasDHCPServer, isLayer3 } from "@/types/typeguards";
import { DHCP_SERVER_MENU_CONTEXT} from "@/context/dhcp-server-menu-context";
import { TERMINAL_CONTEXT} from "@/context/terminal-context";
import { PC_MENU_CTX } from "@/context/pc-menu-context";
import { AdvancedOption } from "@/types/types";
import { ultraState } from "@/ultra-light/ultra-light";

/**
 * This hook returns a stateful getter for the advanced options of a network element.
 * @param elementApi Element API of the network element.
 * @param startingOptions Optional starting options.
 * @returns 
 */
export function ultraAdvOptions(
    elementApi: TLayer2Config | TLayer3Config,
    startingOptions: AdvancedOption[] = []
) {

    const [
        getOptions, 
        setOptions, 
        subscribeOptions
    ] = ultraState<AdvancedOption[]>(generateOptions());

    function generateOptions() {
        return [
            ...startingOptions,
            isLayer3(elementApi) && hasDHCPServer(elementApi) && { message: "DHCP Server", callback: dhcpServerCallback },
            isLayer3(elementApi) && { message: "Terminal", callback: terminalCallback },
            isLayer3(elementApi) && { message: "Network Configuration", callback: networkConfigCallback }
        ].filter(opt => opt !== false);
    }

    function dhcpServerCallback() {
        if (DHCP_SERVER_MENU_CONTEXT.get()?.isVisible) return;
        if (!isLayer3(elementApi)) return;
        if (!hasDHCPServer(elementApi)) return;
        DHCP_SERVER_MENU_CONTEXT.get().update({
            "isVisible": true,
            "serverAPI": elementApi
        })
    }

    function terminalCallback() {
        if (TERMINAL_CONTEXT.get().isVisible) return;
        if (!isLayer3(elementApi)) return;
        TERMINAL_CONTEXT.get().update({
            "isVisible": true,
            "elementAPI": elementApi,
        })
    }

    function networkConfigCallback() {
        if (PC_MENU_CTX.get()?.isVisible) return;
        if (!isLayer3(elementApi)) return;
        PC_MENU_CTX.get().update({
            "isVisible": true,
            "pcElementAPI": elementApi
        })
    }

    elementApi.subscribeToProperties(() => {
        setOptions(generateOptions());
    });

    return {
        get: getOptions,
        set: setOptions,
        subscribe: subscribeOptions,
    }

}