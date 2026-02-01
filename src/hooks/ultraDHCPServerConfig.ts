import { ultraState } from "@ultra-light";
import type { IUltraDHCPServerConfig, TDhcpServerProperties, TDhcpServerReservations } from "@/types/TConfig";
import { isValidIp, isValidMac } from "@/utils/network_lib";
import { InvalidIpv4AddressError, Invalid48BitMacAddressError } from '@/errors'

export default function ultraDhcpServerConfig(): IUltraDHCPServerConfig {

    const initialProperties: TDhcpServerProperties = {
        "state": true,
        "listenOnIfaces": ["enp0s3"],
        "offerRangeStart": "192.168.1.100",
        "offerRangeEnd": "192.168.1.150",
        "offerNetmask": "255.255.255.0",
        "offerGateway": "192.168.1.1",
        "offerDns": "8.8.8.8",
        "offerLeaseTime": 86400
    }
    
    const [
        getProperties
        ,setProperties
        ,subscribeToProperties
    ] = ultraState<TDhcpServerProperties>(initialProperties);

    const [
        getReservations
        ,setReservations
        ,
    ] = ultraState<TDhcpServerReservations>({});

    function addReservation(
        ip: string,
        mac: string,
    ){
        if (!isValidIp(ip)) throw new InvalidIpv4AddressError(ip);
        if (!isValidMac(mac)) throw new Invalid48BitMacAddressError(mac);
        const newReservations = {...getReservations() };
        newReservations[ip] = { mac };
        setReservations(newReservations);
    }

    function removeReservation(
        ip: string
    ) {
        const newReservations = {...getReservations() };
        delete newReservations[ip];
        setReservations(newReservations);
    }

    function updateProperties(
        newProperties: Partial<TDhcpServerProperties>
    ) {
        const newState = {...getProperties(), ...newProperties };
        setProperties(newState);
    }

    return {
        getDHCPServerProperties: getProperties,
        updateDHCPServerProperties: updateProperties,
        subscribeToDHCPServerProperties: subscribeToProperties,
        getDHCPReservations: getReservations,
        addDHCPReservation: addReservation,
        removeDHCPReservation: removeReservation
    }

}