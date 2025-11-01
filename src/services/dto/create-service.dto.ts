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
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Servicio de peluquería básica que incluye baño, secado y corte de uñas',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    description: 'Service price in dollars',
    example: 35.00,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    example: 90,
  })
  @IsInt()
  @IsPositive()
  durationMinutes: number;

  @ApiProperty({
    description: 'Service type (grooming or veterinary)',
    enum: ServiceType,
    example: ServiceType.GROOMING,
  })
  @IsEnum(ServiceType)
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
