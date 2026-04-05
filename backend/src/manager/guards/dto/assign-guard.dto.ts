import { IsOptional, IsString } from 'class-validator';

export class AssignGuardDto {
  @IsString()
  @IsOptional()
  stadiumId!: string | null;
}
