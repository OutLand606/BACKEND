import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserActivityLogEntity } from './entities/user_activity_log.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { After } from 'helper/after.decorator';
import AfterInsertDatabase from './after/afterInsertDatabase';
import { Before } from 'helper/before.decorator';
import BeforeInsertDatabase from './before/beforeInsertDatabase';
import { Around } from 'helper/around.decorator';
import aroundInsertDatabase from './around/aroundInsertDatabase';

@Injectable()
export class UserActivityLogsService {
  constructor(
    @InjectRepository(UserActivityLogEntity)
    private readonly userActivityLogEntity: Repository<UserActivityLogEntity>,
    @InjectDataSource() readonly connection: DataSource,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findOneById(id: any) {
    return await this.userActivityLogEntity.findOne({
      where: {
        id,
      },
    });
  }

  async create(data: any) {
    return this.userActivityLogEntity.save(data);
  }

  async update(id: any, updateData: any) {
    return await this.userActivityLogEntity.update(id, updateData);
  }

  async remove(id: any) {
    await this.userActivityLogEntity.delete(id);
  }

  @Before(BeforeInsertDatabase)
  @Around(aroundInsertDatabase)
  @After(AfterInsertDatabase)
  async getDataRawQuery(total: number,body:{}) {
    const data = await this.connection.query(
      `
      SELECT *
      FROM user_activity_logs
      WHERE activity_date > '20024-01-01'
      AND activity_date < '2024-09-02'
      AND (activity_date, log_id) > ('20024-01-01', 10000000)
      ORDER BY activity_date ASC, log_id ASC
      LIMIT ${total};
      `
    );
    return data;
  }
}
