import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar un servicio existente
 * Hereda todos los campos de CreateServiceDto pero los hace opcionales
 * Agrega campo isActive para activar/desactivar servicios
 */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({
    description: 'Is service active and available for booking',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
