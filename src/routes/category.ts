import { OpenAPIHono, z } from "@hono/zod-openapi";
import { CategorySchema } from "../schemas/category-schema";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";


import { checkAuth } from '../middleware/auth';

export const prisma = new PrismaClient();

const API_TAG = ["Category"];

export const categoriesRoute = new OpenAPIHono({
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
            summary: 'Get all categories',
            responses: {
                200: {
                    description: "Successfully get all categories.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const categories = await prisma.brand.findMany();
                return c.json(categories);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'get',
            path: '/{id}',
            summary: 'Get a category by id',
            responses: {
                200: {
                    description: "Successfully get category by id.",
                },
            },
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    schema: {
                        type: 'integer'
                    },
                    required: true,
                    description: 'Category ID'
                }
            ],
            tags: API_TAG,
        },
        async (c) => {
            try {
                console.log(c.req.param(), 'where are you');
                const id = c.req.param('id');
                if (!id) {
                    throw new Error('Id is required');
                }
                const category = await prisma.category.findUnique({
                    where: {
                        id: parseInt(id),
                    },
                });
                return c.json(category);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'post',
            path: '/',
            summary: 'Create a new category',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: CategorySchema
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Successfully create new category.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof CategorySchema> = await c.req.json();
                const category = await prisma.category.create({
                    data: {
                        name: body.name,
                        image_url: body?.image_url ?? '',
                    },
                });
                return c.json(category);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'put',
            path: '/{id}',
            summary: 'Update a category by id',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: CategorySchema
                        }
                    }
                }
            },
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    schema: {
                        type: 'integer'
                    },
                    required: true,
                    description: 'Category ID'
                }
            ],
            responses: {
                200: {
                    description: "Successfully update category by id.",
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
                const body: z.infer<typeof CategorySchema> = await c.req.json();
                const category = await prisma.category.update({
                    where: {
                        id: parseInt(id),
                    },
                    data: {
                        name: body.name,
                        image_url: body?.image_url ?? '',
                    },
                });
                return c.json(category);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'delete',
            path: '/{id}',
            summary: 'Delete a category',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully delete category.",
                },
            },
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    schema: {
                        type: 'integer'
                    },
                    required: true,
                    description: 'Category ID'
                }
            ],
            tags: API_TAG,
        },
        async (c) => {
            try {
                const id = c.req.param('id');
                if (!id) {
                    throw new Error('Id is required');
                }
                const category = await prisma.category.delete({
                    where: {
                        id: parseInt(id),
                    },
                });
                return c.json(category);
            } catch (error) {
                throw error;
            }
        }
    )