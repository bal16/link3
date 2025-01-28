import { Prisma, PrismaClient } from '@prisma/client';

class Repository extends PrismaClient<Prisma.PrismaClientOptions, string> {}

export const linkRepo = new Repository().link;
export type LinkRepo = typeof linkRepo;
