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

/**ESTA FUNCION DEVUELVE UNA IP Y NETMASK A PARTIR DE UNA DIRECCION IP EN NOTACION CIDR */
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

/**ESTA FUNCION ACTUALIZA UNA ENTRADA DE LA TABLA DE MACS DE UN SWITCH*/
function updateMacEntry(switchObjectId, networkObjectId, newMac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    //añadimos el registro de la tabla MAC

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[0].innerHTML === networkObjectId) {
            cells[1].innerHTML = newMac;
            break;
        }
    }


    //reiniciamos o inicamos el temporizador de MAC

    if (!macEntryTimers[`${switchObjectId}-${networkObjectId}`]) {

        macEntryTimers[`${switchObjectId}-${networkObjectId}`] = setTimeout(() => {
            deleteMacEntry(switchObjectId, networkObjectId);
        }, $MACENTRYTTL * 1000);

        console.log(`Temporizador de MAC iniciado para ${switchObjectId}-${networkObjectId}`);

    } else {

        clearTimeout(macEntryTimers[`${switchObjectId}-${networkObjectId}`]);
        macEntryTimers[`${switchObjectId}-${networkObjectId}`] = setTimeout(() => {
            deleteMacEntry(switchObjectId, networkObjectId);
        }, $MACENTRYTTL * 1000);

        console.log(`Temporizador de MAC reiniciado para ${switchObjectId}-${networkObjectId}`);

    }

}

/**ESTA FUNCION ELIMINA UNA ENTRADA DE LA TABLA DE MACS DE UN SWITCH*/
function deleteMacEntry(switchObjectId, networkObjectId) {

    const $switchObject = document.getElementById(switchObjectId);
    const $macTable = $switchObject.querySelector("table");
    const $records = $macTable.querySelectorAll("tr");

    for (let i = 1; i < $records.length; i++) {
        const $record = $records[i];
        const $fields = $record.querySelectorAll("td");
        if ($fields[0].innerHTML === networkObjectId) {
            $fields[1].innerHTML = "";
            delete macEntryTimers[`${switchObjectId}-${networkObjectId}`];
            console.log(`Temporizador de MAC eliminado para ${switchObjectId}-${networkObjectId}`);
            break;
        }
    }

}

/**ESTA FUNCION AÑADE UNA ENTRADA A LA TABLA DE MACS DE UN SWITCH*/
function addSwitchPort(switchId, itemdId) {
    const $switchObject = document.getElementById(switchId);
    const $macTable = $switchObject.querySelector("table");
    const $records = $macTable.querySelectorAll("tr");
    const $newMac = document.createElement("tr");
    $newMac.innerHTML = `
        <tr>
            <td class="device-name">${itemdId}</td>
            <td class="mac-address"></td>
            <td class="physical-port">FA0/${$records.length}</td>
        </tr>`;
    $macTable.appendChild($newMac);
}

/**ESTA FUNCION ELIMINA UNA ENTRADA DE LA TABLA DE MACS DE UN SWITCH*/
function deleteSwitchPort(switchId, networkObjectId) {
    const switchObject = document.getElementById(switchId);
    const table = switchObject.querySelector("table");
    const tds = table.querySelectorAll("td");

    for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        if (td.innerHTML === networkObjectId) {
            const tr = td.parentElement;
            tr.remove();
            break;
        }
    }
}

/**ESTA FUNCION DEVUELVE TRUE SI LA DIRECCION IP EN NOTACION CIDR ES VALIDA. TAMBIEN VALIDA SI LA DIRECCION IP ES VALIDA */
function isValidCidrIp(cidr) {
    const ip = cidr.split("/")[0];
    const netmask = parseInt(cidr.split("/")[1]);
    let response = true;
    if (!isValidIp(ip)) response = false;
    if (isNaN(netmask) || netmask < 0 || netmask > 32) response = false;
    return response;
}

/**ESTA FUNCION DEVUELVE TRUE SI EL DOMINIO ES VALIDO */
function isValidDomain(domain) {
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

/**ESTA FUNCION LAS MACS ALMACENADAS EN UN SWITCH COMO ARRAY*/
function getMACTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");

    const macs = [];

    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    return macs;

}

/**ESTA FUNCION DEVUELVE TRUE SI LA TABLA DE DIRECCIONES MACS DE UN SWITCH ESTA VACIA */
function isMacTableEmpty(switchObjectId) {

    const tabla = document.getElementById(switchObjectId).querySelector("table");
    const matriz = [];

    for (const fila of tabla.rows) {
        const filaArray = [];
        for (const celda of fila.cells) {
            filaArray.push(celda.innerText.trim());
        }
        matriz.push(filaArray);
    }

    if (matriz.length === 1) {
        return true;
    } else {
        return false;
    }

}

