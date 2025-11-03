import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    MaxLength,
    Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { VisitType } from '../../common/enums';

/**
 * DTO para crear un nuevo registro médico veterinario
 *
 * Validaciones:
 * - petId: requerido, debe ser UUID válido
 * - visitDate: requerido, formato fecha
 * - visitType: requerido, debe ser valor del enum VisitType
 * - reason: requerido, máximo 500 caracteres
 * - diagnosis: opcional, máximo 1000 caracteres
 * - treatment: opcional, máximo 1000 caracteres
 * - notes: opcional, máximo 2000 caracteres
 * - weightAtVisit: opcional, debe ser positivo
 * - temperature: opcional, debe ser positivo
 * - serviceCost: opcional, debe ser positivo o cero
 */
export class CreateMedicalRecordDto {

    @ApiProperty({
        description: 'ID de la mascota a la que pertenece este registro',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    petId: string;

    @ApiProperty({
        description: 'Fecha de la visita médica (formato ISO 8601)',
        example: '2024-01-15',
        type: String
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    visitDate: Date;

    @ApiProperty({
        description: 'Tipo de visita médica',
        enum: VisitType,
        example: VisitType.CONSULTATION
    })
    @IsEnum(VisitType)
    @IsNotEmpty()
    visitType: VisitType;

    @ApiProperty({
        description: 'Motivo de la consulta o síntomas',
        example: 'Vómito y diarrea desde hace 2 días',
        maxLength: 500
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason: string;

    @ApiProperty({
        description: 'Diagnóstico médico',
        example: 'Gastroenteritis aguda',
        required: false,
        maxLength: 1000
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    diagnosis?: string;

    @ApiProperty({
        description: 'Tratamiento prescrito (medicamentos, dosis, duración)',
        example: 'Metronidazol 250mg cada 12 hrs por 7 días. Dieta blanda.',
        required: false,
        maxLength: 1000
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    treatment?: string;

    @ApiProperty({
        description: 'Notas adicionales del veterinario',
        example: 'Recomendar seguimiento en 7 días si no mejora',
        required: false,
        maxLength: 2000
    })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    notes?: string;

    @ApiProperty({
        description: 'Array de prescripciones médicas con dosis e instrucciones',
        example: ['Vitamina C - 1 tableta diaria', 'Desparasitante - cada 3 meses'],
        required: false,
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    prescriptions?: string[];

    @ApiProperty({
        description: 'Fecha de seguimiento programada (formato ISO 8601)',
        example: '2024-02-15',
        required: false,
        type: String
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    followUpDate?: Date;

    @ApiProperty({
        description: 'Peso de la mascota en la visita (kg)',
        example: 25.5,
        required: false,
        minimum: 0.01
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    weightAtVisit?: number;

    @ApiProperty({
        description: 'Temperatura corporal (°C)',
        example: 38.5,
        required: false,
        minimum: 0
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    temperature?: number;

    @ApiProperty({
        description: 'Costo del servicio médico',
        example: 350.00,
        required: false,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    serviceCost?: number;

}
