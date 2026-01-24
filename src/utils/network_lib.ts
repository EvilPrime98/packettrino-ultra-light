import { IUltraPcConfig, IUltraRouterConfig } from "@/types/TConfig";

/**
 * Returns a random 48-bit MAC address
 * @returns 
 */
export function getRandomMac(): string {
    let macString = "";
    for (let i = 1; i <= 48; i++) {
        macString += Math.floor(Math.random() * 2);
    }
    const macBlocks = macString.match(/.{1,8}/g) || [];
    for (let i = 0; i < macBlocks.length; i++) {
        macBlocks[i] = (parseInt(macBlocks[i], 2).toString(16)).padStart(2, '0');
    }
    const mac = macBlocks.join(':');
    return mac;
}

/**
 * Returns the network address from an ipv4 address and netmask
 * @param {string} ip
 * @param {string} netmask
 * @returns 
 */
export function getNetwork(ip: string, netmask: string) {
    const ipOctects = ip.split('.');
    const netmaskOctects = netmask.split('.');
    const network = [];
    for (let i = 0; i < 4; i++) {
        network[i] = Number(ipOctects[i]) & Number(netmaskOctects[i]);
    }
    return network.join('.');
}

/**
 * Returns the broadcast address from an IP and a netmask
 * @param {string} ip 
 * @param {string} netmask 
 * @returns 
 */
export function getBroadcast(ip: string, netmask: string) {
    return binaryToIp(
        (ipToBinary(ip))
            .slice(0, ipToBinary(netmask).split("0")[0].length).padEnd(32, "1")
    )
}

/**
 * Returns the binary representation of a decimal IP address
 * @param ip 
 * @returns 
 */
function ipToBinary(ip: string) {
    const blocks = ip.split(".");
    const blocksBinary = [];
    for (let i = 0; i < blocks.length; i++) {
        blocksBinary[i] = parseInt(blocks[i])
            .toString(2)
            .padStart(8, "0");
    }
    const ipBinary = blocksBinary.join('')
    return ipBinary
}

/**
 * Returns the decimal representation of a binary IP address
 * @param binary 
 * @returns 
 */
function binaryToIp(binary: string) {
    const blocks = binary.match(/.{8}/g);
    if (!blocks) return "";
    const blocksIp = [];
    for (let i = 0; i < blocks.length; i++) {
        blocksIp[i] = parseInt(blocks[i], 2)
            .toString(10)
    }
    const ip = blocksIp.join(".")
    return ip
}

/**
 * Returns the CIDR notation of a netmask (without the /)
 * @param netmask 
 * @returns 
 */
export function netmaskToCidr(netmask: string) {
    const octets = netmask.split(".");
    for (let i = 0; i < octets.length; i++) {
        octets[i] = parseInt(octets[i]).toString(2).padStart(8, "0");
    }
    const cidr = octets.join("")
        .split("0")[0].length;
    return cidr;
}

/**
 * Returns an IP and netmask from a CIDR notation as an array.
 * It does NOT validate if the ip or netmask are valid ipv4 addresses.
 * @param cidr 
 * @returns
 */
export function parseCidr(cidr: string) {
    const ip = cidr.split("/")[0];
    const netmask = parseInt(cidr.split("/")[1]);
    let foo = "";
    for (let i = 1; i <= netmask; i++) {
        foo += "1";
    }
    foo = foo.padEnd(32, "0");
    const foo_octets = foo.match(/.{8}/g) || [];
    for (let i = 0; i < foo_octets.length; i++) {
        foo_octets[i] = parseInt(foo_octets[i], 2)
            .toString(10);
    }
    const netmaskBinary = foo_octets.join(".")
    return [ip, netmaskBinary];
}

/**
 * Returns a string with the CIDR notation of an ipv4 address and netmask
 * @param ip 
 * @param netmask 
 * @returns 
 */
export function encodeCidr(ip: string, netmask: string) {
    return `${ip}/${netmaskToCidr(netmask)}`;
}

/**
 * Returns true or false based on whether a decimal IP address is a valid ipv4 address
 * @param ip 
 * @returns 
 */
export function isValidIp(ip: string) {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ip);
}

/**
 * Returns an array of available IPs for the network element.
 * @param elementApi A network element API with Layer3 properties.
 * @returns 
 */
export function getAvailableIps(
    elementApi: IUltraPcConfig | IUltraRouterConfig
){
    const ifaces = elementApi.getIfaces();
    const availableIps = [];
    for (const ifaceId of Object.keys(ifaces)) {
        const iface = ifaces[ifaceId];
        availableIps.push(iface.ip);
    }
    return availableIps;
}

/**
 * Returns true or false based on whether a decimal ipv4 address is in valid CIDR notation.
 * It also validates if the ipv4 address is valid.
 * @param cidr 
 * @returns 
 */
export function isValidCidrIp(
    cidr: string
) {
    const ip = cidr.split("/")[0];
    const netmask = parseInt(cidr.split("/")[1]);
    let response = true;
    if (!isValidIp(ip)) response = false;
    if (isNaN(netmask) || netmask < 0 || netmask > 32) response = false;
    return response;
}

