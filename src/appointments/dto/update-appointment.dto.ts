import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../common/enums';

/**
 * DTO para actualizar una cita existente
 * Hereda todos los campos de CreateAppointmentDto pero los hace opcionales
 * Agrega campo status para cambiar el estado de la cita
 */
export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
    required: false,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
}