/**ESTA FUNCION DEVUELVE TRUE SI UNA DIRECCION MAC ESTA ALMACENADA EN UN SWITCH */
function isMacInMACTable(switchObjectId, macAddress) {

    const macs = getMACTable(switchObjectId);

    for (let i = 0; i < macs.length; i++) {

        const mac = macs[i];

        if (mac === macAddress) {
            return true;
        }

    }

    return false;

}

/**ESTA FUNCION DEVUELVE EL DISPOSITIVO (PUERTO) QUE CORRESPONDE CON UNA DIRECCION MAC EN UN SWITCH */
function getDeviceFromMac(switchObjectId, mac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[1].innerHTML === mac) {
            return cells[0].innerHTML;
        }

    }
}

/**ESTA FUNCION DEVUELVE LA TABLA DE DISPOSITIVOS (PUERTOS) ACTIVOS EN UN SWITCH */
function getDeviceTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const devices = switchOriginObject.querySelector("table").querySelectorAll(".device-name");

    const devicesArray = [];

    for (let i = 0; i < devices.length; i++) {
        devicesArray.push(devices[i].innerHTML);
    }

    return devicesArray;

}

/**ESTA FUNCION ESCAPEA EL HTML DE UN STRING */
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
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
            throw new Error(`Opción no reconocida: ${evSplit[i]}`);
        }
    }

    return response;

}

/**
 * Parses command-line style arguments with options. Throws error if option is not recognized.
 * @param options Array of option strings (use ":" suffix for options that require values)
 * @param args Array of arguments to parse (typically process.argv or similar)
 * @returns Object with parsed options and IND property indicating last processed index
 * @throws Error if option is not recognized
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

/**ESTA FUNCION DEVUELVE LAS INTERFACES DE UN DISPOSITIVO COMO ARRAY [INTERFAZ1, INTERFAZ2, ...] */
export function getInterfaces(ref: HTMLElement | null) {

    if (!ref) return [];
    const response = [];
    let index = 3;
    let networkInterface = ref.getAttribute("ip-enp0s" + index);

    while (networkInterface !== null) {
        response.push(`enp0s` + index);
        if (index === 3) index = 8;
        else index++;
        networkInterface = ref.getAttribute("ip-enp0s" + index);
    }

    return response;

}

