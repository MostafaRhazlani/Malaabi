import { IsEnum, IsNotEmpty } from 'class-validator';
import { StadiumStatus } from 'generated/prisma/enums';

export class UpdateStadiumStatusDto {
  @IsNotEmpty()
  @IsEnum(StadiumStatus)
  status: StadiumStatus;
}
