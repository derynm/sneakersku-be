import { createMiddleware } from 'hono/factory'
import { PrismaClient } from "@prisma/client";

import { AppError } from '../errors/app-error';
import ERROR from '../const/error';

import { verifyJwt } from '../libs/jwt';

export const prisma = new PrismaClient();

export const checkAuth = createMiddleware(async (c, next) => {
    const tokenHeader = c.req.header("Authorization");

    if (!tokenHeader) {
        throw new AppError(ERROR.HEADER_AUTH_MISSING);
    }   

    const token = await verifyJwt(tokenHeader.split(" ")[1]);


    const user = await prisma.user.findUnique({
        where: {
            id: token?.sub.user_id,
        },
    });

    if (!user) {
        throw new AppError(ERROR.USER_NOT_FOUND);
    }

    c.set("user", user);
    await next();
});
