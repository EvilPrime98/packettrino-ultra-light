import { IPTTFolder } from "@/utils/pttFileSystem";
import { DhcpAck, Packet } from "./Tpackets";
import { MacRecord } from "./types";

//TO BE DETERMINED
export type TConnection = {
    /**
     * Unique identifier of the device connected to the interface.
     */
    itemId: string;
    /**
     * Api of the device connected to the interface.
     */
    api: TLayer2Config | TLayer3Config |null;
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
    /**
     * Returns true if the interface is in promiscuous mode, false otherwise.
     */
    promiscuousMode: boolean;
    /**
     * Returns true if the interface is in partial promiscuous mode, false otherwise.
     */
    partialPromiscuousMode: boolean;
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

export interface ICableElementProperties {
    "id": string;
    "position": ICableElementPosition;
}

export type TNewNetworkElementProperties = {
    id: string;
    x: number;
    y: number;
}

export interface IUltraCableConfig {
    properties: () => ICableElementProperties;
    propertiesSubscriber: (fn: (value: ICableElementProperties) => void) => () => void;
    updatePosition: (newPositions: ICableElementPosition) => void;
}

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

export type ArpCache = Record<string, {
    "mac": string;
    "timeOutId": NodeJS.Timeout;
}>;

export type TDhcpServerReservations = {
    [ip: string]: {
        mac: string;
    }
}

export type TDhcpServerProperties = {
    /** Whether the DHCP server is enabled or not. */
    state: boolean;
    /**
     * The interfaces that the DHCP server will listen on.
     */
    listenOnIfaces: string[];
    /**
     * The first IP address that the DHCP server will offer.
     */
    offerRangeStart: string;
    /**
     * The last IP address that the DHCP server will offer.
     */
    offerRangeEnd: string;
    /**
     * The netmask that the DHCP server will offer.
     */
    offerNetmask: string;
    /**
     * The gateway that the DHCP server will offer.
     */
    offerGateway: string;
    /**
     * The DNS server that the DHCP server will offer.
     */
    offerDns: string;
    /**
     * The lease time that the DHCP server will offer.
     */
    offerLeaseTime: number;
}

export interface IUltraDhcpLease {
    mac: string;
    leaseTime: number;
}

export interface Lease {
    ifaceId: string;
    leasetime: number;
    serverIp: string;
}

//ELEMENT PROPERTIES

export interface ILayer3ElementProperties {
    /**
     * The unique identifier of the network element.
     */
    "elementId": string;
    /**
     * Returns the filesystem of the network element as an object.
     */
    "filesystem": Record<string, IPTTFolder>;
    /**
     * Returns true or false based on whether IPv4 forwarding is enabled for the network element.
     */
    "ipv4-forwarding": boolean;
    /**
     * Returns a list of packages that are currently installed on the network element.
     */
    "packageList": TAvailablePackages[];
}

/**
 * Basic properties for a PC element.
 */
export interface TPcElementProperties extends ILayer3ElementProperties {
    test?: string; //TODO: remove
}

/**
 * Basic properties for a router element.
 */
export interface IRouterElementProperties extends ILayer3ElementProperties {
    test?: string; //TODO: remove
}

/**
 * Basic properties for a switch element.
 */
export interface ISwitchElementProperties {
    elementId: string;
    "connections": TConnection[];
}

//CONFIGS

/**
 * Core ARP configuration.
 */
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

/**
 * Core interface configuration.
 */
export interface IUltraIfaceConfig {
    /**
     * Returns the interfaces of the network element as a properties dictionary.
     * @returns {Record<string, iface>}
     */
    getIfaces: () => Record<string, iface>;
    /**
     * Subscriber function for the interfaces of the network element.
     * @param fn 
     * @returns 
     */
    subscribeToIfaces: (fn: (value: Record<string, iface>) => void) => () => void;
    /**
     * Removes an interface from the network element.
     * @param interfaceId 
     * @returns 
     */
    removeInterface: (interfaceId: string) => void;
    /**
     * Returns the id of the new interface that will be created.
     * @returns 
     */
    getAvailableInterface: () => string;
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
     * Adds a new connection to the network element.
     * @param param0 
     * @returns The id of the interface that was connected to.
     */
    addConnection: ({ itemId, api }: TConnection) => string;
    /**
     * Removes a connection from the network element.
     * @param itemId 
     * @returns 
     */
    removeConnection: (itemId: string) => void;
    /**
     * Returns the id of the new interface that will be created.
     * @returns 
     */
    getNewIfaceId: () => string;
    /**
     * Edits the id of an interface. NOTE: It triggers the 
     * corresponding subscriber functions TWICE.
     * @param interfaceId 
     * @param newId 
     * @returns
     * @throws Error if the interface does not exist or the new id is already in use
     */
    editInterfaceId: (interfaceId: string, newId: string) => void;
    /**
     * Enables or disables partial promiscuous mode for a specific interface.
     * @param value 
     * @returns 
     */
    partialPromiscousMode: (ifaceId: string, value: boolean) => void;
    /**
     * Enables or disables promiscuous mode for a specific interface.
     * @param value 
     * @returns 
     */
    promiscuousMode: (ifaceId: string, value: boolean) => void;
    /**
     * Returns the available IPs of the network element.
     * @returns
     */
    getAvailableIps: () => string[];
}

/**
 * Core routing configuration.
 */
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

/**
 * Core package configuration.
 */
export interface IUltraDpkgConfig {
    /**
     * Installs a package in the network element.
     * @param packageConfig Package configuration.
     * @returns 
     */
    install: (packageConfig: TPackageConfigs) => void;
}

/**
 * Basic configuration for a PC element.
 */
export interface IUltraPcConfig extends 
IUltraARPConfig, IUltraRoutingConfig, IUltraIfaceConfig, IUltraDpkgConfig {
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
     * Updates ALL the properties of the network element.
     * @param newProperties 
     * @returns 
     */
    replaceProperties: (newProperties: TPcElementProperties) => void;
    /** Edits a property of the network element.
     * @param property
     * @param value 
     * @returns 
     */
    editProperty: (property: keyof TPcElementProperties, value: TPcElementProperties[keyof TPcElementProperties]) => void;
    /**
     * Sends a packet to the network element asynchronously.
     * @param packet 
     * @param originId 
     * @returns 
     */
    sendPacket: (packet: Packet, originId: string) => Promise<void>;
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
     * Returns the default gateway of the network element.
     * @returns 
     */
    getDefaultGateway: () => string;
}

/**
 * Basic configuration for a router element.
 */
export interface IUltraRouterConfig extends 
IUltraARPConfig, IUltraRoutingConfig, IUltraIfaceConfig, IUltraDpkgConfig {
    /**
     * Returns the properties of the network element.
     * @returns 
     */
    properties: () => IRouterElementProperties;
    /**
     * Subscriber function for the properties of the network element.
     * @param fn 
     * @returns 
     */
    subscribeToProperties: (fn: (value: IRouterElementProperties) => void) => () => void;
    /**
     * Sends a packet to the network element asynchronously.
     * @param packet 
     * @param originId 
     * @returns 
     */
    sendPacket: (packet: Packet, originId: string) => Promise<void>;
    /**
     * Updates ALL the properties of the network element.
     * @param newProperties 
     * @returns 
     */
    replaceProperties: (newProperties: IRouterElementProperties) => void;
    /** Edits a property of the network element.
     * @param property
     * @param value 
     * @returns 
     */
    editProperty: (property: keyof IRouterElementProperties, value: IRouterElementProperties[keyof IRouterElementProperties]) => void;
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
     * Returns the default gateway of the network element.
     * @returns 
     */
    getDefaultGateway: () => string;
}

/**
 * Basic configuration for a switch element.
 */
export interface IUltraSwitchConfig {
    /**
     * Returns the properties of the switch element.
     * @returns 
     */
    properties: () => ISwitchElementProperties;
    /**
     * Returns the subscriber function for the properties of the switch element.
     * @param fn 
     * @returns 
     */
    subscribeToProperties: (fn: (value: ISwitchElementProperties) => void) => () => void;
    /**
     * Sends a packet to the switch element asynchronously.
     * @param packet 
     * @param originId 
     * @returns 
     */
    sendPacket: (packet: Packet, originId: string) => Promise<void>;
    /**
     * Adds a new 48-bit MAC record to the switch element.
     * @param itemId 
     * @returns 
     */
    addMacRecord: (itemId: string) => void;
    /**
     * Returns the subscriber function for the MAC records of the switch element.
     * @param fn 
     * @returns 
     */
    subscribeToRecords: (fn: (value: Record<string, MacRecord>) => void) => () => void
    /**
     * Returns all the MAC records of the switch element.
     * @returns 
     */
    getAllRecords: () => Record<string, MacRecord>;
    /**
     * Returns the MAC record of the switch element by its MAC address.
     * @param mac 
     * @returns 
     */
    getRecordByMac: (mac: string) => MacRecord;
    /**
     * Adds a new connection to the switch element.
     * @param param0 
     * @returns 
     */
    addConnection: ({ itemId, api }: TConnection) => void;
    /**
     * Removes a connection from the switch element.
     * @param itemId 
     * @returns 
     */
    removeConnection: (itemId: string) => void;
    /**
     * Broadcasts a packet to all the connections of the network element.
     * @param packet 
     * @param originId Unique Identifier of the network element that sent the initial packet.
     * @returns 
     */
    broadcast: (packet: Packet, originId: string) => void;
}

//UNION TYPES

/**
 * Devices that only work at layer 2.
 */
export type TLayer2Config = IUltraSwitchConfig;

/**
 * Devices that work at layer 2 and 3.
 */
export type TLayer3Config = IUltraPcConfig | IUltraRouterConfig;

//PACKAGES

/**
 * List of available packages.
 */
export const PACKAGES = [
    'isc-dhcp-server',
    'isc-dhcp-client'
] as const;

/**
 * Type that represents the possible packages that can be installed on a network element.
 */
export type TAvailablePackages = typeof PACKAGES[number];

/**
 * Type that represents the options for the packages that can be installed on a network element.
 */
export type TPackageOptions = {
    [key in TAvailablePackages]?: boolean;
}

/**
 * Package configuration for the DHCP client.
 */
export interface IUltraDhcpClientConfig {
    /** Returns an array of the interfaces that the DHCP client is listening on. */
    getDhcpIfaces: () => string[];
    /**
     * Assigns a lease to an interface.
     * @param ifaceId 
     * @param ackPacket 
     * @returns 
     */
    assignIp: (ifaceId: string, ackPacket: DhcpAck) => void;
    /**
     * Returns the leases of the DHCP client.
     * @returns 
     */
    getLeases: () => Lease[];
    /**
     * Subscriber function for the leases of the DHCP client.
     * @param fn 
     * @returns 
     */
    subscribeToLeases: (fn: (value: Lease[]) => void) => () => void;
    /**
     * Enables the DHCP client on a specific interface.
     * @param ifaceId 
     * @returns 
     */
    addDhcpIface: (ifaceId: string) => void;
}

/**
 * Package configuration for the DHCP server.
 */
export interface IUltraDHCPServerConfig {
    /**
     * Returns the properties of the DHCP server.
     * @returns
     */
    getProperties: () => TDhcpServerProperties;
    /** Updates the properties of the DHCP server. */
    updateProperties: (newProperties: Partial<TDhcpServerProperties>) => void;
    /**
     * Subscriber function for the properties of the DHCP server.
     * @param fn
     * @returns
     */
    subscribeToProperties: (fn: (value: TDhcpServerProperties) => void) => () => void;
    /**
     * Returns the reservations of the DHCP server.
     * @returns
     */
    getReservations: () => TDhcpServerReservations;
    /**
     * Adds a reservation to the DHCP server.
     * @param ip Ipv4 address of the reservation.
     * @param mac 48-bit MAC address of the reservation.
     * @returns
     * @throws InvalidIpv4AddressError if the ip is not a valid IPv4 address.
     * @throws Invalid48BitMacAddressError if the mac is not a valid 48-bit MAC address.
     */
    addReservation: (ip: string, mac: string) => void;
    /**
     * Removes a reservation from the DHCP server.
     * @param ip Ipv4 address of the reservation.
     * @returns
     */
    removeReservation: (ip: string) => void;
    /**
     * Assigns an IP address to a MAC address.
     * @param mac 48-bit MAC address.
     * @returns
     */
    assignIp: (mac: string) => string | null;
    /**
     * Gets the leases table.
     */
    getLeases: () => Record<string, IUltraDhcpLease>;
    /**
     * Subscribes to the leases table.
     */
    subscribeToLeases: (fn: (value: Record<string, IUltraDhcpLease>) => void) => () => void;
}

export type TPackageConfigs = IUltraDHCPServerConfig | IUltraDhcpClientConfig;