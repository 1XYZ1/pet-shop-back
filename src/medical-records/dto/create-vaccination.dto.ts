import { ApiProperty } from '@nestjs/swagger';
import {
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para registrar una nueva vacuna aplicada a una mascota
 *
 * Validaciones:
 * - petId: requerido, debe ser UUID válido
 * - vaccineName: requerido, máximo 200 caracteres
 * - administeredDate: requerido, formato fecha
 * - nextDueDate: opcional, formato fecha
 * - batchNumber: opcional, máximo 100 caracteres
 * - notes: opcional, máximo 1000 caracteres
 */
export class CreateVaccinationDto {

    @ApiProperty({
        description: 'ID de la mascota vacunada',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    petId: string;

    @ApiProperty({
        description: 'Nombre de la vacuna aplicada',
        example: 'Rabia',
        maxLength: 200
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    vaccineName: string;

    @ApiProperty({
        description: 'Fecha en que se aplicó la vacuna (formato ISO 8601)',
        example: '2024-01-15',
        type: String
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    administeredDate: Date;

    @ApiProperty({
        description: 'Fecha del próximo refuerzo (formato ISO 8601)',
        example: '2025-01-15',
        required: false,
        type: String
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    nextDueDate?: Date;

    @ApiProperty({
        description: 'Número de lote de la vacuna',
        example: 'LOT-2024-001234',
        required: false,
        maxLength: 100
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    batchNumber?: string;

    @ApiProperty({
        description: 'Notas adicionales sobre la vacunación',
        example: 'Aplicada en cuarto trasero derecho. Sin reacciones adversas.',
        required: false,
        maxLength: 1000
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    notes?: string;

}
