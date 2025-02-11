import { NotFoundError } from 'elysia';
import { nanoid } from 'nanoid';
import { LinkRepo, linkRepo } from '@/repository';
import {
  CreateLinkRequest,
  CreateLinkResponse,
  GetLinkResponse,
  WebResponse,
} from '@/model';
import { BASE_URL } from '../const';

abstract class Service {
  protected linkRepo: LinkRepo;
  constructor(repo: LinkRepo) {
    this.linkRepo = repo;
  }
}
export class LinkService extends Service {
  constructor() {
    super(linkRepo);
  }

  async create(
    data: CreateLinkRequest,
  ): Promise<WebResponse<CreateLinkResponse>> {
    if (data.slug) {
      const count = await this.linkRepo.count({
        where: {
          slug: data.slug,
        },
      });
      if (count > 0) {
        data.slug = data.slug + nanoid(3);
      }
    } else {
      data.slug = nanoid(6);
    }

    const link = await this.linkRepo.create({
      data: {
        source: data.source,
        slug: data.slug,
      },
    });

    return {
      message: 'Link created',
      errors: false,
      data: {
        id: link.id,
        source: link.source,
        slug: link.slug,
        result: `${BASE_URL}/${link.slug}`,
      },
    };
  }
  async getURL(slug: string): Promise<string | null> {
    const link = await this.linkRepo.findFirst({
      where: {
        slug,
      },
      select: {
        source: true,
      },
    });

    if (!link) {
      return null;
    }
    return link.source;
  }

  async list(
    page = 1,
    take = 5,
    search?: string,
  ): Promise<WebResponse<GetLinkResponse>> {
    const skip = (page - 1) * take;
    const where = search ? {
      OR: [
        {
          source: {
            contains: search,
          },
        },
        {
          slug: {
            contains: search,
          },
        },
      ],
    } : {};
    const storedLinks = await this.linkRepo!.findMany({
      where,
      skip,
      take,
    });

    const links = storedLinks.map((link) => ({
      id: link.id,
      source: link.source,
      result: `${BASE_URL}/${link.slug}`,
    }));

    const total = await this.linkRepo.count({
      where,
    });

    return {
      message: 'Links found',
      data: links,
      page: {
        size: take,
        current: page,
        total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async destroy(id: string): Promise<WebResponse<string>> {
    const link = await this.linkRepo.findFirst({
      where: {
        id,
      },
    });
    if (!link) {
      throw new NotFoundError('Item not found');
    }
    await this.linkRepo.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Link deleted',
      errors: false,
    };
  }
}

export const linkService = new LinkService();
