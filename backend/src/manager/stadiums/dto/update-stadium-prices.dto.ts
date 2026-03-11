import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStadiumPricesDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  priceFullMatch?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  priceHalfMatch?: number;
}
