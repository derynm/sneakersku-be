import { z } from '@hono/zod-openapi'

export const CategorySchema = z.object({
    name: z.string().openapi({ example: "Sneakers" }),
    image_url: z.string().url().optional().openapi({ example: "https://example.com/sneakers."})
})