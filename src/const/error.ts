import { ErrorOptions } from "../types/error-types"

const ERROR = {
    HEADER_AUTH_MISSING: {
        status: 401,
        message: "Authorization header is missing",
        code: "HEADER_AUTH_MISSING",
    },
    INVALID_TOKEN_AUTH: {
        status: 401,
        message: "Invalid token",
        code: "INVALID_TOKEN_AUTH",
    },
    USER_NOT_FOUND: {
        status: 404,
        message: "User not found",
        code: "USER_NOT_FOUND",
    },
} as const

export default ERROR as Record<keyof typeof ERROR, ErrorOptions> 

