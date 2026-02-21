export type MacAddress = string;
export type IpAddress = string;
export type Port = number | string;

export interface PacketOptions {
  originIp: IpAddress;
  destinationIp: IpAddress;
  originMac: MacAddress;
  destinationMac: MacAddress;
}

/**
 * Base packet class for all network packets
 */
export abstract class Packet {
  public originIp: IpAddress;
  public readonly destinationIp: IpAddress;
  public originMac: MacAddress;
  public destinationMac: MacAddress;
  public readonly xid: number;
  public abstract readonly protocol: string;
  public abstract readonly type: string;

  constructor(options: PacketOptions) {
    this.originIp = options.originIp;
    this.destinationIp = options.destinationIp;
    this.originMac = options.originMac;
    this.destinationMac = options.destinationMac;
    this.xid = Math.floor(Math.random() * 10000);
  }
}

export type ArpType = "request" | "reply";

/**
 * Builds a basicARP request packet
 * @param originIp The IP address of the sender
 * @param destinationIp The IP address of the target
 * @param originMac The MAC address of the sender
 * @returns An ARP request packet
 */
export class ArpRequest extends Packet {
  public readonly protocol = "arp" as const;
  public readonly type: ArpType = "request";

  constructor(originIp: IpAddress, destinationIp: IpAddress, originMac: MacAddress) {
    super({
      originIp,
      destinationIp,
      originMac,
      destinationMac: "ff:ff:ff:ff:ff:ff",
    });
  }

}

export class ArpReply extends Packet {
  public readonly protocol = "arp" as const;
  public readonly type: ArpType = "reply";

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
  }
}

export type IcmpType = "request" | "reply" | "time-exceeded";

export class IcmpEchoRequest extends Packet {
  public readonly protocol = "icmp" as const;
  public readonly type: IcmpType = "request";
  public ttl: number = 64;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
  }
}

export class IcmpEchoReply extends Packet {
  public readonly protocol = "icmp" as const;
  public readonly type: IcmpType = "reply";
  public ttl: number = 64;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
  }
}

export class IcmpTimeExceeded extends Packet {
  public readonly protocol = "icmp" as const;
  public readonly type: IcmpType = "time-exceeded";
  public ttl: number = 64;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
  }
}

export type DhcpType = "discover" | "offer" | "request" | "ack" | "release";

export interface DhcpOptions {
  gateway?: IpAddress;
  netmask?: IpAddress;
  dns?: IpAddress;
  leasetime?: number;
  hostname?: string;
}

export class DhcpDiscover extends Packet {
  public readonly protocol = "dhcp" as const;
  public readonly transportProtocol = "udp" as const;
  public readonly type: DhcpType = "discover";
  public readonly ttl: number = 64;
  public readonly sport: Port = 68;
  public readonly dport: Port = 67;
  public readonly giaddr: IpAddress = "0.0.0.0";
  public readonly ciaddr: IpAddress = "0.0.0.0";
  public readonly chaddr: MacAddress;

  constructor(originMac: MacAddress) {
    super({
      originIp: "0.0.0.0",
      destinationIp: "255.255.255.255",
      originMac,
      destinationMac: "ff:ff:ff:ff:ff:ff",
    });
    this.chaddr = originMac;
  }
}

export class DhcpOffer extends Packet {
  public readonly protocol = "dhcp" as const;
  public readonly transportProtocol = "udp" as const;
  public readonly type: DhcpType = "offer";
  public readonly ttl: number = 64;
  public readonly sport: Port = 67;
  public readonly dport: Port = 68;
  public readonly yiaddr: IpAddress;
  public readonly siaddr: IpAddress;
  public readonly ciaddr: IpAddress = "0.0.0.0";
  public readonly giaddr: IpAddress = "0.0.0.0";
  public readonly chaddr: MacAddress;
  public readonly gateway: IpAddress;
  public readonly netmask: IpAddress;
  public readonly dns: IpAddress;
  public readonly leasetime: number;

  constructor({
    originIp,
    originMac,
    serverIp,
    offerIp,
    destinationMac,
    chaddr,
    options,
  }: {
    originIp: IpAddress;
    originMac: MacAddress;
    serverIp: IpAddress;
    offerIp: IpAddress;
    destinationMac: MacAddress;
    chaddr: MacAddress;
    options: Required<Omit<DhcpOptions, "hostname">>;
  }) {
    super({
      originIp,
      destinationIp: "255.255.255.255",
      originMac,
      destinationMac,
    });
    this.yiaddr = offerIp;
    this.siaddr = serverIp;
    this.chaddr = chaddr;
    this.gateway = options.gateway;
    this.netmask = options.netmask;
    this.dns = options.dns;
    this.leasetime = options.leasetime;
  }
  
}

