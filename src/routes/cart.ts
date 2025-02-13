import { OpenAPIHono, z } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import { Redis } from '@upstash/redis'
import { checkAuth } from '../middleware/auth';

export const prisma = new PrismaClient();
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

const API_TAG = ["Cart"];

const CartItemSchema = z.object({
    shoeId: z.number(),
    variantKey: z.string(),
    quantity: z.number().min(1),
});

const CheckoutSchema = z.object({
    address_id: z.number(),
});

const getCartKey = (userId: string) => `cart:${userId}`;

export const cartRoute = new OpenAPIHono({
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
            summary: 'Get cart contents',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully retrieved cart contents.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const userId = (c.get('user') as any).id;
                const cart = await redis.get(getCartKey(userId));
                return c.json(cart || {
                    userId,
                    items: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    total: 0
                });
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'post',
            path: '/items',
            summary: 'Add item to cart',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: CartItemSchema
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Successfully added item to cart.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const userId = (c.get('user') as any).id;
                const body = await c.req.json();
                
                const shoe = await prisma.shoe.findUnique({
                    where: { id: body.shoeId },
                    include: { brand: true, category: true }
                });

                if (!shoe) {
                    return c.json({ error: 'Shoe not found' }, 404);
                }

                const variants = shoe.variants as Record<string, any>;
                if (!variants[body.variantKey]) {
                    return c.json({ error: 'Variant not found' }, 404);
                }

                const cartKey = getCartKey(userId);
                const existingCart = await redis.get<any>(cartKey);
                const cart = existingCart || {
                    userId,
                    items: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    total: 0
                };

                const itemPrice = shoe.base_price + (variants[body.variantKey].price_adjustment || 0);
                const existingItemIndex = cart.items.findIndex(
                    (item: any) => item.shoeId === body.shoeId && item.variantKey === body.variantKey
                );

                if (existingItemIndex > -1) {
                    cart.items[existingItemIndex].quantity += body.quantity;
                } else {
                    cart.items.push({
                        shoeId: body.shoeId,
                        variantKey: body.variantKey,
                        quantity: body.quantity,
                        price: itemPrice,
                        name: `${shoe.name} - ${body.variantKey}`
                    });
                }

                cart.total = cart.items.reduce((sum: number, item: any) => 
                    sum + (item.price * item.quantity), 0);
                cart.updatedAt = Date.now();

                await redis.set(cartKey, cart);
                return c.json(cart);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'put',
            path: '/items/{shoeId}/{variantKey}',
            summary: 'Update item quantity',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: z.object({
                                quantity: z.number().min(0)
                            })
                        }
                    }
                }
            },
            parameters: [
                {
                    in: 'path',
                    name: 'shoeId',
                    schema: {
                        type: 'integer'
                    },
                    required: true,
                    description: 'Shoe ID'
                },
                {
                    in: 'path',
                    name: 'variantKey',
                    schema: {
                        type: 'string'
                    },
                    required: true,
                    description: 'Shoe variant key'
                }
            ],
            responses: {
                200: {
                    description: "Successfully updated item quantity.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const userId = (c.get('user') as any).id;
                const shoeId = parseInt(c.req.param('shoeId') as string);
                const variantKey = c.req.param('variantKey');
                const { quantity } = await c.req.json();
                
                const cartKey = getCartKey(userId);
                const cart = await redis.get<any>(cartKey);
                
                if (!cart) {
                    return c.json({ error: 'Cart not found' }, 404);
                }

                const itemIndex = cart.items.findIndex(
                    (item: any) => item.shoeId === shoeId && item.variantKey === variantKey
                );

                if (itemIndex === -1) {
                    return c.json({ error: 'Item not found in cart' }, 404);
                }

                if (quantity === 0) {
                    cart.items.splice(itemIndex, 1);
                } else {
                    cart.items[itemIndex].quantity = quantity;
                }

                cart.total = cart.items.reduce((sum: number, item: any) => 
                    sum + (item.price * item.quantity), 0);
                cart.updatedAt = Date.now();

                await redis.set(cartKey, cart);
                return c.json(cart);
            } catch (error) {
                throw error;
            }
        }
    )
    .openapi(
        {
            method: 'post',
            path: '/checkout',
            summary: 'Checkout cart',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: CheckoutSchema
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Successfully checked out cart.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const userId = (c.get('user') as any).id;
                const { address_id } = await c.req.json();
                
                // Get cart
                const cartKey = getCartKey(userId);
                const cart = await redis.get<any>(cartKey);
                
                if (!cart || cart.items.length === 0) {
                    return c.json({ error: 'Cart is empty' }, 400);
                }

                // Validate address
                const address = await prisma.address.findFirst({
                    where: {
                        id: address_id,
                        user_id: userId
                    }
                });

                if (!address) {
                    return c.json({ error: 'Invalid address' }, 400);
                }

                const transaction = await prisma.transaction.create({
                    data: {
                        user_id: userId,
                        address_id: address_id,
                        total_amount: cart.total,
                        items: cart.items
                    }
                });

                await redis.del(cartKey);

                return c.json({
                    message: 'Checkout successful',
                    transactionId: transaction.id
                });
            } catch (error) {
                throw error;
            }
        }
    );