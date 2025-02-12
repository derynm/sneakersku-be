import { OpenAPIHono } from "@hono/zod-openapi";
// import { ZodError } from "zod";
// import { HTTPException } from "hono/http-exception";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AppError } from "./app-error";

interface ErrorResponse {
    success: false;
    error: {
        status: number;
        message: string;
        code: string;
        details?: any;
    };
}

export const errorHandler = (app: OpenAPIHono) => {
    app.onError((err, c) => {
        console.error("Error:", err);

    let response: ErrorResponse = {
        success: false,
        error: {
            status: 500,
            message: "Internal Server Error",
            code: "INTERNAL_ERROR"
        },
    };

    // if (err instanceof ZodError) {
    //     response.error = {
    //         status: 400,
    //         message: "Validation Error",
    //         code: "VALIDATION_ERROR",
    //         details: err.errors.map((e) => ({
    //             field: e.path.join("."),
    //             message: e.message,
    //         })),
    //     };
    // } else if (err instanceof PrismaClientKnownRequestError) {
    //     switch (err.code) {
    //     case "P2002":
    //         response.error = {
    //             status: 409,
    //             message: "Unique constraint violation",
    //             code: "DUPLICATE_ENTRY",
    //             details: {
    //                 fields: err.meta?.target,
    //             },
    //         };
    //         break;
    //         default:
    //         response.error = {
    //             status: 400,
    //             message: "Database error",
    //             code: err.code,
    //         };
    //     }
    // }
    if (err instanceof AppError) {
        response.error = {
            status: err.status,
            message: err.message,
            code: err.code,
            details: err.details,
        };
    }

        return c.json(response, response.error.status as any);
    });
};