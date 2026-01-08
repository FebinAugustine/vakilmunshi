import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CaseContextService } from './case-context.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly caseContextService: CaseContextService,
  ) {}

  @Post()
  create(@Body() createCaseDto: CreateCaseDto, @Request() req) {
    return this.casesService.create(createCaseDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.casesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.casesService.findOne(id, req.user.userId);
  }

  @Get(':id/context')
  getCaseContext(@Param('id') id: string, @Request() req) {
    return this.caseContextService.getAggregatedContext(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
    @Request() req,
  ) {
    return this.casesService.update(id, updateCaseDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.casesService.remove(id, req.user.userId);
  }
}
