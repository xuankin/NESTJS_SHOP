import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}


    @Post('vnpay/create_url')
    createPaymentUrl(@Body() dto: { amount: number; orderId: string; language?: string }, @Req() req: Request) {

        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        return this.paymentsService.createVnPayUrl(
          dto.amount,
          dto.orderId,
          ipAddr as string,
          dto.language
        );
    }


    @Get('vnpay/ipn')
    @Public()
    async vnpayIpn(@Query() query: any) {
        return this.paymentsService.handleVnPayIpn(query);
    }


    @Get('vnpay/return')
    @Public()
    vnpayReturn(@Query() query: any, @Res() res: Response) {


        const code = query['vnp_ResponseCode'];
        if (code === '00') {

            return res.redirect(`http://localhost:3001/checkout/success?orderId=${query['vnp_TxnRef']}`);
        } else {

            return res.redirect(`http://localhost:3001/checkout/failed`);
        }
    }
}