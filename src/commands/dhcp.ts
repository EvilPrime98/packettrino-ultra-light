import { dhcp_service } from "@/services/isc-dhcp-service";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import { TDhcpClientActions } from "@/types/TConfig";
import { hasDHCPClient } from "@/types/typeguards";

export async function command_dhcp() {

    try {

        const elementApi = tCtx.get().elementAPI;
        if (!elementApi) return;

        if (!hasDHCPClient(elementApi)) {
            throw new Error('Error: DHCP client is not available.');
        }

        const [ifaceId, action] = tCtx.get().input
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .slice(1);

        if (action === 'enable') {
            elementApi.dhcpClient.addDhcpIface(ifaceId);
            tCtx.get().write(`dhcp: Enabled DHCP client on ${ifaceId}`);
            return;
        }

        if (action === 'disable') {
            elementApi.dhcpClient.removeDhcpIface(ifaceId);
            tCtx.get().write(`dhcp: Disabled DHCP client on ${ifaceId}`);
            return;
        }

        await dhcp_service(
            elementApi,
            ifaceId,
            (action as TDhcpClientActions)
        );

    } catch (error: unknown) {

        const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error';

        tCtx.get().write(`dhcp: ${errorMessage}`);

    }


}