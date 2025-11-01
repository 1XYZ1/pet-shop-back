import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ProductCategory } from '../../common/enums';

/**
 * DTO para filtrar y paginar productos en el endpoint GET /api/products
 * Incluye múltiples criterios de búsqueda y filtrado avanzado
 */
export class FindProductsQueryDto {
  /**
   * Límite de productos por página
   * Rango permitido: 1-100 productos
   * Valor por defecto: 10
   */
  @ApiProperty({
    default: 10,
    description: 'Número máximo de productos a retornar (paginación)',
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // Transforma el string del query param a number
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(100, { message: 'El límite máximo es 100' })
  limit?: number = 10;

  /**
   * Offset para saltar productos (usado en paginación)
   * Debe ser mayor o igual a 0
   * Valor por defecto: 0
   */
  @ApiProperty({
    default: 0,
    description: 'Número de productos a omitir (paginación)',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // Transforma el string del query param a number
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset mínimo es 0' })
  offset?: number = 0;

  /**
   * Búsqueda de texto libre en título y descripción
   * Insensible a mayúsculas/minúsculas
   */
  @ApiProperty({
    description:
      'Término de búsqueda para filtrar por título o descripción del producto',
    example: 'collar',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser un texto' })
  q?: string;

  /**
   * Filtro por categoría del producto
   * Permite: cats, dogs
   * Filtra productos específicos para gatos o perros
   */
  @ApiProperty({
    description: 'Filtrar productos por categoría',
    enum: ProductCategory,
    example: ProductCategory.DOGS,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductCategory, {
    message: 'La categoría debe ser: cats o dogs',
  })
  category?: ProductCategory;

  /**
   * Filtro por tallas disponibles
   * Formato: valores separados por comas (ej: "S,M,L")
   * Busca productos que tengan AL MENOS UNA de las tallas especificadas
   */
  @ApiProperty({
    description:
      'Filtrar productos por tallas (separadas por comas). Ejemplo: "S,M,L"',
    example: 'S,M,L',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las tallas deben ser un texto separado por comas' })
  sizes?: string;

  /**
   * Precio mínimo del producto
   * Debe ser un número mayor o igual a 0
   */
  @ApiProperty({
    description: 'Precio mínimo del producto',
    example: 10.0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // Transforma el string del query param a number
  @IsNumber({}, { message: 'El precio mínimo debe ser un número' })
  @Min(0, { message: 'El precio mínimo debe ser mayor o igual a 0' })
  minPrice?: number;

  /**
   * Precio máximo del producto
   * Debe ser un número mayor o igual a 0
   */
  @ApiProperty({
    description: 'Precio máximo del producto',
    example: 100.0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // Transforma el string del query param a number
  @IsNumber({}, { message: 'El precio máximo debe ser un número' })
  @Min(0, { message: 'El precio máximo debe ser mayor o igual a 0' })
  maxPrice?: number;
}
