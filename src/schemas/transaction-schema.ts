import { z } from 'zod';

export const TransactionSchema = z.object({
    user_id: z.string().nonempty(),
    address_id: z.number().int(),
    total_amount: z.number().int().positive(),
    items: z.array(z.object({
        id: z.number().int(),
        quantity: z.number().int().positive(),
        amount: z.number().int().positive(),
    })),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;