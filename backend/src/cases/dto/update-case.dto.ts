import { IsString, IsOptional, IsDateString, IsObject } from 'class-validator';

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  cnrNumber?: string;

  @IsOptional()
  @IsString()
  title?: string;

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
