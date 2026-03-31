import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class TopUpDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
