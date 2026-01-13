import { TERMINAL_CONTEXT as tCtx } from "@/context/terminal-context";
import {
    AlignmentError,
    EmptyArgumentError,
    InvalidIpAddressError
} from "@/errors";
import { ping } from '@services/icmp_service'
import { isValidIp } from "@utils/network_lib";
import { catchopts } from "@utils/network_lib";

export default async function command_ping() {

    try {

        const args = tCtx.get().input
        .trim()
        .split(" ");

        const OPTS = catchopts(
            ["-c:"],
            args
        );

        const count = Number(OPTS["-c"]) || undefined;
        const destinationIp = args[OPTS.IND + 1];

        if (!destinationIp) {
            throw new EmptyArgumentError("No destination IP provided.");
        }

        if (!isValidIp(destinationIp)) {
            throw new InvalidIpAddressError(
                `"${destinationIp}" is not a valid ipv4 address.`
            );
        }

        const elementApi = tCtx.get().elementAPI;

        if (!elementApi) {
            throw new AlignmentError(
                "No element properties detected. Was the component recently deleted?"
            );
        }

        await ping(
            destinationIp,
            elementApi,
            count
        );

    } catch (error: unknown) {

        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";

        tCtx.get()
            .write(`ping: ${errorMessage}`);

    }

}
