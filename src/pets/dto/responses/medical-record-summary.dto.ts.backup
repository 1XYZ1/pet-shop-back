import { ApiProperty } from '@nestjs/swagger';
import { MedicalRecord } from '../../../medical-records/entities';
import { VisitType } from '../../../common/enums';

/**
 * DTO de resumen de registro médico
 *
 * Representa un registro médico simplificado para el perfil completo de mascota
 * No incluye relaciones anidadas profundas, solo datos esenciales
 *
 * Uso:
 * - Parte de la respuesta del endpoint GET /api/pets/:id/complete-profile
 * - Transformado desde la entidad MedicalRecord usando fromEntity()
 *
 * Nota:
 * - Los campos que no existen en la entidad MedicalRecord (veterinarianName, clinicName, followUpDate)
 *   se manejan como undefined ya que no están presentes en el modelo actual
 */
export class MedicalRecordSummaryDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID único del registro médico',
    })
    id: string;

    @ApiProperty({
        example: '2024-01-05T10:00:00.000Z',
        description: 'Fecha de la visita médica en formato ISO 8601',
    })
    date: string;

    @ApiProperty({
        example: 'Vómito y diarrea desde hace 2 días',
        description: 'Motivo de la consulta',
    })
    reason: string;

    @ApiProperty({
        example: 'Gastroenteritis aguda',
        description: 'Diagnóstico médico del veterinario',
        required: false,
    })
    diagnosis?: string;

    @ApiProperty({
        example: 'Metronidazol 250mg cada 12 hrs por 7 días',
        description: 'Tratamiento prescrito',
        required: false,
    })
    treatment?: string;

    @ApiProperty({
        example: 'Revisar en 7 días. Si no mejora, realizar análisis de sangre.',
        description: 'Notas adicionales del veterinario',
        required: false,
    })
    notes?: string;

    @ApiProperty({
        example: 50.00,
        description: 'Costo del servicio médico',
        required: false,
    })
    cost?: number;

    @ApiProperty({
        example: 'Dr. Carlos Rodríguez',
        description: 'Nombre del veterinario que atendió',
        required: false,
    })
    vetName?: string;

    @ApiProperty({
        example: '2024-01-15T10:00:00.000Z',
        description: 'Fecha de seguimiento programada en formato ISO 8601',
        required: false,
    })
    nextVisitDate?: string;

    @ApiProperty({
        example: '2024-01-05T10:30:00.000Z',
        description: 'Fecha de creación del registro en formato ISO 8601',
    })
    createdAt: string;

    @ApiProperty({
        example: '2024-01-05T10:30:00.000Z',
        description: 'Fecha de última actualización en formato ISO 8601',
    })
    updatedAt: string;

    /**
     * Método estático para transformar una entidad MedicalRecord a MedicalRecordSummaryDto
     *
     * @param record - Entidad MedicalRecord con relaciones cargadas
     * @returns MedicalRecordSummaryDto con todos los campos mapeados
     *
     * Transformaciones aplicadas:
     * - Fechas convertidas a formato ISO 8601
     * - visitDate mapeado a date
     * - serviceCost mapeado a cost
     * - veterinarian.fullName mapeado a vetName
     * - Valores null/undefined manejados correctamente
     */
    static fromEntity(record: MedicalRecord): MedicalRecordSummaryDto {
        const dto = new MedicalRecordSummaryDto();

        dto.id = record.id;
        // Manejar visitDate como Date o string
        dto.date = record.visitDate instanceof Date
            ? record.visitDate.toISOString()
            : new Date(record.visitDate).toISOString();
        dto.reason = record.reason;
        dto.diagnosis = record.diagnosis;
        dto.treatment = record.treatment;
        dto.notes = record.notes;
        dto.cost = record.serviceCost ? Number(record.serviceCost) : undefined;
        // Manejar createdAt como Date o string
        dto.createdAt = record.createdAt instanceof Date
            ? record.createdAt.toISOString()
            : new Date(record.createdAt).toISOString();
        dto.updatedAt = record.updatedAt instanceof Date
            ? record.updatedAt.toISOString()
            : new Date(record.updatedAt).toISOString();

        // Extraer nombre del veterinario si existe la relación
        if (record.veterinarian) {
            dto.vetName = record.veterinarian.fullName;
        }

        // nextVisitDate no existe en la entidad actual, se deja como undefined
        // Si se agrega en el futuro, descomentar:
        // dto.nextVisitDate = record.nextVisitDate ? record.nextVisitDate.toISOString() : undefined;

        return dto;
    }
}
