import { ultraState } from "ultra-light.js";
import type { IUltraDhcpLease, IUltraDHCPServerConfig, TDhcpServerProperties, TDhcpServerReservations } from "@/types/TConfig";
import { isValidIp, isValidMac } from "@/utils/network_lib";
import { InvalidIpv4AddressError, Invalid48BitMacAddressError } from '@/errors'

export default function ultraDhcpServerConfig(): Record<"dhcpserver", IUltraDHCPServerConfig> {

    const [
        getProperties
        , setProperties
        , subscribeToProperties
    ] = ultraState<TDhcpServerProperties>({
        "state": true,
        "listenOnIfaces": [],
        "offerRangeStart": "",
        "offerRangeEnd": "",
        "offerNetmask": "",
        "offerGateway": "",
        "offerDns": "",
        "offerLeaseTime": 0
    });

    const [
        getLeases
        , setLeases
        , subscribeToLeases
    ] = ultraState<Record<string, IUltraDhcpLease>>({});

    const [
        getReservations
        , setReservations
        ,
    ] = ultraState<TDhcpServerReservations>({});

    let intervalId: NodeJS.Timeout | null = null;

    //private methods
    function updateLeasesTime() {
        intervalId = setInterval(() => {
            const currLeases = { ...getLeases() };
            for (const lease in currLeases) {
                currLeases[lease].leaseTime -= 1;
                if (currLeases[lease].leaseTime <= 0) {
                    delete currLeases[lease];
                }
            }
            setLeases(currLeases);
            if (Object.keys(currLeases).length === 0
                && intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }, 1000);
    }

    //public methods
    function addReservation(
        ip: string,
        mac: string,
    ) {
        if (!isValidIp(ip)) throw new InvalidIpv4AddressError(ip);
        if (!isValidMac(mac)) throw new Invalid48BitMacAddressError(mac);
        const newReservations = { ...getReservations() };
        newReservations[ip] = { mac };
        setReservations(newReservations);
    }

    function removeReservation(
        ip: string
    ) {
        const newReservations = { ...getReservations() };
        delete newReservations[ip];
        setReservations(newReservations);
    }

    function updateProperties(
        newProperties: Partial<TDhcpServerProperties>
    ) {
        const newState = { ...getProperties(), ...newProperties };
        setProperties(newState);
    }

    function assignIp(
        mac: string,
    ): string | null {
        const newLeases = { ...getLeases() };
        const ip = '192.168.1.100'; //TODO: change this to a random IP from the available IPs
        newLeases[ip] = {
            mac,
            leaseTime: getProperties().offerLeaseTime
        }
        setLeases(newLeases);
        if (intervalId === null) updateLeasesTime();
        return ip;
    }

    function removeIp(
        ip: string
    ) {
        const newLeases = { ...getLeases() };
        delete newLeases[ip];
        setLeases(newLeases);
    }

    return {
        dhcpserver: {
            getProperties: getProperties,
            updateProperties: updateProperties,
            subscribeToProperties: subscribeToProperties,
            getReservations,
            addReservation: addReservation,
            removeReservation: removeReservation,
            assignIp,
            removeIp,
            getLeases,
            subscribeToLeases
        }
    }

}