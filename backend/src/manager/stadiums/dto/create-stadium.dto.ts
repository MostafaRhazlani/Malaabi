import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StadiumType } from 'generated/prisma/enums';

export class CreateStadiumDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsEnum(StadiumType)
  @IsOptional()
  stadiumType?: StadiumType;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

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

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
}
