import { OpenAPIHono, z } from "@hono/zod-openapi";
import { RegisterSchema, LoginSchema } from "../schemas/auth-schema";
import { PrismaClient } from "@prisma/client";

import { createJwt } from "../libs/jwt";
import { checkAuth } from '../middleware/auth';
import { ZodError } from "zod";

export const prisma = new PrismaClient();

const API_TAG = ["Auth"];

export const authRoute = new OpenAPIHono({
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
            method: 'post',
            path: '/register',
            summary: 'Register a new user',
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: RegisterSchema
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Successfully create new user.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof RegisterSchema> = await c.req.json();
                const user = await prisma.user.create({
                    data: {
                        name: body.name,
                        email : body.email,
                        password : await Bun.password.hash(body.password, {
                            algorithm: "argon2id",
                        }),
                    },
                    select: {
                        name: true,
                        role: true,
                    }
                });
                return c.json(user);
            } catch (error) {
                throw error;
            }
        }
    ) // register
    .openapi(
        {
            method: 'post',
            path: '/login',
            summary: 'Login user',
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: LoginSchema
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Successfully logged in.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof LoginSchema> = await c.req.json();
                const user = await prisma.user.findUnique({
                    where: {
                        email: body.email,
                    },
                });
                if (!user) {
                    return c.json({
                        message: "User not found",
                    });
                }
                const validPassword = await Bun.password.verify(body.password, user.password);

                if (!validPassword) {
                    return c.json({
                        message: "Invalid password",
                    });
                }

                const token = await createJwt(user.id, user.role);

                return c.json({
                    message: "Successfully logged in",
                    data: {
                        name: user.name,
                        token
                    }
                });
            } catch (error:any) {
                return c.json({
                    message: error.name,
                })
            }
        }

    ) // login
    .openapi(
        {
            method: 'get',
            path: '/me',
            summary: 'Get user logged in',
            security: [{ AUTH_TOKEN: [] }], 
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully get user logged in.",
                },
                401: {
                    description: "Unauthorized"
                }
            },
            tags: API_TAG,
        },
        async (c) => {
            // console.log(c.req.header());
            try {

                const tokenPayload = c.get('user');

                console.log(tokenPayload);

                const user = await prisma.user.findUnique({
                    where: {
                        id: (tokenPayload as any).id as string,
                    },
                    select: {
                        name: true,
                        email: true,
                    }
                });

                return c.json(user);
            } catch (error) {
                console.log((error as any).name);
                throw error;
            }
        },
    ) // get data user