/**ESTA FUNCION DEVUELVE TRUE SI EL DISPOSITIVO TIENE AL MENOS 1 CONEXION ACTIVA */
function isConnected(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchAttribute = $networkObject.getAttribute("data-switch-enp0s" + index);

    while (switchAttribute !== null) {
        if (switchAttribute !== "") return true;
        if (index === 3) index = 8;
        else index++;
        switchAttribute = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    if (networkObjectId.startsWith("switch-")) return getDeviceTable(networkObjectId).length !== 0;

    return false;

}

/**ESTA FUNCION DEVUELVE LA PRIMERA INTERFAZ LIBRE DEL DISPOSITIVO */
function getAvailableInterface(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);

    while (switchConn !== null) {
        if (switchConn === "") return `enp0s${index}`;
        if (index === 3) index = 8;
        else index++;
        switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    return false;
}

/**ESTA FUNCION DEVUELVE LA INFORMACION DE UNA INTERFAZ COMO ARRAY [IP, NETMASK, MAC] */
function getIfaceData(networkObjectId, iface) {
    const $networkObject = document.getElementById(networkObjectId);
    return [$networkObject.getAttribute("ip-" + iface), $networkObject.getAttribute("netmask-" + iface), $networkObject.getAttribute("mac-" + iface)];
}

/**ESTA FUNCION DEVUELVE LA INFORMACION DE UNA INTERFAZ QUE ESTE CONECTADA A UN SWITCH EN CONCRETO */
function getInterfaceSwitchInfo(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    const response = [];

    while (switchConn !== null) {

        if (switchConn === switchObjectId) {
            response.push($networkObject.getAttribute("ip-enp0s" + index));
            response.push($networkObject.getAttribute("netmask-enp0s" + index));
            response.push($networkObject.getAttribute("mac-enp0s" + index));
            return response;
        }

        if (index === 3) index = 8;
        else index++;
        switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    return [false, false, false];

}

/**ESTA FUNCION DEVUELVE LA INTERFAZ DE UN DISPOSITIVO QUE ESTÁ CONECTADA A UN SWITCH */
function switchToInterface(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    let response = false;
    interfaces.forEach(iface => { if ($networkObject.getAttribute(`data-switch-${iface}`) === switchId) response = iface; });
    return response;
}

/**ESTA FUNCION DEVUELVE LAS IPS DISPONIBLES EN UN DISPOSITIVO COMO ARRAY [IP1, IP2, ...] */
function getAvailableIps(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    const availableIps = [];

    while (networkObjectIp !== null) {
        if (networkObjectIp !== "") availableIps.push(networkObjectIp);
        if (index === 3) index = 8;
        else index++;
        networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    }

    return availableIps;

}

/**ESTA FUNCION DEVUELVE LA INFORMACION DE UNA INTERFAZ COMO ARRAY [INTERFAZ, SWITCH AL QUE ESTÁ CONECTADA, DIRECCIÓN MAC ]*/
function getInfoFromIp(networkObjectId, ip) {

    const $networkObject = document.getElementById(networkObjectId);
    const response = [false, false, false];
    let index = 3;
    let interfaceIp = $networkObject.getAttribute("ip-enp0s" + index);

    while (interfaceIp !== null) {

        if (interfaceIp === ip) {
            response[0] = `enp0s${index}`;
            response[1] = $networkObject.getAttribute("data-switch-enp0s" + index);
            response[2] = $networkObject.getAttribute("mac-enp0s" + index);
        }

        if (index === 3) index = 8;
        else index++;

        interfaceIp = $networkObject.getAttribute("ip-enp0s" + index);

    }

    return response;

}

/**ESTA FUNCION DEVUELVE UN ARRAY CON LAS DIRECCIONES MAC DE TODAS LAS INTERFAZ DE UN DISPOSITIVO */
function getMacAddresses(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let mac = $networkObject.getAttribute("mac-enp0s" + index);
    const macs = [];

    while (mac !== null) {
        macs.push(mac);
        if (index === 3) index = 8;
        else index++;
        mac = $networkObject.getAttribute("mac-enp0s" + index);
    }

    return macs;

}

/**ESTA FUNCIÓN DEVUELVE TRUE SI LA IP ES LOCAL PARA EL DISPOSITIVO */
function isLocalIp(networkObjectId, ip) {

    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    let response = false;

    //si forma parte de alguna interfaz
    for (const iface of interfaces) if ($networkObject.getAttribute(`ip-${iface}`) === ip) response = true;

    //si forma parte del bucle local
    if (getNetwork(ip, "255.0.0.0") === "127.0.0.0") response = true;

    return response;
}

//FUNCIONES DE SIMULACION DE CONSTRUCCION DE REDES
function getLastElement(selector, position = -1) {
    const elements = document.querySelectorAll(selector);
    return elements[elements.length + position];
}

function createConn(elementoOrigen, elementoDestino) {

    const dragstartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    const dataTransfer = new DataTransfer();

    Object.defineProperty(dragstartEvent, 'dataTransfer', {
        value: dataTransfer,
        writable: false
    });

    elementoOrigen.dispatchEvent(dragstartEvent);

    const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        view: window,
        dataTransfer: dataTransfer
    });

    elementoDestino.dispatchEvent(dropEvent);

    return {
        originElement: elementoOrigen,
        targetElement: elementoDestino,
        dataTransfer: dataTransfer
    };
}

function setRouterIps($router, ip1, ip2 = "", ip3 = "") {

    const [newIpEnp0s3, newNetmaskEnp0s3] = parseCidr(ip1);
    const [newIpEnp0s8, newNetmaskEnp0s8] = parseCidr(ip2);
    const [newIpEnp0s9, newNetmaskEnp0s9] = parseCidr(ip3);

    $router.setAttribute("ip-enp0s3", newIpEnp0s3);
    $router.setAttribute("ip-enp0s8", newIpEnp0s8);
    $router.setAttribute("ip-enp0s9", newIpEnp0s9);
    $router.setAttribute("netmask-enp0s3", newNetmaskEnp0s3);
    $router.setAttribute("netmask-enp0s8", newNetmaskEnp0s8);
    $router.setAttribute("netmask-enp0s9", newNetmaskEnp0s9);

    const routingTable = $router.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    const ifaces = [
        { ip: newIpEnp0s3, netmask: newNetmaskEnp0s3, interface: "enp0s3" },
        { ip: newIpEnp0s8, netmask: newNetmaskEnp0s8, interface: "enp0s8" },
        { ip: newIpEnp0s9, netmask: newNetmaskEnp0s9, interface: "enp0s9" }
    ];

    ifaces.forEach((iface, index) => {
        const row = rows[index + 1];
        const cells = row.querySelectorAll("td");
        if (getNetwork(iface.ip, iface.netmask) !== "0.0.0.0") cells[0].innerHTML = getNetwork(iface.ip, iface.netmask);
        cells[1].innerHTML = iface.netmask;
        cells[2].innerHTML = iface.ip;
        cells[3].innerHTML = iface.interface;
    });

}

