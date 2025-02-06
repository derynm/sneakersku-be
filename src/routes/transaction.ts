import { OpenAPIHono, z } from "@hono/zod-openapi";
import { TransactionSchema } from "../schemas/transaction-schema";
import { PrismaClient } from "@prisma/client";

import { checkAuth } from '../middleware/auth';

export const prisma = new PrismaClient();

const API_TAG = ["Transaction"];

export const transactionRoute = new OpenAPIHono()
    .openapi(
        {
            method: 'get',
            path: '/',
            summary: 'Get all transactions',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            responses: {
                200: {
                    description: "Successfully get all transactions.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const transactions = await prisma.transaction.findMany({
                    where: {
                        user_id: (c.get('user') as any).id
                    }
                });
                return c.json(transactions);
            } catch (error) {
                throw error;
            }
        }
        
    )
    .openapi(
        {
            method: 'post',
            path: '/',
            summary: 'Create a new transaction',
            security: [{ AUTH_TOKEN: [] }],
            middleware: [checkAuth],
            request: {
                body: {
                    content: {
                        'application/json': {
                            schema: TransactionSchema
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Successfully create new transaction.",
                },
            },
            tags: API_TAG,
        },
        async (c) => {
            try {
                const body: z.infer<typeof TransactionSchema> = await c.req.json();
                const transaction = await prisma.transaction.create({
                    data: {
                        user_id: (c.get('user') as any).id,
                        address_id: body.address_id,
                        total_amount: body.total_amount,
                        items: body.items,
                    },
                });
                return c.json(transaction);
            } catch (error) {
                throw error;
            }
        }
    )