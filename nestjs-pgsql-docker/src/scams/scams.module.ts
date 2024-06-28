// src/scams/scams.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScamsController } from './scams.controller';
import { ScamsService } from './scams.service';
import { Scam } from './entities/scam.entity';
import { BullModule } from '@nestjs/bull';
import { ScamsQueueProcessor } from './scams.processor';
import { AppModule } from 'src/app.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Scam]),
    BullModule.registerQueue({
      name: 'redisQueue',
    }),
  ],
  controllers: [ScamsController],
  providers: [ScamsService,ScamsQueueProcessor],
})
export class ScamsModule {}
