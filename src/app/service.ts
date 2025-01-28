import { LinkRepo, linkRepo } from './repository';
import { CreateLinkRequest, CreateLinkResponse } from './model/link.model';
import { nanoid } from 'nanoid';
import { WebResponse } from './model';
import { BASE_URL } from '../const';

abstract class Service {
  protected linkRepo: LinkRepo | null;
  constructor() {
    this.linkRepo = null;
  }
}
export class LinkService extends Service {
  constructor() {
    super();
    this.linkRepo = linkRepo;
  }

  async create(
    data: CreateLinkRequest,
  ): Promise<WebResponse<CreateLinkResponse>> {
    data.slug = data.slug || nanoid(6);

    const link = await this.linkRepo!.create({
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
  async getURL(slug: string): Promise<string|null> {
    const link = await this.linkRepo!.findFirst({
      where: {
        slug,
      },
      select: {
        source: true,
      },
    });

    if (!link) {
      // throw new HTTPEX('Link not found');
    }
    return link?.source || null;
  }
}

export const linkService = new LinkService();
