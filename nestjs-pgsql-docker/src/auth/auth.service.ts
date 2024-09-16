import { Injectable, Dependencies, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { DataSource, Repository } from 'typeorm';

@Dependencies(UsersService, JwtService)
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectDataSource() readonly connection: DataSource,
  ) {}

  async signIn(email, pass) {
    console.log(email,pass)
    const user = await this.usersService.findOne(email)
    if (user?.passWord !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.userName, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}