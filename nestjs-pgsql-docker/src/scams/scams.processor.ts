import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Scam } from './entities/scam.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScamsService } from './scams.service';

@Processor('redisQueue')
export class ScamsQueueProcessor {
  constructor(
    private ScamsService: ScamsService,
  ) {}

  // @Process('findOne')
  // async findOne(job: Job<{ id: any }>): Promise<Scam> {
  //   const { id } = job.data;
  //   return await this.ScamsService.findOneById(id);
  // }
}
