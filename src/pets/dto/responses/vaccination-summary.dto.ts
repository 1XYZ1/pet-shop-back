import { ApiProperty } from '@nestjs/swagger';
import { Vaccination } from '../../../medical-records/entities';

/**
 * Estado de la vacuna calculado dinámicamente
 *
 * - up_to_date: nextDueDate es más de 30 días en el futuro
 * - due_soon: nextDueDate está entre 0 y 30 días en el futuro
 * - overdue: nextDueDate ya pasó (está en el pasado)
 */
export enum VaccinationStatus {
    UP_TO_DATE = 'up_to_date',
    DUE_SOON = 'due_soon',
    OVERDUE = 'overdue',
}

/**
 * DTO de resumen de vacunación
 *
 * Representa una vacuna aplicada a una mascota con su estado calculado dinámicamente
 * El status se calcula en base a la nextDueDate comparada con la fecha actual
 *
 * Uso:
 * - Parte de la respuesta del endpoint GET /api/pets/:id/complete-profile
 * - Transformado desde la entidad Vaccination usando fromEntity()
 *
 * Cálculo de status:
 * - up_to_date: nextDueDate > (hoy + 30 días)
 * - due_soon: nextDueDate entre hoy y (hoy + 30 días)
 * - overdue: nextDueDate < hoy
 */
export class VaccinationSummaryDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID único de la vacunación',
    })
    id: string;

    @ApiProperty({
        example: 'Rabia',
        description: 'Nombre de la vacuna',
    })
    name: string;

    @ApiProperty({
        example: '2023-03-15T00:00:00.000Z',
        description: 'Fecha de administración de la vacuna en formato ISO 8601',
    })
    dateApplied: string;

    @ApiProperty({
        example: '2024-03-15T00:00:00.000Z',
        description: 'Próxima fecha de refuerzo en formato ISO 8601',
        required: false,
    })
    nextDueDate?: string;

    @ApiProperty({
        example: 'Dr. Carlos Rodríguez',
        description: 'Nombre del veterinario que aplicó la vacuna',
        required: false,
    })
    veterinarian?: string;

    @ApiProperty({
        example: 'Sin reacciones adversas',
        description: 'Notas adicionales sobre la vacunación',
        required: false,
    })
    notes?: string;

    @ApiProperty({
        example: '2023-03-15T10:30:00.000Z',
        description: 'Fecha de creación del registro en formato ISO 8601',
    })
    createdAt: string;

    @ApiProperty({
        example: '2023-03-15T10:30:00.000Z',
        description: 'Fecha de última actualización en formato ISO 8601',
    })
    updatedAt: string;

    /**
     * Calcula el estado de la vacuna basado en nextDueDate
     *
     * @param nextDueDate - Próxima fecha de refuerzo (puede ser undefined)
     * @returns VaccinationStatus calculado
     *
     * Lógica:
     * - Si no hay nextDueDate: up_to_date (vacuna única o sin refuerzo programado)
     * - Si nextDueDate > (hoy + 30 días): up_to_date
     * - Si nextDueDate entre hoy y (hoy + 30 días): due_soon
     * - Si nextDueDate < hoy: overdue
     */
    private static calculateStatus(nextDueDate?: Date): VaccinationStatus {
        // Si no hay nextDueDate, consideramos que está al día
        if (!nextDueDate) {
            return VaccinationStatus.UP_TO_DATE;
        }

        const now = new Date();
        const dueDate = new Date(nextDueDate);

        // Calcular la fecha de 30 días desde ahora
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // Si nextDueDate ya pasó -> overdue
        if (dueDate < now) {
            return VaccinationStatus.OVERDUE;
        }

        // Si nextDueDate está entre hoy y 30 días -> due_soon
        if (dueDate <= thirtyDaysFromNow) {
            return VaccinationStatus.DUE_SOON;
        }

        // Si nextDueDate es más de 30 días en el futuro -> up_to_date
        return VaccinationStatus.UP_TO_DATE;
    }

    /**
     * Método estático para transformar una entidad Vaccination a VaccinationSummaryDto
     *
     * @param vaccination - Entidad Vaccination con relaciones cargadas
     * @returns VaccinationSummaryDto con todos los campos mapeados
     *
     * Transformaciones aplicadas:
     * - Fechas convertidas a formato ISO 8601
     * - vaccineName mapeado a name
     * - administeredDate mapeado a dateApplied
     * - veterinarian.fullName mapeado a veterinarian
     * - Valores null/undefined manejados correctamente
     */
    static fromEntity(vaccination: Vaccination): VaccinationSummaryDto {
        const dto = new VaccinationSummaryDto();

        dto.id = vaccination.id;
        dto.name = vaccination.vaccineName;
        // Manejar administeredDate como Date o string
        dto.dateApplied = vaccination.administeredDate instanceof Date
            ? vaccination.administeredDate.toISOString()
            : new Date(vaccination.administeredDate).toISOString();
        // Manejar nextDueDate como Date o string
        dto.nextDueDate = vaccination.nextDueDate
            ? (vaccination.nextDueDate instanceof Date
                ? vaccination.nextDueDate.toISOString()
                : new Date(vaccination.nextDueDate).toISOString())
            : undefined;
        dto.notes = vaccination.notes;
        dto.createdAt = vaccination.createdAt instanceof Date
            ? vaccination.createdAt.toISOString()
            : new Date(vaccination.createdAt).toISOString();
        dto.updatedAt = vaccination.updatedAt instanceof Date
            ? vaccination.updatedAt.toISOString()
            : new Date(vaccination.updatedAt).toISOString();

        // Extraer nombre del veterinario si existe la relación
        if (vaccination.veterinarian) {
            dto.veterinarian = vaccination.veterinarian.fullName;
        }

        return dto;
    }
}
