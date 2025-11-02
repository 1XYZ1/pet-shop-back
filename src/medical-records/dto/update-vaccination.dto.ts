import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVaccinationDto } from './create-vaccination.dto';

/**
 * DTO para actualizar un registro de vacunación existente
 *
 * Hereda de CreateVaccinationDto pero:
 * - Hace todos los campos opcionales (PartialType)
 * - Omite el campo petId (no debe cambiar una vez creado el registro)
 */
export class UpdateVaccinationDto extends PartialType(
    OmitType(CreateVaccinationDto, ['petId'] as const)
) {}
