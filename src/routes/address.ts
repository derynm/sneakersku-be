import { OpenAPIHono, z } from "@hono/zod-openapi";
import { AddressSchema } from "../schemas/address-schema";
import { PrismaClient } from "@prisma/client";

import { checkAuth } from '../middleware/auth';

export const prisma = new PrismaClient();

const API_TAG = ["Address"];

export const addressRoute = new OpenAPIHono()
    .openapi(
        {
            method: 'get',
            path: '/',
            summary: 'Get all Address',
            security: [{ AUTH_TOKEN: [] }], 
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully get all Address.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const address = await prisma.address.findMany();
                return c.json(address);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'post',
            path: '/',
            summary: 'Create a new Address',
            security: [{ AUTH_TOKEN: [] }], 
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: AddressSchema
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Successfully create new Address.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof AddressSchema> = await c.req.json();
                const address = await prisma.address.create({
                    data: {
                        street: body.street,
                        phone: body.phone,
                        label: body.label,
                        is_primary: body.is_primary,
                        user_id: (c.get('user') as any).id,
                    },
                });
                return c.json(address);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'put',
            summary: 'Update a Address by id',
            path: '/{id}',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: AddressSchema
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Successfully update Address.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof AddressSchema> = await c.req.json();
                const address = await prisma.address.update({
                    where: {
                        id: Number(c.req.param('id')),
                    },
                    data: {
                        street: body.street,
                        phone: body.phone,
                        label: body.label,
                        is_primary: body.is_primary,
                    },
                });
                return c.json(address);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'patch',
            summary: 'Set primary Address by id',
            path: '/{id}/primary',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully set primary Address.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                await prisma.address.updateMany({
                    where: {
                        user_id: (c.get('user') as any).id,
                    },
                    data: {
                        is_primary: false,
                    },
                });
                const addressPrimary = await prisma.address.update({
                    where: {
                        id: Number(c.req.param('id')),
                    },
                    data: {
                        is_primary: true,
                    },
                });
                return c.json(addressPrimary);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'delete',
            summary: 'Delete a Address by id',
            path: '/{id}',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully delete Address.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const address = await prisma.address.delete({
                    where: {
                        id: Number(c.req.param('id')),
                    },
                });
                return c.json(address);
            } catch (error) {
                throw error;
            }
        }
    )