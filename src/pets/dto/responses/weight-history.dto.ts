import { ApiProperty } from '@nestjs/swagger';

/**
 * Fuente del registro de peso
 *
 * - medical: Peso registrado en una consulta médica (MedicalRecord.weightAtVisit)
 * - grooming: Peso registrado en una sesión de grooming (si existiera en el futuro)
 * - manual: Peso actualizado manualmente en el perfil de la mascota (Pet.weight)
 */
export enum WeightSource {
    MEDICAL = 'medical',
    GROOMING = 'grooming',
    MANUAL = 'manual',
}

/**
 * DTO de historial de peso
 *
 * Representa un punto de dato en la evolución del peso de la mascota
 * Consolidado desde múltiples fuentes: registros médicos, grooming y perfil de mascota
 *
 * Uso:
 * - Parte de la respuesta del endpoint GET /api/pets/:id/complete-profile
 * - Se construye consolidando datos de MedicalRecord.weightAtVisit, GroomingRecord (futuro), y Pet.weight
 * - Ordenado cronológicamente para mostrar la evolución del peso
 */
export class WeightHistoryDto {

    @ApiProperty({
        example: '2024-01-05T00:00:00.000Z',
        description: 'Fecha en que se registró el peso en formato ISO 8601',
    })
    date: string;

    @ApiProperty({
        example: 30.5,
        description: 'Peso de la mascota en kilogramos',
    })
    weight: number;

    @ApiProperty({
        example: 'medical',
        description: 'Fuente del registro de peso',
        enum: WeightSource,
    })
    source: WeightSource;

    /**
     * Constructor para crear una instancia de WeightHistoryDto
     *
     * @param date - Fecha del registro (Date o string)
     * @param weight - Peso en kilogramos
     * @param source - Fuente del registro (medical, grooming, manual)
     */
    constructor(date: Date | string, weight: number, source: WeightSource) {
        // Manejar date como Date o string
        this.date = date instanceof Date
            ? date.toISOString()
            : new Date(date).toISOString();
        this.weight = Number(weight);
        this.source = source;
    }

    /**
     * Crea un registro de peso desde una visita médica
     *
     * @param visitDate - Fecha de la visita médica (Date o string)
     * @param weight - Peso registrado en la visita
     * @returns WeightHistoryDto con source = 'medical'
     */
    static fromMedicalRecord(visitDate: Date | string, weight: number): WeightHistoryDto {
        return new WeightHistoryDto(visitDate, weight, WeightSource.MEDICAL);
    }

    /**
     * Crea un registro de peso desde una sesión de grooming
     *
     * @param sessionDate - Fecha de la sesión de grooming (Date o string)
     * @param weight - Peso registrado en la sesión
     * @returns WeightHistoryDto con source = 'grooming'
     *
     * Nota: Actualmente GroomingRecord no tiene campo de peso,
     * este método está preparado para futuras implementaciones
     */
    static fromGroomingRecord(sessionDate: Date | string, weight: number): WeightHistoryDto {
        return new WeightHistoryDto(sessionDate, weight, WeightSource.GROOMING);
    }

    /**
     * Crea un registro de peso desde el perfil de la mascota
     *
     * @param updateDate - Fecha de última actualización del perfil (Date o string)
     * @param weight - Peso actual de la mascota
     * @returns WeightHistoryDto con source = 'manual'
     */
    static fromPetProfile(updateDate: Date | string, weight: number): WeightHistoryDto {
        return new WeightHistoryDto(updateDate, weight, WeightSource.MANUAL);
    }
}
