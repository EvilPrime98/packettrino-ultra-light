import type { IUltraIfaceConfig, TLayer3Config } from "./TConfig";

/**
 * Extracts the iface config from a layer 3 config.
 * @param config 
 * @returns 
 */
export function extractIfaceConfig(
    config: TLayer3Config
): IUltraIfaceConfig {

    const {
        getIfaces,
        subscribeToIfaces,
        removeInterface,
        getAvailableInterface,
        updateInterface,
        updateInterfaceByIndex,
        addInterface,
        addConnection,
        removeConnection,
        getNewIfaceId,
        editInterfaceId,
        partialPromiscousMode,
        promiscuousMode,
        getAvailableIps
    } = config;

    return {
        getIfaces,
        subscribeToIfaces,
        removeInterface,
        getAvailableInterface,
        updateInterface,
        updateInterfaceByIndex,
        addInterface,
        addConnection,
        removeConnection,
        getNewIfaceId,
        editInterfaceId,
        partialPromiscousMode,
        promiscuousMode,
        getAvailableIps
    };

}