import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductAddDto } from './decorators/product-add.dto';
import { ProductUpdateDto } from './decorators/product-update.dto';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { AdminGuard } from '../auth/guards/AdminGuard';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  getAll() {
    return this.productService.getAll();
  }

  @Get(':id')
  getOne(@Param() params: { id: string }) {
    return this.productService.getOne(params.id);
  }

  @Post('/add')
  add(@Body() productData: ProductAddDto) {
    return this.productService.add(productData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  update(
    @Param() params: { id: string },
    @Body() productData: ProductUpdateDto,
  ) {
    return this.productService.update(params.id, productData);
  }

  @Post('/add-collection')
  addCollection(@Body() productsData: ProductAddDto[]) {
    return this.productService.addCollection(productsData);
  }

  @Delete('/remove-all')
  removeFullCollection() {
    return this.productService.removeFullCollection();
  }
}
