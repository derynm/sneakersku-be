import { z } from '@hono/zod-openapi'

export const RegisterSchema = z.object({
  name: z.string().min(5).max(80).openapi({ example: "Cegan Cou" }),
  email: z.string().email().openapi({ example: "regan.coue@mail.com" }),
  password: z.string().min(8).openapi({ example: "Password123" }),
});

export const LoginSchema = z.object({
  email: z.string().email().openapi({ example: "regan.coue@mail.com" }),
  password: z.string().min(8).openapi({ example: "Password123" }),
})
