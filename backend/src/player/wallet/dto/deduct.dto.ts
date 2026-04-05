import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class DeductDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
