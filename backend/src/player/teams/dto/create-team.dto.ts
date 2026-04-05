import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Max members from 5 to 20' })
  @IsInt()
  @Min(5)
  @Max(20)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'number') {
      return value;
    }
    return Number.parseInt(String(value), 10);
  })
  maxMembers!: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  @Transform(
    ({ value }: { value: unknown }) => value === 'true' || value === true,
  )
  isPublic!: boolean;
}
