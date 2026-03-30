import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MatchType } from 'generated/prisma/enums';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  stadiumId: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsEnum(MatchType)
  @IsNotEmpty()
  matchType: MatchType;
}