/**
 * Returns true or false based on whether a domain is valid.
 * @param domain 
 * @returns 
 */
export function isValidDomain(domain: string) {
    return /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])\.?$/.test(domain);
}

/**
 * Returns true or false based on whether a 48-bit MAC address is valid
 * @param mac 
 * @returns 
 */
export function isValidMac(mac: string) {
    return /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

/**
 * Returns an object with the valid options as "keys"
 * and their values as "values".
 * @param options Options string. The first character must be ":"
 * @param evaluable String to evaluate
 * @returns Object with parsed options
 */
export function getopts(
    options: string,
    evaluable: string
): Record<string, string> {

    const nopts = options.replace(/ /g, "");

    if (nopts.charAt(0) !== ":") {
        throw new Error("getopts: Syntax error - options must start with ':'");
    }

    const optionsObject: Record<string, string> = {};

    for (let i = 0; i < nopts.length; i++) {

        if (nopts.charAt(i) !== ":") {
            optionsObject["-" + nopts.charAt(i)] = (nopts.charAt(i + 1) === ":")
                ? "value"
                : "novalue";
        }

    }

    const evSplit = evaluable.split(" ");
    const response: Record<string, string> = {};

    for (let i = 0; i < evSplit.length; i++) {
        if (optionsObject[evSplit[i]]) {
            response[evSplit[i]] = "";
            if (optionsObject[evSplit[i]] === "value") {
                response[evSplit[i]] = evSplit[i + 1] || "";
                i++;
            }
        } else {
            throw new Error(`Invalid option: ${evSplit[i]}`);
        }
    }

    return response;

}

/**
 * Parses command-line style arguments with options. Throws error if option is not recognized.
 * @param options Array of option strings (use ":" suffix for options that require values)
 * @param args Array of arguments to parse, including the command itself.
 * @returns Object with parsed options and IND property indicating last processed index
 * @throws Error if option is not recognized
 * @example
 * const $OPTS = catchopts(["-l", "-R"], "ls -l /home/user/file.txt".split(" "));
 */
export function catchopts(options: string[], args: string[]): {
    [key: string]: string | number;
    IND: number;
} {

    const optionsObject: Record<string, string> = {};

    for (const option of options) {

        if (option.endsWith(":")) {
            optionsObject[option.slice(0, -1)] = "value";
        } else {
            optionsObject[option] = "novalue";
        }
        
    }

    const response: {
        [key: string]: string | number;
        IND: number;
    } = { IND: 0 };

    for (let i = 1; i < args.length; i++) {

        if (optionsObject[args[i]]) {

            response.IND = i;
            response[args[i]] = "";

            if (optionsObject[args[i]] === "value") {
                response[args[i]] = args[i + 1] || "";
                i++;
                response.IND = i;
            }

        } else {

            //throw new Error(`Unknown option: ${args[i]}`);
            break;

        }

    }

    return response;

}

/**
 * Returns true or false based on whether an IP is local for the network element.
 * @param elementApi 
 * @param ip 
 * @returns 
 */
export function isLocalIp(
    elementApi: IUltraPcConfig | IUltraRouterConfig,
    ip: string
) {

    const availableIps = getAvailableIps(elementApi);
    return [...availableIps].includes(ip)
    || getNetwork(ip, "255.0.0.0") === "127.0.0.0";
}

/**
 * Returns an array with the first element of the text and the second element.
 * If the separator is not found, the first element is the entire text.
 * @param text 
 * @param separator 
 * @returns 
 */
export function splitFirst(
    text: string, 
    separator: string
) {
    const index = text.indexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**
 * Returns an array with the first element of the text and the second element.
 * If the separator is not found, the first element is the entire text.
 * @param text 
 * @param separator 
 * @returns 
 */
export function splitLast(
    text: string, 
    separator: string
) {
    const index = text.lastIndexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**
 * This function parses a search string in the format [protocol, ip, port].
 * @param input 
 * @returns 
 */
export function parseSearch(input: string) {

    let protocol;
    let addressPortResource;
    let addressPort;
    let address;
    let port;
    let resource;

    const protocolMap = {
        http: 80,
        https: 443,
        ptt: 80
    } as Record<string, number>;

    const dividebyProtocol = splitFirst(input, "://");

    if (dividebyProtocol.length < 2) {
        protocol = "http";
        addressPortResource = dividebyProtocol[0];
    } else {
        protocol = dividebyProtocol[0];
        addressPortResource = dividebyProtocol[1];
    }

    const dividebyResource = splitFirst(addressPortResource, "/");

    if (dividebyResource.length < 2) {
        addressPort = dividebyResource[0];
        resource = "";
    } else {
        addressPort = dividebyResource[0];
        resource = dividebyResource[1];
    }

    const dividebyAddressPort = splitFirst(addressPort, ":");

    if (dividebyAddressPort.length < 2) {
        address = dividebyAddressPort[0];
        port = protocolMap[protocol];
    } else {
        address = dividebyAddressPort[0];
        port = parseInt(dividebyAddressPort[1]);
    }

    return {
        protocol: protocol,
        address: address,
        port: port,
        resource: resource
    }

}