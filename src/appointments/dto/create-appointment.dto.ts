import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

/**
 * DTO para crear una nueva cita
 * Valida todos los campos requeridos y opcionales según las reglas de negocio
 */
export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Appointment date and time in ISO 8601 format',
    example: '2025-11-05T10:00:00.000Z',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Pet name',
    example: 'Max',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  petName: string;

  @ApiProperty({
    description: 'Pet breed (optional)',
    example: 'Golden Retriever',
    required: false,
  })
  @IsString()
  @IsOptional()
  petBreed?: string;

  @ApiProperty({
    description: 'Additional notes about the appointment or pet',
    example: 'Primera vez que viene, es un poco nervioso',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Service ID (UUID)',
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  })
  @IsUUID()
  serviceId: string;
}
