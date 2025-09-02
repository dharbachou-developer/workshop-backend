import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductAddDto } from './decorators/product-add.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    // return this.prisma.product.findMany();
    const t = await this.prisma.$queryRawUnsafe(
      'SELECT * FROM "Product" where rating = 4.8 or 1 = 1',
    );
    return t;
  }

  async getOne(id: string) {
    return this.prisma.product.findUnique({ where: { id: id } });
  }

  async add(productData: ProductAddDto) {
    const product = await this.prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (product) {
      throw new ConflictException('Product with this slug already exists');
    }

    return this.prisma.product.create({ data: productData });
  }

  async update(id: string, productData: ProductAddDto) {
    return this.prisma.product.update({
      data: { ...productData },
      where: { id: id },
    });
  }

  addCollection(productsData: ProductAddDto[]) {
    return this.prisma.product.createMany({ data: productsData });
  }

  removeFullCollection() {
    return this.prisma.product.deleteMany();
  }
}
