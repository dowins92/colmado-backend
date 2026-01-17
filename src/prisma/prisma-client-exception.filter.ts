import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const message = exception.message.replace(/\n/g, '');

        switch (exception.code) {
            case 'P2002': {
                const status = HttpStatus.CONFLICT;
                const meta = exception.meta as Record<string, any>;
                let target = 'record';

                if (meta?.target) {
                    target = Array.isArray(meta.target)
                        ? meta.target.join(', ')
                        : String(meta.target);
                }

                console.error(`[Prisma Conflict] Code: ${exception.code}, Target: ${target}, Meta:`, meta);

                response.status(status).json({
                    statusCode: status,
                    message: `Ya existe un registro con el mismo valor en: ${target}.`,
                    error: 'Conflict',
                    target: target
                });
                break;
            }
            case 'P2025': {
                const status = HttpStatus.NOT_FOUND;
                response.status(status).json({
                    statusCode: status,
                    message: 'Record not found',
                    error: 'Not Found',
                });
                break;
            }
            default:
                // default 500 error code
                super.catch(exception, host);
                break;
        }
    }
}