export class DhcpRequest extends Packet {
  public readonly protocol = "dhcp" as const;
  public readonly transportProtocol = "udp" as const;
  public readonly type: DhcpType = "request";
  public readonly ttl: number = 64;
  public readonly sport: Port = 68;
  public readonly dport: Port = 67;
  public readonly yiaddr: IpAddress = "0.0.0.0";
  public readonly siaddr: IpAddress;
  public readonly ciaddr: IpAddress = "0.0.0.0";
  public readonly chaddr: MacAddress;
  public readonly requestedIp: IpAddress;
  public readonly hostname?: string;
  public readonly leasetime: number = 0;
  public readonly gateway: IpAddress = "";
  public readonly netmask: IpAddress = "";
  public readonly dns: IpAddress = "";

  constructor({
    originMac,
    requestedIp,
    serverIp,
    hostname
  }: {
    originMac: MacAddress;
    requestedIp: IpAddress;
    serverIp: IpAddress;
    hostname?: string;
  }) {
    super({
      originIp: "0.0.0.0",
      destinationIp: "255.255.255.255",
      originMac,
      destinationMac: "ff:ff:ff:ff:ff:ff",
    });
    this.siaddr = serverIp;
    this.chaddr = originMac;
    this.requestedIp = requestedIp;
    this.hostname = hostname;
  }

}

export class DhcpAck extends Packet {

  public readonly protocol = "dhcp" as const;
  public readonly transportProtocol = "udp" as const;
  public readonly type: DhcpType = "ack";
  public readonly ttl: number = 64;
  public readonly sport: Port = 67;
  public readonly dport: Port = 68;
  public readonly ciaddr: IpAddress = "0.0.0.0"; 
  public readonly yiaddr: IpAddress;              
  public readonly siaddr: IpAddress;              
  public readonly chaddr: MacAddress;             
  public readonly gateway: IpAddress;
  public readonly netmask: IpAddress;
  public readonly dns: IpAddress;
  public readonly hostname?: string;
  public readonly leasetime: number;
    
  constructor({
    clientMac,
    assignedIp,
    serverIp,
    options
  }: {
    clientMac: MacAddress;
    assignedIp: IpAddress;
    serverIp: IpAddress;
    options: Required<DhcpOptions>;
  }) {
    super({
      originIp: serverIp,
      destinationIp: "255.255.255.255",  
      originMac: serverIp,                
      destinationMac: "ff:ff:ff:ff:ff:ff", 
    });
    
    this.yiaddr = assignedIp;
    this.siaddr = serverIp;
    this.chaddr = clientMac;
    this.gateway = options.gateway;
    this.netmask = options.netmask;
    this.dns = options.dns;
    this.hostname = options.hostname;
    this.leasetime = options.leasetime;

  }

}

export class DhcpRelease extends Packet {
  public readonly protocol = "dhcp" as const;
  public readonly transportProtocol = "udp" as const;
  public readonly type: DhcpType = "release";
  public readonly ttl: number = 64;
  public readonly sport: Port = 68;
  public readonly dport: Port = 67;
  public readonly ciaddr: IpAddress;
  public readonly yiaddr: IpAddress = "";
  public readonly siaddr: IpAddress;
  public readonly giaddr: IpAddress = "";
  public readonly chaddr: MacAddress;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.ciaddr = originIp;
    this.siaddr = destinationIp;
    this.chaddr = originMac;
  }
}

export type DnsType = "request" | "reply";
export type DnsRecordType = "A" | "AAAA" | "CNAME" | "MX" | "NS" | "TXT" | "";

export class DnsRequest extends Packet {
  public readonly protocol = "dns" as const;
  public readonly transportProtocol = "udp" as const;
  public readonly type: DnsType = "request";
  public readonly ttl: number = 64;
  public readonly sport: Port;
  public readonly dport: Port = 53;
  public readonly query: string;
  public answerType: DnsRecordType = "";
  public answer: string = "";
  public authority: string = "";
  public authorityDomain: string = "";

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress,
    query: string
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.sport = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
    this.query = query;
  }
}

export class DnsReply extends Packet {
  public readonly protocol = "dns" as const;
  public readonly transportProtocol = "udp" as const;
  public readonly type: DnsType = "reply";
  public readonly ttl: number = 64;
  public readonly sport: Port = 53;
  public dport: Port = 0;
  public readonly query: string;
  public answerType: DnsRecordType = "";
  public readonly answer: string;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress,
    query: string,
    answer: string
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.query = query;
    this.answer = answer;
  }
}

export type TcpType = "syn" | "syn-ack" | "syn-ack-reply" | "fin" | "rst";

export class TcpSyn extends Packet {
  public readonly protocol = "tcp" as const;
  public readonly transportProtocol = "tcp" as const;
  public readonly type: TcpType = "syn";
  public readonly ttl: number = 64;
  public readonly sport: Port;
  public readonly dport: Port;
  public readonly sequenceNumber: number;
  public readonly ackNumber: number = 0;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress,
    sport: Port,
    dport: Port
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.sport = sport;
    this.dport = dport;
    this.sequenceNumber = Math.floor(Math.random() * 100000);
  }
}

export class TcpSynAck extends Packet {
  public readonly protocol = "tcp" as const;
  public readonly transportProtocol = "tcp" as const;
  public readonly type: TcpType = "syn-ack";
  public readonly ttl: number = 64;
  public readonly sport: Port;
  public readonly dport: Port;
  public readonly sequenceNumber: number;
  public ackNumber: number = 0;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress,
    sport: Port,
    dport: Port
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.sport = sport;
    this.dport = dport;
    this.sequenceNumber = Math.floor(Math.random() * 100000);
  }
}

