import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { AppointmentStatus } from '../../common/enums';

/**
 * DTO para filtrar citas con múltiples criterios
 * Permite búsqueda por estado, servicio, rango de fechas y paginación
 */
export class FindAppointmentsQueryDto {
  @ApiProperty({
    default: 10,
    description: 'Número máximo de citas a retornar (paginación)',
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    default: 0,
    description: 'Número de citas a omitir (paginación)',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Filtrar citas por estado',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Filtrar citas por servicio (UUID)',
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({
    description: 'Fecha desde (ISO 8601 format)',
    example: '2025-11-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    description: 'Fecha hasta (ISO 8601 format)',
    example: '2025-11-30T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
