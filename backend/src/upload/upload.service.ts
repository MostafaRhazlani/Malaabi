import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { promises as fs } from 'fs';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

@Injectable()
export class UploadService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  async saveFiles(
    folder: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files.length) return [];

    const invalid = files.filter((f) => !ALLOWED_MIME.has(f.mimetype));
    if (invalid.length) {
      throw new BadRequestException(
        `Only image files are allowed (JPEG, PNG, WebP, GIF, AVIF). Rejected: ${invalid.map((f) => f.originalname).join(', ')}`,
      );
    }

    const dir = join(this.uploadsDir, folder);
    await fs.mkdir(dir, { recursive: true });

    return Promise.all(
      files.map(async (file) => {
        const ext = extname(file.originalname).toLowerCase() || '.jpg';
        const filename = `${randomUUID()}${ext}`;
        await fs.writeFile(join(dir, filename), file.buffer);
        return `/uploads/${folder}/${filename}`;
      }),
    );
  }

  async deleteFile(urlPath: string): Promise<void> {
    if (!urlPath.startsWith('/uploads/')) return;
    const rel = urlPath.slice('/uploads/'.length);
    await fs.unlink(join(this.uploadsDir, rel)).catch(() => {});
  }

  async deleteFolder(folder: string): Promise<void> {
    await fs
      .rm(join(this.uploadsDir, folder), { recursive: true, force: true })
      .catch(() => {});
  }
}