export class TcpAck extends Packet {
  public readonly protocol = "tcp" as const;
  public readonly transportProtocol = "tcp" as const;
  public readonly type: TcpType = "syn-ack-reply";
  public readonly ttl: number = 64;
  public readonly sport: Port;
  public readonly dport: Port;
  public sequenceNumber: number = 0;
  public ackNumber: number = 0;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress,
    sport: Port,
    dport: Port
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.sport = sport;
    this.dport = dport;
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
export type HttpType = "request" | "reply";

export class HttpRequest extends Packet {
  public readonly protocol = "http" as const;
  public readonly transportProtocol = "tcp" as const;
  public readonly type: HttpType = "request";
  public readonly ttl: number = 64;
  public readonly sport: Port;
  public readonly dport: Port;
  public readonly method: HttpMethod;
  public readonly host: string;
  public readonly resource: string;
  public readonly contentType: string = "text/html";
  public readonly keepalive: boolean = true;
  public readonly userAgent: string = "Amin-Search 1.0 - 2025";
  public body: string = "";

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress,
    sport: Port,
    dport: Port,
    method: HttpMethod,
    host: string,
    resource: string
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.sport = sport;
    this.dport = dport;
    this.method = method;
    this.host = host;
    this.resource = resource;
  }
}

export class HttpReply extends Packet {
  public readonly protocol = "http" as const;
  public readonly transportProtocol = "tcp" as const;
  public readonly type: HttpType = "reply";
  public readonly ttl: number = 64;
  public readonly sport: Port;
  public readonly dport: Port;
  public readonly method: HttpMethod;
  public readonly host: string;
  public readonly keepalive: boolean = true;
  public readonly contentType: string = "text/html";
  public readonly userAgent: string = "Amin-Search 1.0 - 2025";
  public body: string = "";
  public statusCode: number = 200;

  constructor(
    originIp: IpAddress,
    destinationIp: IpAddress,
    originMac: MacAddress,
    destinationMac: MacAddress,
    sport: Port,
    dport: Port,
    method: HttpMethod,
    host: string
  ) {
    super({ originIp, destinationIp, originMac, destinationMac });
    this.sport = sport;
    this.dport = dport;
    this.method = method;
    this.host = host;
  }
}

export function isArpPacket(packet: Packet): packet is ArpRequest | ArpReply {
  return packet.protocol === "arp";
}

export function isIcmpPacket(packet: Packet): packet is IcmpEchoRequest | IcmpEchoReply | IcmpTimeExceeded {
  return packet.protocol === "icmp";
}

export function isDhcpPacket(packet: Packet): packet is DhcpDiscover | DhcpOffer | DhcpRequest | DhcpAck | DhcpRelease {
  return packet.protocol === "dhcp";
}

export function isDnsPacket(packet: Packet): packet is DnsRequest | DnsReply {
  return packet.protocol === "dns";
}

export function isTcpPacket(packet: Packet): packet is TcpSyn | TcpSynAck | TcpAck {
  return packet.protocol === "tcp";
}

export function isHttpPacket(packet: Packet): packet is HttpRequest | HttpReply {
  return packet.protocol === "http";
}

/**
 * Returns true if the packet is a DHCP discover, false otherwise.
 * @param packet 
 * @returns 
 */
export function isDhcpDiscover(packet: Packet): packet is DhcpDiscover {
  return packet.protocol === 'dhcp' && packet.type === 'discover';
}

/**
 * Returns true if the packet is a DHCP offer, false otherwise.
 * @param packet Packet to be checked.
 * @returns 
 */
export function isDhcpOffer(packet: Packet): packet is DhcpOffer {
  return packet.protocol === 'dhcp' && packet.type === 'offer';
}

/**
 * Returns true if the packet is a DHCP request, false otherwise.
 * @param packet Packet to be checked.
 * @returns 
 */
export function isDhcpRequest(packet: Packet): packet is DhcpRequest {
  return packet.protocol === 'dhcp' && packet.type === 'request';
}

/**
 * Returns true if the packet is a DHCP request, false otherwise.
 * @param packet Packet to be checked.
 * @returns 
 */
export function isDhcpAck(packet: Packet): packet is DhcpAck {
  return packet.protocol === 'dhcp' && packet.type === 'ack';
}

export type AnyPacket =
  | ArpRequest
  | ArpReply
  | IcmpEchoRequest
  | IcmpEchoReply
  | IcmpTimeExceeded
  | DhcpDiscover
  | DhcpOffer
  | DhcpRequest
  | DhcpAck
  | DhcpRelease
  | DnsRequest
  | DnsReply
  | TcpSyn
  | TcpSynAck
  | TcpAck
  | HttpRequest
  | HttpReply;

export type ProtocolType = "arp" | "icmp" | "dhcp" | "dns" | "tcp" | "http";
export type TransportProtocol = "udp" | "tcp";