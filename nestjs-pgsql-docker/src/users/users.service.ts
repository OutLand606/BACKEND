import {
  Injectable,
  Dependencies,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly UserEntity: Repository<UserEntity>,
    @InjectDataSource() readonly connection: DataSource,
  ) {}

  async findOne(email: any) {
    const data = await this.connection.query(`
      select * from user_table where email = N'${email}'
    `);
    return {
      id: data[0]?.id,
      userName: data[0]?.user_name,
      passWord: data[0]?.pass,
    };
  }

  async create(data: any) {
    return this.UserEntity.save(data);
  }

  async update(id: any, updateData: any) {
    return await this.UserEntity.update(id, updateData);
  }

  async remove(id: any) {
    await this.UserEntity.delete(id);
  }
}
