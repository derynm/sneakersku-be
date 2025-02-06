import { z } from '@hono/zod-openapi'

export const AddressSchema = z.object({
    street: z.string().openapi({ example: "Jl.Kura kura" }),
    phone: z.string().openapi({ example: "08123456789" }),
    label: z.string().openapi({ example: "Home" }),
    is_primary: z.boolean().openapi({ example: true }),
})