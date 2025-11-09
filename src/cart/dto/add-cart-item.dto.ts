import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsString } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Product ID to add to cart',
  })
  @IsUUID('4', { message: 'El ID de producto debe ser un UUID válido' })
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity to add',
    minimum: 1,
  })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @ApiProperty({
    example: 'XL',
    description: 'Product size',
  })
  @IsString({ message: 'La talla debe ser un texto válido' })
  size: string;
}
