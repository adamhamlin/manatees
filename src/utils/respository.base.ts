import { PrismaClient } from '@prisma/client';

import {prismaClient} from '../../prisma/client';

export class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }
}