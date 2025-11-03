import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsDate,
    IsInt,
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

/**
 * DTO para crear un nuevo registro de sesión de grooming
 *
 * Validaciones:
 * - petId: requerido, debe ser UUID válido
 * - sessionDate: requerido, formato fecha
 * - servicesPerformed: requerido, array de strings (mínimo 1 servicio)
 * - hairStyle: opcional, máximo 300 caracteres
 * - productsUsed: opcional, array de strings
 * - skinCondition: opcional, máximo 500 caracteres
 * - coatCondition: opcional, máximo 500 caracteres
 * - behaviorDuringSession: opcional, máximo 500 caracteres
 * - observations: opcional, máximo 1000 caracteres
 * - recommendations: opcional, máximo 1000 caracteres
 * - durationMinutes: opcional, debe ser entero positivo
 * - serviceCost: opcional, debe ser positivo o cero
 */
export class CreateGroomingRecordDto {

    @ApiProperty({
        description: 'ID de la mascota a la que pertenece esta sesión',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    petId: string;

    @ApiProperty({
        description: 'Fecha de la sesión de grooming (formato ISO 8601)',
        example: '2024-01-15',
        type: String
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    sessionDate: Date;

    @ApiProperty({
        description: 'Array de servicios realizados durante la sesión',
        example: ['Baño', 'Corte de pelo', 'Corte de uñas'],
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    servicesPerformed: string[];

    @ApiProperty({
        description: 'Estilo de corte de pelo aplicado',
        example: 'Corte puppy',
        required: false,
        maxLength: 300
    })
    @IsString()
    @IsOptional()
    @MaxLength(300)
    hairStyle?: string;

    @ApiProperty({
        description: 'Array de productos utilizados durante la sesión',
        example: ['Shampoo hipoalergénico', 'Acondicionador para pelo largo'],
        required: false,
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    productsUsed?: string[];

    @ApiProperty({
        description: 'Condición de la piel observada',
        example: 'Normal, sin enrojecimientos ni lesiones',
        required: false,
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    skinCondition?: string;

    @ApiProperty({
        description: 'Condición del pelaje observada',
        example: 'Pelaje saludable y brillante, sin nudos',
        required: false,
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    coatCondition?: string;

    @ApiProperty({
        description: 'Comportamiento de la mascota durante la sesión',
        example: 'Tranquilo y cooperativo durante toda la sesión',
        required: false,
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    behaviorDuringSession?: string;

    @ApiProperty({
        description: 'Observaciones generales de la sesión',
        example: 'Se encontró pulga en el lomo, se aplicó tratamiento antipulgas',
        required: false,
        maxLength: 1000
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    observations?: string;

    @ApiProperty({
        description: 'Recomendaciones para el cliente',
        example: 'Cepillar diariamente para evitar nudos. Próxima sesión en 6 semanas.',
        required: false,
        maxLength: 1000
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    recommendations?: string;

    @ApiProperty({
        description: 'Duración de la sesión en minutos',
        example: 90,
        minimum: 1
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    durationMinutes: number;

    @ApiProperty({
        description: 'Costo del servicio de grooming',
        example: 450.00,
        required: false,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    serviceCost?: number;

}
