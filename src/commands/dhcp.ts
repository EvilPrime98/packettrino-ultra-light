import { sendDHCPDiscover } from "@/services/isc-dhcp-service";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";

export async function command_dhcp(){

    const elementApi = tCtx.get().elementAPI;

    if (!elementApi) return;
    
    const [ifaceId] = tCtx.get().input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(1);

    await sendDHCPDiscover(
        elementApi,
        ifaceId
    );
    
}