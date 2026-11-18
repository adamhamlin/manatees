import { BaseRepository } from '@repository/repository.base';

export class AuthRepository extends BaseRepository {
  async isTokenInvalidated(tokenHash: string): Promise<boolean> {
    return (await this.prisma.invalidatedSession.findUnique({ where: { tokenHash } })) !== null;
  }

  async invalidateToken(tokenHash: string): Promise<void> {
    await this.prisma.invalidatedSession.upsert({
      where: { tokenHash },
      create: { tokenHash },
      update: {},
    });
  }
}
