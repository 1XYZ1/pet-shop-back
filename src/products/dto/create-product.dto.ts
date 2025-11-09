import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength
} from 'class-validator';
import { ProductSpecies, ProductType } from '../../common/enums';

/**
 * DTO para crear un nuevo producto
 * Valida todos los campos requeridos y opcionales según las reglas de negocio
 */
export class CreateProductDto {

  @ApiProperty({
    description: 'Product title (unique)',
    nullable: false,
    minLength: 1,
    example: 'Alimento Premium para Perros Adultos',
  })
  @IsString({ message: 'El título debe ser un texto válido' })
  @MinLength(1, { message: 'El título no puede estar vacío' })
  title: string;

  @ApiProperty({
    description: 'Product price',
    example: 45.99,
  })
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsPositive({ message: 'El precio debe ser mayor a cero' })
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Product description',
    example: 'Alimento balanceado premium para perros adultos con proteínas de alta calidad',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product SLUG for SEO (auto-generated if not provided)',
    example: 'alimento_premium_perros_adultos',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Product stock quantity',
    example: 50,
  })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @IsPositive({ message: 'El stock debe ser mayor a cero' })
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Product sizes',
    example: ['3kg', '7kg', '15kg'],
  })
  @IsString({ each: true, message: 'Cada talla debe ser un texto válido' })
  @IsArray({ message: 'Las tallas deben ser un arreglo' })
  sizes: string[]

  @ApiProperty({
    description: 'Product type (food, accessories, toys, hygiene, etc.)',
    enum: ProductType,
    example: ProductType.ALIMENTO_SECO,
  })
  @IsEnum(ProductType, { message: 'El tipo de producto no es válido' })
  type: ProductType;

  @ApiProperty({
    description: 'Pet species (optional - some products work for both cats and dogs)',
    enum: ProductSpecies,
    example: ProductSpecies.DOGS,
    required: false,
  })
  @IsEnum(ProductSpecies)
  @IsOptional()
  species?: ProductSpecies;

  @ApiProperty({
    description: 'Product tags for search and filtering',
    example: ['perro', 'adulto', 'premium', 'alimento'],
    required: false,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty({
    description: 'Product images URLs',
    example: ['product-1.jpg', 'product-2.jpg'],
    required: false,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

}
