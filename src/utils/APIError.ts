import { APIErrors } from "./Constants";

type ErrorType = typeof APIErrors[keyof typeof APIErrors];

class APIError extends Error {
    private _type: ErrorType;
    private _error: string;

    get type() {
        return this._type;
    }

    get error() {
        return this._error;
    }

    constructor({ type, error }: { type: ErrorType; error?: string }) {
        super();

        this._type = type;
        this._error = error || type.error;
    }
}

export default APIError;