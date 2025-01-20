import { OpenAPIHono, z } from "@hono/zod-openapi";
import { RegisterSchema, LoginSchema } from "../schemas/auth-schema";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const API_TAG = ["Auth"];

export const authRoute = new OpenAPIHono()
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
                });
                return c.json(user);
            } catch (error) {
                throw error;
            }
        }
    )
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

                console.log(user, 'user.password');
                console.log(body);
                const validPassword = await Bun.password.verify(body.password, user.password);
                if (!validPassword) {
                    return c.json({
                        message: "Invalid password",
                    });
                }
                return c.json({
                    message: "Successfully logged in",
                    data: {
                        name: user.name,
                    }
                });
            } catch (error) {
                throw error;
            }
        }

    )