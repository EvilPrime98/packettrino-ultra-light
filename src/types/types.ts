import { iface, IUltraPcConfig } from "./TConfig";

export interface IToasterContext {
  /**
   * Creates a toaster notification. It can be used to display messages to the user.
   * @param message Message to be displayed.
   * @param type It can be 'success', 'error', 'info', or 'warning'.
   * @returns 
   */
  createNotification: (message: string | number, type: TToasterNotification) => void
}

export type ToasterProperties = {
  message: string;
  isVisible: boolean;
  type: TToasterNotification;
  timeout: number;
}

export type TToasterNotification = 'success' | 'error' | 'info' | 'warning';

export type panelData = {
  itemType: string;
  itemId: string;
  itemMac?: string;
  originx?: string;
  originy?: string;
}

export interface MacRecord {
  "mac": string;
  "port": string;
}

export type PcMenuInfo = {
  elementId: string;
  ifaces: iface[];
  gateway: string;
}

export type PcMenuCtx = {
  isVisible: boolean;
  pcElementAPI: IUltraPcConfig | null;
}

export interface TerminalContextInterface {
  /**
   * Returns true or false based on whether the terminal is visible.
   */
  isVisible: boolean;
  /**
   * Returns the current index of the command in the terminal buffer.
   */
  currentCommandIndex: number;
  /**
   * Returns the terminal buffer as an array of strings.
   */
  terminalBuffer: string[];
  /**
   * Returns the current working directory as an array of strings.
   */
  pwd: string[];
  /**
   * Returns the API of the element connected to the terminal.
   */
  elementAPI: IUltraPcConfig | null;
  /**
   * Returns the input string of the terminal.
   */
  input: string;
  /**
   * Returns the output string of the terminal.
   */
  output: string;
  /**
   * Returns the user name of the terminal.
   */
  user: string;
  /**
   * Returns the host name of the terminal.
   */
  host: string;
  /**
   * Returns the delimiter character of the terminal.
   */
  delimiter: string;
  /**
   * Writes a new line of text to the terminal. Short-hand for updating the
   * "output" property.
   * @param line The line of text to write.
   */
  write: (line: string) => void;
  /**
   * Returns the current loop ID of the terminal. This is used to identify and 
   * stop a write loop.
   */
  loopId: NodeJS.Timeout | null;
  /**
   * Writes a new line of text every "$intervalTime"ms to the terminal.
   * @param line The line of text to write.
   * @param intervalTime Interval time in ms.
   * @returns 
   */
  loopwrite: (line: string, intervalTime: number) => void;
  /**
   * Clears the terminal output. Short-hand for updating the "output" property.
   */
  clear: () => void;
  
}

export type AdvancedOption = {
  message: string;
  callback: (event: Event | null) => void;
}

export type PcMenuFields = {
  interfaceField: string;
  ipField: string;
  netmaskField: string;
  gatewayField: string;
  dhcpField: boolean;
}

export type PcFormValidatorData = {
  newIp: string;
  newNetmask: string;
  newGateway: string;
  newDnsServers: string[];
}

/**
 * Type Definitions for Network Packet System
 * Contains all interfaces, types, and constants for network simulation
 */

// ==================== Basic Network Types ====================

/**
 * MAC Address format: "xx:xx:xx:xx:xx:xx"
 * Example: "00:1A:2B:3C:4D:5E"
 */
export type MacAddress = string;

/**
 * IP Address format: "xxx.xxx.xxx.xxx"
 * Example: "192.168.1.1"
 */
export type IpAddress = string;

/**
 * Network port number (0-65535) or string representation
 */
export type Port = number | string;

// ==================== Protocol Types ====================

export type ProtocolType = "arp" | "icmp" | "dhcp" | "dns" | "tcp" | "http";
export type TransportProtocol = "udp" | "tcp";

// ==================== Packet Type Definitions ====================

export type ArpType = "request" | "reply";
export type IcmpType = "request" | "reply" | "time-exceeded";
export type DhcpType = "discover" | "offer" | "request" | "ack" | "release";
export type DnsType = "request" | "reply";
export type TcpType = "syn" | "syn-ack" | "syn-ack-reply" | "fin" | "rst";
export type HttpType = "request" | "reply";

// ==================== DNS Record Types ====================

export type DnsRecordType =
  | "A"      // IPv4 address
  | "AAAA"   // IPv6 address
  | "CNAME"  // Canonical name
  | "MX"     // Mail exchange
  | "NS"     // Name server
  | "TXT"    // Text record
  | "SOA"    // Start of authority
  | "PTR"    // Pointer record
  | "";      // Empty/unknown

// ==================== HTTP Methods ====================

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE";

// ==================== HTTP Status Codes ====================

