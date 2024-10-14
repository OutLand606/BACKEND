import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { BullModule } from '@nestjs/bull';
import { ScamsModule } from './scams/scams.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { UserActivityLogsModule } from './user_activity_logs/user_activity_logs.module';
import { CrawlWebPuppeterModule } from './crawl_web_puppeter/crawl_web_puppeter.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { AndroidModule } from './android/android.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sa',
      password: 'sa',
      database: 'sa',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ScamsModule,
    UserActivityLogsModule,
    CrawlWebPuppeterModule,
    AuthModule,
    UsersModule,
    AndroidModule,
  ],
  controllers: [],
  providers: [
    // using authentication all Controller
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
