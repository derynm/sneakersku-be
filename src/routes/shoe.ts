import { OpenAPIHono, z } from "@hono/zod-openapi";
import { ShoeCreateSchema } from "../schemas/shoe-schema";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";

import { checkAuth } from '../middleware/auth';
import { allowedRoles } from "../middleware/role";

export const prisma = new PrismaClient();

const API_TAG = ["Shoes"];

export const shoesRoute = new OpenAPIHono({
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
            path: '/',
            summary: 'Create a new shoe',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth, allowedRoles(['ADMIN'])],
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
                const shoes = await prisma.shoe.findMany(
                    {
                        include: {
                            brand: {
                                select: {
                                    name: true,
                                    image_url: true
                                }
                            },
                            category: {
                                select: {
                                    name: true,
                                    image_url: true
                                }
                            }
                        }
                    }
                );

                const shoesData = shoes.map(shoe => {
                    const variants = shoe.variants as Record<string, { image_url?: string }>;
                    const firstVariantWithImage = Object.values(variants).find(variant => variant.image_url);
                    
                    return {
                        ...shoe,
                        first_image: firstVariantWithImage?.image_url || null
                    };
                });

                return c.json(shoesData);
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
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    schema: {
                        type: 'integer'
                    },
                    required: true,
                    description: 'Shoe ID'
                }
            ],
            tags: API_TAG,
        },
        async (c) => {
            try {
                const shoe = await prisma.shoe.findUnique({
                    where: {
                        id: Number(c.req.param('id'))
                    },
                    include: {
                        brand: {
                            select: {
                                name: true,
                                image_url: true
                            }
                        },
                        category: {
                            select: {
                                name: true,
                                image_url: true
                            }
                        }
                    }
                });

                if (!shoe) {
                    return c.json({ message: "Shoe not found" }, 404);
                }
        
                const variants = shoe.variants as Record<string, { image_url?: string }>;
                const firstVariantWithImage = variants ? Object.values(variants).find(variant => variant.image_url) : null;
                
                return c.json({
                    ...shoe,
                    first_image: firstVariantWithImage?.image_url || null
                });
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
            middleware: [checkAuth, allowedRoles(['ADMIN'])],
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
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    schema: {
                        type: 'integer'
                    },
                    required: true,
                    description: 'Shoe ID'
                }
            ],
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