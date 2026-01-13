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
    constructor(message: string) {
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