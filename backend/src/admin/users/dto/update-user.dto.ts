import { PartialType } from '@nestjs/swagger';
import { CreateManagerDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateManagerDto) {}
