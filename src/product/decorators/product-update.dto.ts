import {
  IsArray,
  IsDecimal,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ProductUpdateDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsDecimal()
  price: number;

  @IsDecimal()
  @Min(0)
  @Max(5)
  rating: number;

  @IsNumber()
  stock: number;

  @IsString()
  tag: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}
