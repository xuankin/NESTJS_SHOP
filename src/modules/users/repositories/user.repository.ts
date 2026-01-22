import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {User} from "../entities/user.entity";

@Injectable()
export class UserRepository extends Repository<User>{
    constructor(private datasource: DataSource) {
        super(User,datasource.createEntityManager()) ;
    }
   async findByEmail(email: string) :Promise<User|null> {
        return  this.findOne({where: {email}})
    }
   async findByName(username: string) :Promise<User|null> {
        return this.findOne({where:{username}})
   }
    async findByEmailForAuth(email: string): Promise<User | null> {
        return this.createQueryBuilder('user')
            .addSelect('user.password') // Ép buộc lấy trường password
            .where('user.email = :email', { email })
            .getOne();
    }
    async findByUsernameForAuth(username: string): Promise<User | null> {
        return this.createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.username = :username', { username })
            .getOne();
    }

}