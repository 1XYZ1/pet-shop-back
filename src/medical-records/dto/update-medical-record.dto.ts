import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMedicalRecordDto } from './create-medical-record.dto';

/**
 * DTO para actualizar un registro médico existente
 *
 * Hereda de CreateMedicalRecordDto pero:
 * - Hace todos los campos opcionales (PartialType)
 * - Omite el campo petId (no debe cambiar una vez creado el registro)
 *
 * Permite actualizar uno o varios campos sin necesidad de enviar toda la información
 */
export class UpdateMedicalRecordDto extends PartialType(
    OmitType(CreateMedicalRecordDto, ['petId'] as const)
) {}
