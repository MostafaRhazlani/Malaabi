import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly uploadService: UploadService,
  ) {}

  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.updateUser(id, updateUserDto);
  }

  async updateProfileImage(id: string, file: Express.Multer.File) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (user.profile_img) {
      await this.uploadService.deleteFile(user.profile_img);
    }

    const profile_img = await this.uploadService.saveFile(
      `profiles/${id}`,
      file,
    );
    return this.userRepository.updateUser(id, { profile_img });
  }

  async remove(id: string) {
    return this.userRepository.remove(id);
  }
}
