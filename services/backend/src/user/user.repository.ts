import { UserId } from '@manatees/shared/types';
import type { Prisma, User as UserRecord } from '@prisma/client';

import { BaseRepository } from '@repository/repository.base';

export class UserRepository extends BaseRepository {
  findById(id: UserId): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByGoogleSub(googleSub: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { googleSub } });
  }

  /** Find a user by name (case-insensitive). */
  findByName(name: string, excludeId: UserId): Promise<UserRecord | null> {
    return this.prisma.user.findFirst({
      where: {
        id: { not: excludeId },
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  upsertByGoogleSub(
    googleSub: string,
    create: Prisma.UserCreateInput,
    update: Prisma.UserUpdateInput
  ): Promise<UserRecord> {
    return this.prisma.user.upsert({ where: { googleSub }, create, update });
  }

  updateById(id: UserId, data: Prisma.UserUpdateInput): Promise<UserRecord> {
    return this.prisma.user.update({ where: { id }, data });
  }
}
