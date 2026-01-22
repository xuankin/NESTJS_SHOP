import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendOrderConfirmation(user: User, order: Order) {
        try {
            // Format tiền tệ
            const formatCurrency = (value: number) => {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
            };

            await this.mailerService.sendMail({
                to: user.email,
                subject: `Xác nhận đơn hàng #${order.id} - Đặt hàng thành công`,
                template: './order-confirmation', // Tên file template (không cần đuôi .hbs)
                context: {
                    // Truyền dữ liệu vào template
                    name: user.fullName || user.username,
                    orderId: order.id,
                    createdAt: new Date(order.CreatedAt).toLocaleString('vi-VN'),
                    totalAmount: formatCurrency(order.totalAmount),
                    shippingFee: formatCurrency(order.shippingFee),
                    discountAmount: formatCurrency(order.discountAmount),
                    finalAmount: formatCurrency(order.finalAmount),
                    items: order.items.map(item => ({
                        ...item,
                        priceFormatted: formatCurrency(item.price),
                        totalFormatted: formatCurrency(item.price * item.quantity)
                    })),
                    shippingAddress: order.shippingAddress,
                    phoneNumber: order.phoneNumber
                },
            });
            console.log(`📧 Email sent to ${user.email}`);
        } catch (error) {
            console.error('❌ Error sending email:', error);
        }
    }
}