import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";
import {map, Observable} from "rxjs";
import {Reflector} from "@nestjs/core";
import {response} from "express";
import {RESPONSE_MESSAGE_KEY} from "../decorators/response-message.decorator";

export  interface Response<T>{
        statusCode: number;
        message: string;
        data: T;
}
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T,Response<T>>{
    constructor(private reflector: Reflector) {}
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return  next.handle().pipe(
            map((data) => ({
                statusCode: context.switchToHttp().getResponse().statusCode,
                message: this.reflector.get<string>(
                    RESPONSE_MESSAGE_KEY,
                    context.getHandler(),
                ) || 'Success',
                data: data,
            })),
        );
    }
}
