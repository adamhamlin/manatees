import { randomUUID } from 'node:crypto';

import type { UserId, UserWithProfile } from '@manatees/shared/types';
import { User as UserRecord } from '@prisma/client';

import { DisplayNameConflictError, UserNotFoundError } from '@common/utils/errors';

import { User } from './user';
import { UserRepository } from './user.repository';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserOrThrow(id: UserId): Promise<User> {
    const user = await this.findById(id);
    return new User(user.id, user.email, user.name, user.displayName);
  }

  async getProfileOrThrow(id: UserId): Promise<UserWithProfile> {
    const user = await this.findById(id);
    return this.toUserWithProfile(user);
  }

  async updateUserProfile(id: UserId, updates: { displayName?: string | null }): Promise<UserWithProfile> {
    await this.findById(id);
    const { displayName } = updates;
    if (displayName && (await this.userRepository.findByName(displayName, id))) {
      throw new DisplayNameConflictError(displayName);
    }
    const user = await this.userRepository.updateById(id, updates);
    return this.toUserWithProfile(user);
  }

  /** Dev-only: find or create a fake-Google user whose displayName equals their name. */
  async upsertFromDevLogin(name: string): Promise<UserRecord> {
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'user';
    const googleSub = `dev:${slug}`;
    const existing = await this.userRepository.findByGoogleSub(googleSub);
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    if (await this.userRepository.findByName(name, id)) {
      throw new DisplayNameConflictError(name);
    }
    return this.userRepository.upsertByGoogleSub(
      googleSub,
      { id, googleSub, email: `${slug}@fake-google.local`, name, displayName: name },
      {}
    );
  }

  /** Find or create the user for a verified Google identity, refreshing Google-owned fields. */
  async upsertFromGoogle(input: { googleSub: string; email: string; name: string }): Promise<UserRecord> {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    return this.userRepository.upsertByGoogleSub(
      input.googleSub,
      { id: randomUUID(), googleSub: input.googleSub, email, name },
      { email, name }
    );
  }

  private async findById(id: string): Promise<UserRecord> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }

  private toUserWithProfile(user: UserRecord): UserWithProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