export enum HttpStatusCode {
  // 1xx Informational
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,

  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 3xx Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,

  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  TIMEOUT = 408,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// ==================== Common Network Constants ====================

export const BROADCAST_MAC: MacAddress = "ff:ff:ff:ff:ff:ff";
export const BROADCAST_IP: IpAddress = "255.255.255.255";
export const ZERO_IP: IpAddress = "0.0.0.0";

export const DHCP_CLIENT_PORT = 68;
export const DHCP_SERVER_PORT = 67;
export const DNS_PORT = 53;
export const HTTP_PORT = 80;
export const HTTPS_PORT = 443;

export const DEFAULT_TTL = 64;
export const MAX_TTL = 255;

// ==================== Interface Definitions ====================

/**
 * Base packet constructor options
 */
export interface PacketOptions {
  originIp: IpAddress;
  destinationIp: IpAddress;
  originMac: MacAddress;
  destinationMac: MacAddress;
}

/**
 * DHCP configuration options
 */
export interface DhcpOptions {
  gateway?: IpAddress;
  netmask?: IpAddress;
  dns?: IpAddress;
  leasetime?: number;
  hostname?: string;
}

/**
 * HTTP headers interface
 */
export interface HttpHeaders {
  host: string;
  contentType?: string;
  contentLength?: number;
  keepalive?: boolean;
  userAgent?: string;
  accept?: string;
  authorization?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * DNS query options
 */
export interface DnsQueryOptions {
  recordType?: DnsRecordType;
  recursive?: boolean;
  timeout?: number;
}

/**
 * TCP connection state
 */
export interface TcpConnectionState {
  sourcePort: Port;
  destinationPort: Port;
  sequenceNumber: number;
  ackNumber: number;
  state: TcpState;
}

export type TcpState =
  | "CLOSED"
  | "LISTEN"
  | "SYN_SENT"
  | "SYN_RECEIVED"
  | "ESTABLISHED"
  | "FIN_WAIT_1"
  | "FIN_WAIT_2"
  | "CLOSE_WAIT"
  | "CLOSING"
  | "LAST_ACK"
  | "TIME_WAIT";

// ==================== Network Device Interfaces ====================

/**
 * Network interface configuration
 */
export interface NetworkInterface {
  name: string;
  mac: MacAddress;
  ip?: IpAddress;
  netmask?: IpAddress;
  gateway?: IpAddress;
  dns?: IpAddress;
  mtu?: number;
}

/**
 * Routing table entry
 */
export interface RouteEntry {
  destination: IpAddress;
  netmask: IpAddress;
  gateway: IpAddress;
  interface: string;
  metric: number;
}

/**
 * ARP cache entry
 */
export interface ArpCacheEntry {
  ip: IpAddress;
  mac: MacAddress;
  timestamp: number;
  isStatic: boolean;
}

/**
 * DNS cache entry
 */
export interface DnsCacheEntry {
  domain: string;
  ip: IpAddress;
  recordType: DnsRecordType;
  ttl: number;
  timestamp: number;
}

// ==================== Packet Statistics ====================

export interface PacketStats {
  sent: number;
  received: number;
  dropped: number;
  errors: number;
}

export interface ProtocolStats {
  [protocol: string]: PacketStats;
}

// ==================== Network Simulation Types ====================

/**
 * Network event types
 */
export type NetworkEventType =
  | "packet_sent"
  | "packet_received"
  | "packet_dropped"
  | "connection_established"
  | "connection_closed"
  | "dns_resolved"
  | "dhcp_lease_acquired"
  | "dhcp_lease_expired"
  | "arp_resolved";

/**
 * Network event
 */
export interface NetworkEvent {
  type: NetworkEventType;
  timestamp: number;
  source?: IpAddress;
  destination?: IpAddress;
  protocol?: ProtocolType;
  data?: any;
}

// ==================== Validation Helpers ====================

/**
 * Validates MAC address format
 */
export function isValidMacAddress(mac: string): mac is MacAddress {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

/**
 * Validates IPv4 address format
 */
export function isValidIpAddress(ip: string): ip is IpAddress {
  const octets = ip.split('.');
  if (octets.length !== 4) return false;

  return octets.every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255 && octet === num.toString();
  });
}

/**
 * Validates port number
 */
export function isValidPort(port: Port): boolean {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
  return !isNaN(portNum) && portNum >= 0 && portNum <= 65535;
}

// ==================== Utility Types ====================

/**
 * Makes all properties in T mutable (opposite of Readonly)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Makes specific properties in T mutable
 */
export type MutableKeys<T, K extends keyof T> = Omit<T, K> & {
  -readonly [P in K]: T[P];
};

/**
 * Extracts packet type from protocol
 */
export type PacketTypeFromProtocol<P extends ProtocolType> =
  P extends "arp" ? ArpType :
  P extends "icmp" ? IcmpType :
  P extends "dhcp" ? DhcpType :
  P extends "dns" ? DnsType :
  P extends "tcp" ? TcpType :
  P extends "http" ? HttpType :
  never;

// ==================== Error Types ====================

export class PacketError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "PacketError";
  }
}

export class ValidationError extends PacketError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NetworkError extends PacketError {
  constructor(message: string, public readonly errno?: number) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}