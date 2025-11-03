import { ApiProperty } from '@nestjs/swagger';
import { Pet } from '../../entities';
import { PetSpecies, PetGender, PetTemperament } from '../../../common/enums';

/**
 * DTO de resumen de mascota
 *
 * Representa los datos básicos de una mascota en el perfil completo
 * Incluye toda la información principal sin relaciones anidadas profundas
 *
 * Uso:
 * - Respuesta del endpoint GET /api/pets/:id/complete-profile
 * - Transformado desde la entidad Pet usando el método estático fromEntity()
 */
export class PetSummaryDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID único de la mascota',
    })
    id: string;

    @ApiProperty({
        example: 'Max',
        description: 'Nombre de la mascota',
    })
    name: string;

    @ApiProperty({
        example: 'dog',
        description: 'Especie de la mascota',
        enum: PetSpecies,
    })
    species: PetSpecies;

    @ApiProperty({
        example: 'Golden Retriever',
        description: 'Raza de la mascota',
        required: false,
    })
    breed?: string;

    @ApiProperty({
        example: '2020-03-15T00:00:00.000Z',
        description: 'Fecha de nacimiento en formato ISO 8601',
        required: false,
    })
    birthDate?: string;

    @ApiProperty({
        example: 'male',
        description: 'Género de la mascota',
        enum: PetGender,
    })
    gender: PetGender;

    @ApiProperty({
        example: 'Golden',
        description: 'Color o descripción física de la mascota',
        required: false,
    })
    color?: string;

    @ApiProperty({
        example: 30.5,
        description: 'Peso actual de la mascota en kilogramos',
        required: false,
    })
    weight?: number;

    @ApiProperty({
        example: '123456789012345',
        description: 'Número de microchip único',
        required: false,
    })
    microchipNumber?: string;

    @ApiProperty({
        example: 'http://localhost:3000/files/pet/abc123.jpg',
        description: 'URL de la foto de perfil de la mascota',
        required: false,
    })
    profilePhoto?: string;

    @ApiProperty({
        example: 'friendly',
        description: 'Temperamento general de la mascota',
        enum: PetTemperament,
    })
    temperament: PetTemperament;

    @ApiProperty({
        example: ['Loves playing fetch', 'Good with children'],
        description: 'Notas sobre comportamientos específicos',
        type: [String],
    })
    behaviorNotes: string[];

    @ApiProperty({
        example: 'Alérgico al pollo. Prefiere juguetes de goma.',
        description: 'Notas generales sobre la mascota',
        required: false,
    })
    generalNotes?: string;

    @ApiProperty({
        example: true,
        description: 'Indica si la mascota está activa en el sistema',
    })
    isActive: boolean;

    @ApiProperty({
        example: '2023-01-10T10:00:00.000Z',
        description: 'Fecha de creación del registro en formato ISO 8601',
    })
    createdAt: string;

    @ApiProperty({
        example: '2024-01-15T14:30:00.000Z',
        description: 'Fecha de última actualización en formato ISO 8601',
    })
    updatedAt: string;

    @ApiProperty({
        example: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            fullName: 'Juan Pérez',
            email: 'juan.perez@example.com',
        },
        description: 'Información básica del dueño de la mascota',
        required: false,
    })
    owner?: {
        id: string;
        fullName: string;
        email: string;
    };

    /**
     * Método estático para transformar una entidad Pet a PetSummaryDto
     *
     * @param pet - Entidad Pet con relación owner cargada (eager)
     * @returns PetSummaryDto con todos los campos mapeados
     *
     * Transformaciones aplicadas:
     * - Fechas convertidas a formato ISO 8601
     * - Owner mapeado a objeto simplificado (solo id, fullName, email)
     * - Valores null/undefined manejados correctamente
     */
    static fromEntity(pet: Pet): PetSummaryDto {
        const dto = new PetSummaryDto();

        dto.id = pet.id;
        dto.name = pet.name;
        dto.species = pet.species;
        dto.breed = pet.breed;
        // Manejar birthDate como Date o string
        dto.birthDate = pet.birthDate
            ? (pet.birthDate instanceof Date
                ? pet.birthDate.toISOString()
                : new Date(pet.birthDate).toISOString())
            : undefined;
        dto.gender = pet.gender;
        dto.color = pet.color;
        dto.weight = pet.weight ? Number(pet.weight) : undefined;
        dto.microchipNumber = pet.microchipNumber;
        dto.profilePhoto = pet.profilePhoto;
        dto.temperament = pet.temperament;
        dto.behaviorNotes = pet.behaviorNotes || [];
        dto.generalNotes = pet.generalNotes;
        dto.isActive = pet.isActive;
        dto.createdAt = pet.createdAt instanceof Date
            ? pet.createdAt.toISOString()
            : new Date(pet.createdAt).toISOString();
        dto.updatedAt = pet.updatedAt instanceof Date
            ? pet.updatedAt.toISOString()
            : new Date(pet.updatedAt).toISOString();

        // Mapear owner si existe (la relación es eager)
        if (pet.owner) {
            dto.owner = {
                id: pet.owner.id,
                fullName: pet.owner.fullName,
                email: pet.owner.email,
            };
        }

        return dto;
    }
}
