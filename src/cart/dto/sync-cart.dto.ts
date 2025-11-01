import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { AddCartItemDto } from './add-cart-item.dto';

/**
 * DTO para sincronizar el carrito de un usuario invitado con su carrito autenticado
 *
 * Este DTO se utiliza cuando un usuario ha agregado productos al carrito sin estar
 * autenticado (guardados en localStorage del frontend) y luego inicia sesión.
 *
 * El proceso de sincronización intentará agregar todos los items del carrito invitado
 * al carrito del usuario autenticado, manejando conflictos y errores de manera individual.
 */
export class SyncCartDto {
  @ApiProperty({
    description: 'Array de items del carrito invitado a sincronizar con el carrito autenticado',
    type: [AddCartItemDto],
    example: [
      {
        productId: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        quantity: 2,
        size: 'XL',
      },
      {
        productId: 'a1b2c3d4-e5f6-4a3b-9c8d-7e6f5a4b3c2d',
        quantity: 1,
        size: 'M',
      },
    ],
  })
  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'At least one item must be provided for synchronization' })
  @ValidateNested({ each: true, message: 'Each item must be a valid cart item' })
  @Type(() => AddCartItemDto)
  items: AddCartItemDto[];
}
