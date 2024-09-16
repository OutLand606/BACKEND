import {
  Injectable,
  Dependencies,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;
  constructor(
    @InjectRepository(UserEntity)
    private readonly UserEntity: Repository<UserEntity>,
    @InjectDataSource() readonly connection: DataSource,
  ) {}

  async findOne(email: any) {
    return await this.UserEntity.findOne({ where: { email: email } });
  }

  async createUser({ username, email, password }) {
    const existingUser = await this.findOne(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    const data = {
      userName: username,
      email: email,
      passWord: hashedPassword,
    };
    return await this.UserEntity.save(data);
  }

  async remove(id: any) {
    await this.UserEntity.delete(id);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
