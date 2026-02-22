export class IllegalArgumentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "IllegalArgumentError";
    }
}

export class EmptyArgumentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EmptyArgumentError";
    }
}

export class AlignmentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AlignmentError";
    }
}

export class PcFormValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class AlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AlreadyExistsError";
    }
}

export class InvalidMacAddressError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidMacAddressError";
    }
}

export class NotFoundMacRecord extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundMacRecord";
    }
}

export class ConnectionAlreadyEstablishedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConnectionAlreadyEstablishedError";
    }
}

export class NoAvailableInterfaceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NoAvailableInterfaceError";
    }
}

export class InterfaceNotConnectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InterfaceNotConnectedError";
    }
}

export class InterfaceDoesNotExistError extends Error {
    constructor(ifaceId: string) {
        const message = `The interface "${ifaceId}" does not exist.`;
        super(message);
        this.name = "InterfaceDoesNotExistError";
    }
}

export class NotConfiguredError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotConfiguredError";
    }
}

export class InvalidIpAddressError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidIpAddressError";
    }
}

export class MaxInterfacesError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MaxInterfacesError";
    }
}

export class MinimumInterfacesError extends Error {
    constructor() {
        const message = `At least one interface is required.`;
        super(message);
        this.name = "MinimumInterfacesError";
    }
}

export class DirectoryDoesNotExistError extends Error {
    constructor(directory: string) {
        const message = `The directory ${directory} does not exist.`;
        super(message);
        this.name = "DirectoryDoesNotExistError";
    }
}

export class FileDoesNotExistError extends Error {
    constructor(file: string) {
        const message = `The file ${file} does not exist.`;
        super(message);
        this.name = "FileDoesNotExistError";
    }
}

export class DirectoryIsNotADirectoryError extends Error {
    constructor(directory: string) {
        const message = `The directory ${directory} is not a directory.`;
        super(message);
        this.name = "DirectoryIsNotADirectoryError";
    }
}

export class FileIsNotAFileError extends Error {
    constructor(file: string) {
        const message = `The file ${file} is not a file.`;
        super(message);
        this.name = "FileIsNotAFileError";
    }
}

export class InvalidIpv4AddressError extends Error {
    constructor(ip: string) {
        const message = `The IP address ${ip} is not a valid IPv4 address.`;
        super(message);
        this.name = "InvalidIpv4AddressError";
    }
}

export class Invalid48BitMacAddressError extends Error {
    constructor(mac: string) {
        const message = `The MAC address ${mac} is not a valid MAC address.`;
        super(message);
        this.name = "InvalidMacAddressError";
    }
}

export class DirectoryAlreadyExistsError extends Error {
    constructor(directory: string) {
        const message = `The directory ${directory} already exists.`;
        super(message);
        this.name = "DirectoryAlreadyExistsError";
    }
}