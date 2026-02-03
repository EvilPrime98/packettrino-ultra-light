import type { IUltraDhcpClientConfig, IUltraDHCPServerConfig, TLayer2Config, TLayer3Config } from "./TConfig";

/**
 * Returns true if the event is a drag event, false otherwise.
 * @param event 
 * @returns 
 */
export function isDragEvent(event: Event): event is DragEvent {
    return event.type === 'drag';
}

/**
 * Returns true if the config is a layer 2 config, false otherwise.
 * @param config 
 * @returns 
 */
export function isLayer2(
    config: TLayer2Config | TLayer3Config
): config is TLayer2Config {
    return 'connections' in config.properties();
}

/**
 * Returns true if the config is a layer 3 config, false otherwise.
 * @param config 
 * @returns 
 */
export function isLayer3(
    config: TLayer2Config | TLayer3Config
): config is TLayer3Config {
    return 'getIfaces' in config;
}

/**
 * Returns true if an element IP has DHCP server functionality, false otherwise.
 * @param config 
 * @returns 
 */
export function hasDHCPServer(
    config: TLayer3Config
): config is TLayer3Config & Record<"dhcpserver", IUltraDHCPServerConfig> {
    return 'dhcpserver' in config;
}


/**
 * Returns true if a network element has DHCP client functionality, false otherwise.
 * @param config 
 * @returns 
 */
export function hasDHCPClient(
    config: TLayer3Config
): config is TLayer3Config & Record<"dhcpClient", IUltraDhcpClientConfig> {
    return 'dhcpClient' in config;
}