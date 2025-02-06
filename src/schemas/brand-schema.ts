import { z } from '@hono/zod-openapi'

export const BrandSchema = z.object({
    name: z.string().openapi({ example: "Nike" }),
    image_url: z.string().url().optional().openapi({ example: "https://example.com/nike." }) 
})