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
    IsUrl,
    MaxDate,
    MaxLength,
    MinLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { PetSpecies, PetGender, PetTemperament } from '../../common/enums';

/**
 * DTO para crear una nueva mascota en el sistema
 *
 * Validaciones:
 * - name: requerido, mínimo 1 carácter, máximo 100
 * - species: requerido, debe ser un valor del enum PetSpecies
 * - breed: opcional, máximo 100 caracteres
 * - birthDate: opcional, no puede ser fecha futura
 * - gender: opcional, debe ser un valor del enum PetGender
 * - weight: opcional, debe ser número positivo
 * - microchipNumber: opcional, formato de texto
 * - profilePhoto: opcional, debe ser URL válida
 * - temperament: opcional, debe ser un valor del enum PetTemperament
 * - behaviorNotes: opcional, array de strings
 * - generalNotes: opcional, máximo 1000 caracteres
 */
export class CreatePetDto {

    @ApiProperty({
        description: 'Nombre de la mascota',
        example: 'Max',
        minLength: 1,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Especie de la mascota',
        enum: PetSpecies,
        example: PetSpecies.DOG
    })
    @IsEnum(PetSpecies)
    @IsNotEmpty()
    species: PetSpecies;

    @ApiProperty({
        description: 'Raza de la mascota',
        example: 'Golden Retriever',
        required: false,
        maxLength: 100
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    breed?: string;

    @ApiProperty({
        description: 'Fecha de nacimiento de la mascota (formato ISO 8601)',
        example: '2020-05-15',
        required: false,
        type: String
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    @MaxDate(new Date(), {
        message: 'La fecha de nacimiento no puede ser en el futuro'
    })
    birthDate?: Date;

    @ApiProperty({
        description: 'Género de la mascota',
        enum: PetGender,
        example: PetGender.MALE,
        required: false
    })
    @IsEnum(PetGender)
    @IsOptional()
    gender?: PetGender;

    @ApiProperty({
        description: 'Color o descripción física de la mascota',
        example: 'Dorado con manchas blancas',
        required: false,
        maxLength: 200
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    color?: string;

    @ApiProperty({
        description: 'Peso de la mascota en kilogramos',
        example: 25.5,
        required: false,
        minimum: 0.01
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    weight?: number;

    @ApiProperty({
        description: 'Número de microchip (identificador único)',
        example: '982000123456789',
        required: false,
        maxLength: 50
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    microchipNumber?: string;

    @ApiProperty({
        description: 'URL de la foto de perfil de la mascota (se genera automáticamente al usar PATCH /pets/:id/photo)',
        example: 'http://localhost:3000/api/files/pet/abc123-def456.jpg',
        required: false
    })
    @IsString()
    @IsOptional()
    profilePhoto?: string;

    @ApiProperty({
        description: 'Temperamento general de la mascota',
        enum: PetTemperament,
        example: PetTemperament.FRIENDLY,
        required: false
    })
    @IsEnum(PetTemperament)
    @IsOptional()
    temperament?: PetTemperament;

    @ApiProperty({
        description: 'Array de notas sobre comportamientos específicos',
        example: ['Muerde al bañarse', 'Asustadizo con ruidos fuertes'],
        required: false,
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    behaviorNotes?: string[];

    @ApiProperty({
        description: 'Notas generales sobre la mascota (alergias, condiciones, etc.)',
        example: 'Alérgico al pollo. Tiene artritis en pata delantera izquierda.',
        required: false,
        maxLength: 1000
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    generalNotes?: string;

}
