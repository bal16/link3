import { nanoid } from 'nanoid';
import { LinkRepo, linkRepo } from './repository';
import {
  CreateLinkRequest,
  CreateLinkResponse,
  GetLinkResponse,
  WebResponse,
} from './model';
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
        data.slug = data.slug + nanoid(6);
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

  async list(page = 1, take = 5): Promise<WebResponse<GetLinkResponse>> {
    const skip = (page - 1) * take;
    const storedLinks = await this.linkRepo!.findMany({
      skip,
      take,
    });

    const links = storedLinks.map((link) => ({
      id: link.id,
      source: link.source,
      result: `${BASE_URL}/${link.slug}`,
    }));

    const total = await this.linkRepo.count();

    return {
      message: 'Links found',
      data: links,
      page: {
        size: take,
        current: page,
        total,
      },
    };
  }
}

export const linkService = new LinkService();
