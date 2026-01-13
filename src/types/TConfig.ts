import { Packet } from "./packets";
import { MacRecord } from "./types";

export type TConnection = {
    /**
     * Unique identifier of the device connected to the interface.
     */
    itemId: string;
    /**
     * Api of the device connected to the interface.
     */
    api: IUltraPcConfig | IUltraSwitchConfig | null;
}

export interface ICableElementPosition {
    "x1": number;
    "y1": number;
    "x2": number;
    "y2": number;
}

export interface iface {
    /**
     * Ipv4 address of the interface.
     */
    ip: string;
    /**
     * Netmask of the interface.
     */
    netmask: string;
    /**
     * Mac address of the interface.
     */
    mac: string;
    /**
     * Whether the interface is using DHCP or not.
     */
    dhcp: boolean;
    /**
     * Connection information of the interface and the device it is connected to.
     */
    connection: TConnection;
}

export interface IRoutingRule {
    destinationIp: string;
    destinationNetmask: string;
    gateway: string;
    iface: string;
    nextHop: string;
}

export type TCreateGraphicalConnection = {
    x1: string;
    y1: string;
    x2: string;
    y2: string;
    elementApi: IUltraPcConfig;
}

export interface TPcElementProperties {
    /**
     * The unique identifier of the network element.
     */
    "elementId": string;
    /**
     * Returns the interfaces of the network element as a properties dictionary.
     * @returns {Record<string, iface>}
     */
    "ifaces": Record<string, iface>;
    /**
     * Returns the filesystem of the network element as an object.
     */
    "filesystem": Record<string, unknown>;
    /**
     * Returns true or false based on whether the resolver is active for the network element.
     */
    "resolved": boolean;
    /**
     * Returns true or false based on whether IPv4 forwarding is enabled for the network element.
     */
    "ipv4-forwarding"?: boolean;
}

export interface ICableElementProperties {
    "id": string;
    "position": ICableElementPosition;
}

export interface ISwitchElementProperties {
    elementId: string;
    "connections": TConnection[];
}

export type TNewNetworkElementProperties = {
    id: string;
    x: number;
    y: number;
}

//CABLE CONFIG
export interface IUltraCableConfig {
    properties: () => ICableElementProperties;
    propertiesSubscriber: (fn: (value: ICableElementProperties) => void) => () => void;
    updatePosition: (newPositions: ICableElementPosition) => void;
}

//ANIMATIONS
export interface IUltraAnimations {
    /**
     * Generates an animation for a packet between two elements.
     * @param itemId1 
     * @param itemId2 
     * @param packet 
     * @returns 
     */
    visualize: (itemId1: string, itemId2: string, packet: Packet) => Promise<void>;
}

//ROUTING CONFIG
export interface IUltraRoutingConfig {
    /**
     * Returns the routing rules of the network element.
     * @returns 
     */
    routingRules: () => IRoutingRule[];
    /**
     * Returns the subscriber function for the routing rules of the network element.
     * @param fn 
     * @returns 
     */
    subscribeToRoutingRules: (fn: (value: IRoutingRule[]) => void) => () => void;
    /**
     * Adds a routing rule to the network element, or edits an existing one.
     * @param rule 
     * @returns 
     */
    addRoutingRule: (rule: IRoutingRule) => void;
    /**
     * Removes a routing rule from the network element if it exists.
     * @param destinationIp 
     * @param destinationNetmask 
     * @returns 
     */
    removeRoutingRule: (destinationIp: string, destinationNetmask: string) => void;
    /**
     * Edits a routing rule in the network element if it exists. Throws an error if the rule does not exist.
     * @param newRule 
     * @returns 
     * @throws Error if the rule does not exist
     */
    editRoutingRule: (newRule: IRoutingRule) => void;
}

//ARP CONFIG
export type ArpCache = Record<string, {
    "mac": string;
    "timeOutId": NodeJS.Timeout;
}>;

export interface IUltraARPConfig {
    /**
     * Returns the ARP cache of the network element.
     */
    getARPCache: () => ArpCache;
    /**
     * Subscriber function for the ARP cache of the network element.
     * @param fn 
     * @returns 
     */
    subscribeToArpCache: (fn: (value: ArpCache) => void) => () => void;
    /**
     * Adds an ARP cache to the network element. It expires after $ARPENTRYTTL seconds.
     * @param ip 
     * @param mac 
     * @returns 
     */
    addArpCache: (ip: string, mac: string) => void;
    /**
     * Deletes an ARP cache from the network element.
     * @param ip 
     * @returns 
     */
    deleteArpCache: (ip: string) => void;
}

