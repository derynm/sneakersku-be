import { createMiddleware } from 'hono/factory'
import { AppError } from '../errors/app-error'
import ERROR from '../const/error'

// You can adjust these roles based on your user model
export type UserRole = 'ADMIN' | 'USER'

export const allowedRoles = (allowedRoles: UserRole[]) => {
    return createMiddleware(async (c, next) => {
        const user = c.get('user')
        
        if (!user || !user.role) {
            throw new AppError(ERROR.USER_NOT_FOUND)
        }

        if (!allowedRoles.includes(user.role)) {
            throw new AppError({
                message: 'Insufficient permissions to access this resource',
                code: 'FORBIDDEN',
                status: 403
            })
        }

        await next()
    })
}