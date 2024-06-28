// src/scams/scams.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Scam } from './entities/scam.entity';
import { faker } from '@faker-js/faker';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class ScamsService {
  constructor(
    @InjectRepository(Scam)
    private readonly scamsRepository: Repository<Scam>,
    @InjectDataSource() readonly connection: DataSource,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findAll(limit = 1000000, offset = 0) {
    const maxLimit = 1000000;
    const finalLimit = limit > maxLimit ? maxLimit : limit;

    return this.scamsRepository.find({
      take: finalLimit,
      skip: offset,
      order: {
        id: 'ASC',
      },
    });
  }

  async findOneById(id: any) {
    return await this.scamsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async create(scamData: any) {
    return this.scamsRepository.save(scamData);
  }

  async update(id: any, updateData: any) {
    await this.scamsRepository.update(id, updateData);
    return this.scamsRepository.findOne(id);
  }

  async remove(id: any) {
    await this.scamsRepository.delete(id);
  }

  /////////////////////////////////////////////////

  async insertDummyDataRaw() {
    const batchSize = 1000; // Maximum number of row values allowed per insert
    const parallelBatches = 10; // Number of parallel insert operations
    const totalRecords = 1000000;

    // Function to generate data for a batch
    const generateBatch = async () => {
      const batch = [];
      for (let i = 0; i < batchSize; i++) {
        const is_scam = await this.randomBoolean();
        const email = faker.internet.email();
        batch.push({ email, is_scam });
      }
      return batch;
    };

    // Function to insert a single batch
    const insertBatch = async (batch) => {
      await this.scamsRepository.save(batch);
    };

    // Function to handle parallel batch insertions
    const processInserts = async (start, end) => {
      for (let i = start; i < end; i += batchSize) {
        const batch = await generateBatch();
        insertBatch(batch);

        if (i % (batchSize * 10) === 0) {
          console.log(`${i} records inserted`);
        }
      }
    };

    // Divide the total records into parallel batches
    const tasks = [];
    const recordsPerTask = totalRecords / parallelBatches;
    for (let i = 0; i < parallelBatches; i++) {
      const start = i * recordsPerTask;
      const end = start + recordsPerTask;
      tasks.push(processInserts(start, end));
    }

    // Wait for all parallel tasks to complete
    await Promise.all(tasks);

    console.log('1 million records inserted using TypeORM');
  }

  async randomBoolean() {
    const data = Math.random() < 0.5;
    if (data) {
      return true;
    } else {
      return false;
    }
  }

  async searchEngine(email: string) {
    const cachedData = await this.redis.get(`emails:${email}`);

    if (cachedData) {
      console.log('Cache hit');
      return JSON.parse(cachedData);
    }

    const data = await this.scamsRepository.find({
      take: 100,
      where: {
        email: ILike(`%${email}%`),
      },
    });

    const uniqueData = Array.from(
      new Set(data.map((item) => JSON.stringify(item))),
    ).map((item) => JSON.parse(item));

    await this.redis.set(
      `emails:${email}`,
      JSON.stringify(uniqueData),
      'EX',
      10 * 60,
    );

    console.log('data', uniqueData);
    return uniqueData;
  }

  //Test
  // async findAll(limit, offset = 0) {
  //   const maxLimit = 1000000;
  //   const finalLimit = limit > maxLimit ? maxLimit : limit;
  //   const results = [];
  //   let totalFetched = 0;

  //   while (totalFetched < finalLimit) {
  //     const batchLimit = Math.min(finalLimit - totalFetched, 100000);
  //     const batch = await this.scamsRepository.find({
  //       take: batchLimit,
  //       skip: offset + totalFetched,
  //       order: {
  //         id: 'ASC',
  //       },
  //     });

  //     const batchCount = batch.length;
  //     results.push(...batch);
  //     totalFetched += batchCount;

  //     if (batchCount < batchLimit) {
  //       break;
  //     }

  //     await new Promise((resolve) => setImmediate(resolve));
  //   }

  //   console.log('totalFetched:', totalFetched);
  //   return results;
  // }

  // async createTable() {
  //   return this.connection.query(
  //     `
  //     CREATE TABLE scams_table (
  //     id SERIAL PRIMARY KEY,
  //     email VARCHAR(255) NOT NULL,
  //     is_scam BOOLEAN DEFAULT FALSE);
  //   `,
  //     [],
  //   );
  // }

  // async findByEmail(email) {
  //   const data = await this.scamsRepository.findOne({
  //     where: {
  //       email,
  //     },
  //   });
  //   return {
  //     scam: data.is_scam,
  //   };
  // }
}
