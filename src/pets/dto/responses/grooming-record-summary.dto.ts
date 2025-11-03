import { ApiProperty } from '@nestjs/swagger';
import { GroomingRecord } from '../../../grooming-records/entities';

/**
 * DTO de resumen de registro de grooming
 *
 * Representa una sesión de grooming simplificada para el perfil completo de mascota
 * No incluye relaciones anidadas profundas, solo datos esenciales
 *
 * Uso:
 * - Parte de la respuesta del endpoint GET /api/pets/:id/complete-profile
 * - Transformado desde la entidad GroomingRecord usando fromEntity()
 *
 * Nota:
 * - Los campos que no existen en la entidad GroomingRecord (groomerName, salonName,
 *   productsCost, nextSessionDate) se manejan como undefined ya que no están presentes
 *   en el modelo actual o se calculan de manera diferente
 */
export class GroomingRecordSummaryDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID único del registro de grooming',
    })
    id: string;

    @ApiProperty({
        example: '2024-01-02T00:00:00.000Z',
        description: 'Fecha de la sesión de grooming en formato ISO 8601',
    })
    date: string;

    @ApiProperty({
        example: 'Baño y corte',
        description: 'Tipo de servicio realizado',
    })
    serviceType: string;

    @ApiProperty({
        example: 'Comportamiento excelente durante la sesión',
        description: 'Notas sobre la sesión de grooming',
        required: false,
    })
    notes?: string;

    @ApiProperty({
        example: 65.00,
        description: 'Costo del servicio de grooming',
        required: false,
    })
    cost?: number;

    @ApiProperty({
        example: 'María López',
        description: 'Nombre del peluquero que realizó el servicio',
        required: false,
    })
    groomerName?: string;

    @ApiProperty({
        example: '2024-02-02T00:00:00.000Z',
        description: 'Próxima sesión programada en formato ISO 8601',
        required: false,
    })
    nextAppointment?: string;

    @ApiProperty({
        example: '2024-01-02T10:30:00.000Z',
        description: 'Fecha de creación del registro en formato ISO 8601',
    })
    createdAt: string;

    @ApiProperty({
        example: '2024-01-02T10:30:00.000Z',
        description: 'Fecha de última actualización en formato ISO 8601',
    })
    updatedAt: string;

    /**
     * Método estático para transformar una entidad GroomingRecord a GroomingRecordSummaryDto
     *
     * @param record - Entidad GroomingRecord con relaciones cargadas
     * @returns GroomingRecordSummaryDto con todos los campos mapeados
     *
     * Transformaciones aplicadas:
     * - sessionDate mapeado a date
     * - servicesPerformed (array) convertido a serviceType (string)
     * - observations y recommendations consolidadas en notes
     * - serviceCost mapeado a cost
     * - groomer.fullName mapeado a groomerName
     * - Valores null/undefined manejados correctamente
     */
    static fromEntity(record: GroomingRecord): GroomingRecordSummaryDto {
        const dto = new GroomingRecordSummaryDto();

        dto.id = record.id;
        // Manejar sessionDate como Date o string
        dto.date = record.sessionDate instanceof Date
            ? record.sessionDate.toISOString()
            : new Date(record.sessionDate).toISOString();

        // Convertir array de servicios a string único
        dto.serviceType = record.servicesPerformed && record.servicesPerformed.length > 0
            ? record.servicesPerformed.join(', ')
            : 'Servicio de grooming';

        // Consolidar observaciones y recomendaciones en notes
        const noteParts: string[] = [];
        if (record.observations) noteParts.push(record.observations);
        if (record.recommendations) noteParts.push(`Recomendaciones: ${record.recommendations}`);
        if (record.behaviorDuringSession) noteParts.push(`Comportamiento: ${record.behaviorDuringSession}`);
        dto.notes = noteParts.length > 0 ? noteParts.join('. ') : undefined;

        dto.cost = record.serviceCost ? Number(record.serviceCost) : undefined;
        dto.createdAt = record.createdAt instanceof Date
            ? record.createdAt.toISOString()
            : new Date(record.createdAt).toISOString();
        dto.updatedAt = record.updatedAt instanceof Date
            ? record.updatedAt.toISOString()
            : new Date(record.updatedAt).toISOString();

        // Extraer nombre del groomer si existe la relación
        if (record.groomer) {
            dto.groomerName = record.groomer.fullName;
        }

        // nextAppointment no existe en la entidad actual, se deja como undefined
        // Si se agrega en el futuro, descomentar:
        // dto.nextAppointment = record.nextAppointment ? record.nextAppointment.toISOString() : undefined;

        return dto;
    }
}
