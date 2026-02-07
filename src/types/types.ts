/**
 * Type that returns the keys of a type that are writable.
 */
export type WritableKeys<T> = {
  [K in keyof T]-?: (<F>() => F extends { [Q in K]: T[K] } ? 1 : 2) extends
    (<F>() => F extends { -readonly [Q in K]: T[K] } ? 1 : 2) ? K : never
}[keyof T];

export interface MacRecord {
  "mac": string;
  "port": string;
}

export type AdvancedOption = {
  id: keyof typeof ADVANCED_OPTIONS;
  message: string;
  callback: (event: Event | null) => void;
}

export const ADVANCED_OPTIONS = {
  'dhcp-server': 'dhcp-server',
  'terminal': 'terminal',
  'network-config': 'network-config',
  'delete': 'delete',
  'arp-table': 'arp-table',
  'routing-table': 'routing-table',
} as const;

export type PcMenuFields = {
  interfaceField: string;
  ipField: string;
  netmaskField: string;
  gatewayField: string;
}

export type PcFormValidatorData = {
  newIp: string;
  newNetmask: string;
  newGateway: string;
  newDnsServers: string[];
}


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