import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { LoginDto } from './dtos/login-dto';

@Injectable()
export class AuthService {
    constructor(private readonly userRepository: UserRepository) { }

    async login(loginDto: LoginDto) {
        const user = await this.userRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }


        return {
            message: 'User found',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        };
    }
}
