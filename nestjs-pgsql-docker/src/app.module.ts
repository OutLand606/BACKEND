import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { BullModule } from '@nestjs/bull';
import { ScamsModule } from './scams/scams.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

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
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
