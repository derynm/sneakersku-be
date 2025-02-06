import { OpenAPIHono, z } from "@hono/zod-openapi";
import { ShoeCreateSchema } from "../schemas/shoe-schema";
import { PrismaClient } from "@prisma/client";

import { checkAuth } from '../middleware/auth';

export const prisma = new PrismaClient();

const API_TAG = ["Shoes"];

export const shoesRoute = new OpenAPIHono()
    .openapi(
        {
            method: 'post',
            path: '/',
            summary: 'Create a new shoe',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: ShoeCreateSchema
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Successfully create new shoe.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof ShoeCreateSchema> = await c.req.json();
                const user = await prisma.shoe.create({
                    data: {
                        name: body.name,
                        description: body.description,
                        base_price: body.base_price,
                        brand_id: body.brand_id,
                        category_id: body.category_id,
                        variants: body.variants,
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
            method: 'get',
            path: '/',
            summary: 'Get all shoes',
            responses: {
                200: {
                    description: "Successfully get all shoes.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const shoes = await prisma.shoe.findMany();
                return c.json(shoes);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'get',
            path: '/{id}',
            summary: 'Get a shoe by id',
            responses: {
                200: {
                    description: "Successfully get a shoe by id.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const shoe = await prisma.shoe.findUnique({
                    where: {
                        id: Number(c.req.param('id'))
                    }
                });
                return c.json(shoe);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'put',
            path: '/{id}',
            summary: 'Update a shoe by id',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: ShoeCreateSchema
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Successfully update a shoe by id.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof ShoeCreateSchema> = await c.req.json();
                const shoe = await prisma.shoe.update({
                    where: {
                        id: Number(c.req.param('id'))
                    },
                    data: {
                        name: body.name,
                        description: body.description,
                        base_price: body.base_price,
                        brand_id: body.brand_id,
                        category_id: body.category_id,
                        variants: body.variants,
                    },
                });
                return c.json(shoe);
            } catch (error) {
                throw error;
            }
        }
    )