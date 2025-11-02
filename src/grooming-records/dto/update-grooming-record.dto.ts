import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateGroomingRecordDto } from './create-grooming-record.dto';

/**
 * DTO para actualizar un registro de grooming existente
 *
 * Hereda de CreateGroomingRecordDto pero:
 * - Hace todos los campos opcionales (PartialType)
 * - Omite el campo petId (no debe cambiar una vez creado el registro)
 */
export class UpdateGroomingRecordDto extends PartialType(
    OmitType(CreateGroomingRecordDto, ['petId'] as const)
) {}