//PC CONFIG
export interface IUltraPcConfig extends IUltraARPConfig, IUltraRoutingConfig {
    /**
     * Returns the properties of the network element.
     * @returns 
     */
    properties: () => TPcElementProperties;
    /**
     * Subscriber function for the properties of the network element.
     * @param fn 
     * @returns 
     */
    subscribeToProperties: (fn: (value: TPcElementProperties) => void) => () => void;
    /**
     * Sends a packet to the network element asynchronously.
     * @param packet 
     * @param originId 
     * @returns 
     */
    sendPacket: (packet: Packet, originId: string) => Promise<void>;
    /**
     * Updates the properties of an interface in the network element.
     * @param interfaceId 
     * @param updates 
     * @returns 
     */
    updateInterface: (interfaceId: string, updates: Partial<iface>) => void;
    /**
     * Updates the properties of an interface in the network element by index.
     * @param index 
     * @param updates 
     * @returns 
     */
    updateInterfaceByIndex: (index: number, updates: Partial<iface>) => void;
    /**
     * Adds an interface to the network element.
     * @param interfaceId 
     * @returns 
     */
    addInterface: (interfaceId: string) => void;
    /**
     * Removes an interface from the network element.
     * @param interfaceId 
     * @returns 
     */
    removeInterface: (interfaceId: string) => void;
    /**
     * Updates ALL the properties of the network element.
     * @param newProperties 
     * @returns 
     */
    replaceProperties: (newProperties: TPcElementProperties) => void;
    /**
     * Adds a new connection to the network element.
     * @param param0 
     * @returns 
     */
    addConnection: ({ itemId, api }: TConnection) => void;
    /**
     * Removes a connection from the network element.
     * @param itemId 
     * @returns 
     */
    removeConnection: (itemId: string) => void;
    /**
     * Sets the pending reply flag to true or false.
     * @param value 
     * @returns 
     */
    setPendingReply: (value: boolean) => void;
    /**
     * Returns the current buffer of packets.
     * @returns 
     */
    currentBuffer: () => Packet[];
    /**
     * Subscriber function for the buffer of packets.
     * @param fn 
     * @returns 
     */
    subscribeToBuffer: (fn: (value: Packet[]) => void) => () => void;
    /**
     * Adds an ARP cache to the network element. It expires after $ARPENTRYTTL seconds.
     * @param ip 
     * @param mac 
     * @returns 
     */
    addArpCache: (ip: string, mac: string) => void;
    /**
     * Returns the default gateway of the network element.
     * @returns 
     */
    getDefaultGateway: () => string;
    /**
     * Returns the id of the new interface that will be created.
     * @returns 
     */
    getNewIfaceId: () => string;
}

//ROUTER CONFIG
export interface IUltraRouterConfig extends IUltraPcConfig {
    /**
     * Returns the properties of the network element.
     * @returns 
     */
    properties: () => TPcElementProperties;
    /**
     * Subscriber function for the properties of the network element.
     * @param fn 
     * @returns 
     */
    subscribeToProperties: (fn: (value: TPcElementProperties) => void) => () => void;
    /**
     * Sends a packet to the network element asynchronously.
     * @param packet 
     * @param originId 
     * @returns 
     */
    sendPacket: (packet: Packet, originId: string) => Promise<void>;
    /**
     * Updates the properties of an interface in the network element.
     * @param interfaceId 
     * @param updates 
     * @returns 
     */
    updateInterface: (interfaceId: string, updates: Partial<iface>) => void;
    /**
     * Updates the properties of an interface in the network element by index.
     * @param index 
     * @param updates 
     * @returns 
     */
    updateInterfaceByIndex: (index: number, updates: Partial<iface>) => void;
    /**
     * Adds an interface to the network element.
     * @param interfaceId 
     * @returns 
     */
    addInterface: (interfaceId: string) => void;
    /**
     * Removes an interface from the network element.
     * @param interfaceId 
     * @returns 
     */
    removeInterface: (interfaceId: string) => void;
    /**
     * Updates ALL the properties of the network element.
     * @param newProperties 
     * @returns 
     */
    replaceProperties: (newProperties: TPcElementProperties) => void;
    /**
     * Adds a new connection to the network element.
     * @param param0 
     * @returns 
     */
    addConnection: ({ itemId, api }: TConnection) => void;
    /**
     * Removes a connection from the network element.
     * @param itemId 
     * @returns 
     */
    removeConnection: (itemId: string) => void;
    /**
     * Sets the pending reply flag to true or false.
     * @param value 
     * @returns 
     */
    setPendingReply: (value: boolean) => void;
    /**
     * Returns the current buffer of packets.
     * @returns 
     */
    currentBuffer: () => Packet[];
    /**
     * Subscriber function for the buffer of packets.
     * @param fn 
     * @returns 
     */
    subscribeToBuffer: (fn: (value: Packet[]) => void) => () => void;
    /**
     * Adds an ARP cache to the network element. It expires after $ARPENTRYTTL seconds.
     * @param ip 
     * @param mac 
     * @returns 
     */
    addArpCache: (ip: string, mac: string) => void;
    /**
     * Returns the default gateway of the network element.
     * @returns 
     */
    getDefaultGateway: () => string;
    /**
     * Returns the id of the new interface that will be created.
     * @returns 
     */
    getNewIfaceId: () => string;
}

//SWITCH CONFIG
export interface IUltraSwitchConfig {
    properties: () => ISwitchElementProperties;
    subscribeToProperties: (fn: (value: ISwitchElementProperties) => void) => () => void;
    sendPacket: (packet: Packet, originId: string) => Promise<void>;
    addMacRecord: (itemId: string) => void;
    subscribeToRecords: (fn: (value: Record<string, MacRecord>) => void) => () => void
    getAllRecords: () => Record<string, MacRecord>;
    getRecordByMac: (mac: string) => MacRecord;
    addConnection: ({ itemId, api }: TConnection) => void;
    removeConnection: (itemId: string) => void;
    /**
     * Broadcasts a packet to all the connections of the network element.
     * @param packet 
     * @param originId Unique Identifier of the network element that sent the initial packet.
     * @returns 
     */
    broadcast: (packet: Packet, originId: string) => void;
}