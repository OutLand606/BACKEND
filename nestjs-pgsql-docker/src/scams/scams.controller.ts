import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ScamsService } from './scams.service';

@Controller('scams')
export class ScamsController {
  constructor(
    private readonly scamsService: ScamsService,
  ) {}

  @Get('dummy-data')
  async dummyData() {
    await this.scamsService.insertDummyDataRaw();
    return 'Data inserted success 1 million records';
  }


  @Get('search-engine')
  async searchEngineTest(@Query() query: any){
    const { email } = query;
    return this.scamsService.searchEngine(email)
  }

  // @Get('check-scam-email')
  // async findOneByEmail(@Query() query: any) {
  //   const { email } = query;
  //   return this.scamsService.findByEmail(email);
  // }

  // @Get('create-table-database')
  // async creaTableDatabase(){
  //   return this.scamsService.createTable()
  // }

  /////////////////////////////////////////////////

  @Get()
  async findAll(@Query() query: any) {
    const { limit } = query;
    const data = await this.scamsService.findAll(limit);
    return data;
  }

  @Get(':id')
  async findOneByID(@Param() param: any) {
    return this.scamsService.findOneById(Number(param?.id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.scamsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.scamsService.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: any) {
    return this.scamsService.remove(Number(id));
  }
}
