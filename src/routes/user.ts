import { OpenAPIHono, z } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";

import { checkAuth } from '../middleware/auth';

export const prisma = new PrismaClient();

const API_TAG = ["User"];

export const userRoute = new OpenAPIHono({
    defaultHook: (result, c) => {
        if (result.success) {
            return;
        }
        if (result.error instanceof ZodError) {
            return c.json({
                message: "Validation error",
                details: result.error.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            }, 400);
        }
    }})
    .openapi(
        {
            method: 'get',
            path: '/',
            summary: 'Get User Profile',
            security: [{ AUTH_TOKEN: [] }], 
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully Get User Profile.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        id: (c.get('user') as any).id
                    },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                        addresses: {
                            select: {
                                id: true,
                                label: true,
                                is_primary: true,
                                street: true,
                            }
                        }
                    }
                });
                return c.json(user);
            } catch (error) {
                throw error;
            }
        }
    )