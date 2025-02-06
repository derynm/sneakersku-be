import { OpenAPIHono, z } from "@hono/zod-openapi";
import { BrandSchema } from "../schemas/brand-schema";
import { PrismaClient } from "@prisma/client";

import { checkAuth } from '../middleware/auth';

export const prisma = new PrismaClient();

const API_TAG = ["Brand"];

export const brandRoute = new OpenAPIHono()
    .openapi(
        {
            method: 'get',
            path: '/',
            summary: 'Get all brands',
            responses: {
                200: {
                    description: "Successfully get all brands.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const brands = await prisma.brand.findMany();
                return c.json(brands);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'get',
            path: '/{id}',
            summary: 'Get a brand by id',
            responses: {
                200: {
                    description: "Successfully get brand by id.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const id = c.req.param('id');
                if (!id) {
                    throw new Error('Id is required');
                }
                const brand = await prisma.brand.findUnique({
                    where: {
                        id: parseInt(id),
                    },
                });
                return c.json(brand);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'post',
            path: '/',
            summary: 'Create a new brand',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: BrandSchema
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Successfully create new brand.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof BrandSchema> = await c.req.json();
                const user = await prisma.brand.create({
                    data: {
                        name: body.name,
                        image_url: body?.image_url ?? '',
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
            method: 'put',
            path: '/{id}',
            summary: 'Update a brand by id',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: BrandSchema
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Successfully update brand by id.",
                },
            },
            tags: API_TAG,
            
        },
        async (c) => {
            try {
                const id = c.req.param('id');
                if (!id) {
                    throw new Error('Id is required');
                }
                const body: z.infer<typeof BrandSchema> = await c.req.json();
                const brand = await prisma.brand.update({
                    where: {
                        id: parseInt(id),
                    },
                    data: {
                        name: body.name,
                        image_url: body?.image_url ?? '',
                    },
                });
                return c.json(brand);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'delete',
            path: '/{id}',
            summary: 'Delete a brand',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully delete brand.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const id = c.req.param('id');
                if (!id) {
                    throw new Error('Id is required');
                }
                const brand = await prisma.brand.delete({
                    where: {
                        id: parseInt(id),
                    },
                });
                return c.json(brand);
            } catch (error) {
                throw error;
            }
        }
    )
