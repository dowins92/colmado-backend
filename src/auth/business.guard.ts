import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * BusinessGuard ensures tenant isolation by verifying that users can only
 * access resources from their own business (except SUPERADMIN who has access to all)
 */
@Injectable()
export class BusinessGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        // Inject businessId into request for use in services if available
        if (user.businessId) {
            request.businessId = user.businessId;
        }

        // SUPERADMIN can access all businesses
        if (user.role === 'SUPERADMIN') {
            return true;
        }

        // For other roles, verify they have businessId
        if (!request.businessId) {
            throw new ForbiddenException('No business context found in token');
        }

        return true;
    }
}
