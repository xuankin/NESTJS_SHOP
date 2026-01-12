import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception.getStatus
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = exception.getResponse();

        // Lấy message lỗi chi tiết
        const message =
            typeof exceptionResponse === 'object' && (exceptionResponse as any).message
                ? (exceptionResponse as any).message
                : exception.message;

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
        });
    }
}