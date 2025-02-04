import { createMiddleware } from 'hono/factory'
import { PrismaClient } from "@prisma/client";

import { verifyJwt } from '../libs/jwt';

export const prisma = new PrismaClient();

export const checkAuth = createMiddleware(async (c, next) => {
    const tokenHeader = c.req.header("Authorization");

    if (!tokenHeader) {
        return c.json({ message: "Authorization header is missing" }, 401);
    }   

    const token = await verifyJwt(tokenHeader.split(" ")[1]);

    if (!token) {
        return c.json({ message: "Invalid token" }, 401);
    }

    console.log(token.sub.user_id);

    const user = await prisma.user.findUnique({
        where: {
            id: token.sub.user_id,
        },
    });

    if (!user) {
        return c.json({ message: "User not found" }, 404);
    }

    c.set("user", user);
    await next();
});
