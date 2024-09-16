import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './metadata';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: Record<string, any>) {
    return this.authService.signIn(body.email, body.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  async register(@Body() body) {
    const { username, email, password } = body;
    const newUser = await this.authService.register({ username, email, password });
    return {
      message: 'User registered successfully',
      user: newUser,
    };
  }
}
