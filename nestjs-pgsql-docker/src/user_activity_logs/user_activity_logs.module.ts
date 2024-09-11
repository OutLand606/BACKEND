import { Module } from '@nestjs/common';
import { UserActivityLogsService } from './user_activity_logs.service';
import { UserActivityLogsController } from './user_activity_logs.controller';
import { UserActivityLogEntity } from './entities/user_activity_log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserActivityLogEntity]),
    BullModule.registerQueue({
      name: 'redisQueue',
    }),
  ],
  controllers: [UserActivityLogsController],
  providers: [UserActivityLogsService],
})
export class UserActivityLogsModule {}
