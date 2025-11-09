import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ServiceType } from '../../common/enums';

/**
 * DTO para crear un nuevo servicio en la tienda de mascotas
 * Valida todos los campos requeridos según las reglas de negocio
 */
export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Peluquería Canina Básica',
    minLength: 3,
  })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Servicio de peluquería básica que incluye baño, secado y corte de uñas',
    minLength: 10,
  })
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description: string;

  @ApiProperty({
    description: 'Service price in dollars',
    example: 35.00,
  })
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsPositive({ message: 'El precio debe ser mayor a cero' })
  price: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    example: 90,
  })
  @IsInt({ message: 'La duración debe ser un número entero' })
  @IsPositive({ message: 'La duración debe ser mayor a cero' })
  durationMinutes: number;

  @ApiProperty({
    description: 'Service type (grooming or veterinary)',
    enum: ServiceType,
    example: ServiceType.GROOMING,
  })
  @IsEnum(ServiceType, { message: 'El tipo de servicio no es válido' })
  type: ServiceType;

  @ApiProperty({
    description: 'Service image URL',
    example: 'grooming-basic.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;
}
