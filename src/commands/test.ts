import { routing } from "@/kernel/routing";
import { TERMINAL_CONTEXT as tCtx} from "@/context/terminal-context";
import { IcmpEchoRequest } from "@/types/packets";

export default async function command_test() {

    const elementApi = tCtx.get().elementAPI;
    const destinationIp = tCtx.get().input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")[1];

    if (!elementApi) {
        throw new Error("No element properties detected. Was the component recently deleted?");
    }

    await routing(
        
        elementApi,
        
        new IcmpEchoRequest(
            "0.0.0.0", 
            destinationIp, 
            "ff:ff:ff:ff:ff:ff", 
            "ff:ff:ff:ff:ff:ff"
        )

    );

}