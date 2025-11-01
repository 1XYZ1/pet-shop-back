import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive, Min } from 'class-validator';
import { ProductCategory } from '../enums';

/**
 * DTO genérico para paginación de resultados
 * Incluye limit, offset y filtro por categoría de producto
 */
export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // enableImplicitConversions: true
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows do you want to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) // enableImplicitConversions: true
  offset?: number;

  @ApiProperty({
    default: '',
    description: 'Filter results by category',
    enum: ProductCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}
