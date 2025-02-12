import { ErrorOptions } from "../types/error-types"

export class AppError extends Error {
    public status: number;
    public code: string;
    public details?: any;

    constructor(options: ErrorOptions) {
        super(options.message);
        this.status = options.status;
        this.code = options.code;
        this.details = options.details;
        this.name = "AppError";
    }
}