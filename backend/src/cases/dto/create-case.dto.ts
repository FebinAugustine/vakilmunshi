import { IsString, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateCaseDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  cnrNumber?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  nextHearing?: string;

  @IsOptional()
  @IsObject()
  caseContext?: any;
}
