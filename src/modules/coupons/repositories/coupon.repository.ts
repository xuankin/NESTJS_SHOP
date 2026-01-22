import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {Coupon} from "../entities/coupon.entity";

@Injectable()
export class CouponRepository extends Repository<Coupon>{
    constructor(private dataSource :DataSource) {
        super(Coupon,dataSource.createEntityManager());
    }
    async findByCode(code:string):Promise<Coupon|null> {
        return this.findOne({where:{code:code}});
    }
    async findValidCoupon(code:string):Promise<Coupon[]> {
        const now = new Date();
        return this.createQueryBuilder('coupon')
            .where('coupon.isActive =: isActive',{isActive:true})
            .andWhere('coupon.startDate <= now',{now})
            .andWhere('coupon.endDate >= now',{now})
            .getMany();
    }
}