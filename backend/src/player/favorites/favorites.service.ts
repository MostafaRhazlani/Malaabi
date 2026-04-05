import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlayerFavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, stadiumId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { favoriteStadiums: { select: { id: true } } },
    });

    if (!user) throw new NotFoundException('User not found');

    const isFavorite = user.favoriteStadiums.some((s) => s.id === stadiumId);

    if (isFavorite) {
      // Remove from favorites
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          favoriteStadiums: {
            disconnect: { id: stadiumId },
          },
        },
      });
    } else {
      // Add to favorites
      // First verify stadium exists
      const stadium = await this.prisma.stadium.findUnique({
        where: { id: stadiumId },
      });
      if (!stadium) throw new NotFoundException('Stadium not found');

      return this.prisma.user.update({
        where: { id: userId },
        data: {
          favoriteStadiums: {
            connect: { id: stadiumId },
          },
        },
      });
    }
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteStadiums: {
          include: {
            manager: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });
    return user?.favoriteStadiums || [];
  }
}
