import { sendDHCPDiscover } from "@/services/isc-dhcp-service";
import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";

export async function command_dhcp(){

    const elementApi = tCtx.get().elementAPI;

    if (!elementApi) {
        throw new Error('No element properties detected. Was the component recently deleted?');
    }

    await sendDHCPDiscover(
        elementApi,
        "enp0s3"
    );
    
}