/**ESTA FUNCION PARSEA UNA DIRECCIÓN DE BÚSQUEDA EN [PROTOCOLO, IP, PUERTO] */
function parseSearch(input) {

    let protocol;
    let addressPortResource;
    let addressPort;
    let address;
    let port;
    let resource;

    //definimos los mapas

    const protocolMap = {
        http: 80,
        https: 443,
        ptt: 80
    };

    //
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

/**DEVUELVE EL INDICE MÁS ALTO DE INTERFAZ DE UN DISPOSITIVO (3, 8, 9, ...) */
function maxIfaceIndex(networkObjectId) {
    return getInterfaces(networkObjectId)
        .map(iface => parseInt(iface.split("enp0s")[1]))
        .sort((a, b) => a - b)
        .pop();
}

/**ESTA FUNCION ELIMINA UNA INTERFAZ DE UN DISPOSITIVO, JUNTO CON LAS CONFIGURACIONES RELACIONADAS */
function deleteInterface(networkObjectId, iface) {

    const $networkObject = document.getElementById(networkObjectId);

    //si la interfaz está configurada en dhcp, hacemos un release primero

    //TODO -> hacer release de dhcp

    //eliminamos los atributos del elemento de red

    $networkObject.removeAttribute(`ip-${iface}`);
    $networkObject.removeAttribute(`netmask-${iface}`);
    $networkObject.removeAttribute(`mac-${iface}`);
    $networkObject.removeAttribute(`data-switch-${iface}`);

    //eliminamos las reglas de enrutamiento que usen esa interfaz

    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr");

    $routingRules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[3].innerHTML === iface) $rule.remove();
    });

}

/**ESTA FUNCION AÑADE UNA INTERFAZ A UN DISPOSITIVO */
function addInterface(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId);
    const ifaceMaxIndex = maxIfaceIndex(networkObjectId);
    const newInterface = (ifaceMaxIndex === 3) ? "enp0s8" : `enp0s${ifaceMaxIndex + 1}`;

    //añadimos los atributos de la nueva interfaz
    $networkObject.setAttribute(`ip-${newInterface}`, "");
    $networkObject.setAttribute(`netmask-${newInterface}`, "");
    $networkObject.setAttribute(`mac-${newInterface}`, getRandomMac());
    $networkObject.setAttribute(`data-switch-${newInterface}`, "");

    //habilitamos el drag and drop para la nueva interfaz
    $networkObject.querySelector("img").draggable = true;

    //si el servicio dhclient está activo, añadimos la configuración de la nueva interfaz
    if ($networkObject.getAttribute("dhclient") === "true") {
        $networkObject.setAttribute(`data-dhcp-server-${newInterface}`, "");
        $networkObject.setAttribute(`data-dhcp-lease-time-${newInterface}`, "");
        $networkObject.setAttribute(`data-dhcp-current-lease-time-${newInterface}`, "");
        $networkObject.setAttribute(`data-dhcp-flag-t1-${newInterface}`, "false");
        $networkObject.setAttribute(`data-dhcp-flag-t2-${newInterface}`, "false");
    }

}

/**ESTA FUNCION DEVUELVE LA PUERTA DE ENLACE DE UN DISPOSITIVO */
function getDefaultGateway(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $defaultRule = $networkObject.querySelector(".routing-table table").querySelector(".default-route");
    return $defaultRule?.querySelectorAll("td")[4]?.innerHTML || "";
}

/**ESTA FUNCION CONFIGURA LA PUERTA DE ENLACE DE UN DISPOSITIVO */
function setDefaultGateway(networkObjectId, newGateway) {

    if (!newGateway) return;

    const $networkObject = document.getElementById(networkObjectId);
    const $directRules = $networkObject.querySelector(".routing-table table").querySelectorAll(".direct-route");

    for (let i = 0; i < $directRules.length; i++) {
        const $rule = $directRules[i];
        const $fields = $rule.querySelectorAll("td");
        const ruleDestination = $fields[0].innerHTML;
        const ruleNetmask = $fields[1].innerHTML;
        const ruleGateway = $fields[2].innerHTML;
        const ruleIface = $fields[3].innerHTML;
        const ruleNextHop = $fields[4].innerHTML;

        if (getNetwork(ruleDestination, ruleNetmask) === getNetwork(newGateway, ruleNetmask)) {
            setRemoteRoutingRule(networkObjectId,
                "0.0.0.0",
                "0.0.0.0",
                ruleGateway,
                ruleIface,
                newGateway
            );
            return;
        }
    }

    throw new Error("networkd: Error: Puerta de enlace inalcanzable.");

}
