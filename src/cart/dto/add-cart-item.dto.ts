import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsString } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Product ID to add to cart',
  })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity to add',
    minimum: 1,
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiProperty({
    example: 'XL',
    description: 'Product size',
  })
  @IsString({ message: 'Size must be a string' })
  size: string;
}
