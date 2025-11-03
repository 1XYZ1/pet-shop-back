import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from '../../../appointments/entities';
import { AppointmentStatus, ServiceType } from '../../../common/enums';

/**
 * DTO de resumen de servicio asociado a una cita
 *
 * Representa los datos básicos del servicio contratado
 */
export class AppointmentServiceDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID del servicio',
    })
    id: string;

    @ApiProperty({
        example: 'Grooming Session',
        description: 'Nombre del servicio',
    })
    name: string;

    @ApiProperty({
        example: 'grooming',
        description: 'Tipo de servicio',
        enum: ServiceType,
    })
    type: ServiceType;

    @ApiProperty({
        example: 'Servicio completo de peluquería',
        description: 'Descripción del servicio',
    })
    description: string;

    @ApiProperty({
        example: 45.00,
        description: 'Precio del servicio',
    })
    price: number;

    @ApiProperty({
        example: 90,
        description: 'Duración estimada en minutos',
    })
    durationMinutes: number;

    @ApiProperty({
        example: 'grooming-service.jpg',
        description: 'URL de la imagen del servicio',
        required: false,
    })
    image?: string;
}

/**
 * DTO de resumen de mascota en cita
 *
 * Representa datos básicos de la mascota asociada a la cita
 */
export class AppointmentPetDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'UUID de la mascota',
    })
    id: string;

    @ApiProperty({
        example: 'Max',
        description: 'Nombre de la mascota',
    })
    name: string;

    @ApiProperty({
        example: 'Golden Retriever',
        description: 'Raza de la mascota',
        required: false,
    })
    breed?: string;
}

/**
 * DTO de resumen de cliente en cita
 *
 * Representa datos básicos del cliente que agendó la cita
 */
export class AppointmentCustomerDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440002',
        description: 'UUID del cliente',
    })
    id: string;

    @ApiProperty({
        example: 'Juan Pérez',
        description: 'Nombre completo del cliente',
    })
    fullName: string;

    @ApiProperty({
        example: 'juan.perez@example.com',
        description: 'Email del cliente',
    })
    email: string;
}

/**
 * DTO de resumen de cita
 *
 * Representa una cita agendada simplificada para el perfil completo de mascota
 * Incluye relaciones básicas con servicio, mascota y cliente
 *
 * Uso:
 * - Parte de la respuesta del endpoint GET /api/pets/:id/complete-profile
 * - Transformado desde la entidad Appointment usando fromEntity()
 */
export class AppointmentSummaryDto {

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID único de la cita',
    })
    id: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440002',
        description: 'UUID del cliente que agendó la cita',
    })
    customerId: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'UUID de la mascota asociada',
    })
    petId: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440003',
        description: 'UUID del servicio contratado',
    })
    serviceId: string;

    @ApiProperty({
        example: '2024-02-15T14:00:00.000Z',
        description: 'Fecha y hora de la cita en formato ISO 8601',
    })
    date: string;

    @ApiProperty({
        example: 'confirmed',
        description: 'Estado de la cita',
        enum: AppointmentStatus,
    })
    status: AppointmentStatus;

    @ApiProperty({
        example: 'Primera vez que viene Max, es un poco nervioso',
        description: 'Notas adicionales sobre la cita',
        required: false,
    })
    notes?: string;

    @ApiProperty({
        example: '2024-01-10T10:00:00.000Z',
        description: 'Fecha de creación de la cita en formato ISO 8601',
    })
    createdAt: string;

    @ApiProperty({
        example: '2024-01-10T10:00:00.000Z',
        description: 'Fecha de última actualización en formato ISO 8601',
    })
    updatedAt: string;

    @ApiProperty({
        description: 'Información del servicio asociado',
        type: AppointmentServiceDto,
    })
    service: AppointmentServiceDto;

    @ApiProperty({
        description: 'Información de la mascota asociada',
        type: AppointmentPetDto,
        required: false,
    })
    pet?: AppointmentPetDto;

    @ApiProperty({
        description: 'Información del cliente que agendó la cita',
        type: AppointmentCustomerDto,
        required: false,
    })
    customer?: AppointmentCustomerDto;

    /**
     * Método estático para transformar una entidad Appointment a AppointmentSummaryDto
     *
     * @param appointment - Entidad Appointment con relaciones cargadas (eager)
     * @returns AppointmentSummaryDto con todos los campos mapeados
     *
     * Transformaciones aplicadas:
     * - Fechas convertidas a formato ISO 8601
     * - Relaciones (service, pet, customer) mapeadas a objetos simplificados
     * - IDs extraídos de las relaciones
     * - Valores null/undefined manejados correctamente
     */
    static fromEntity(appointment: Appointment): AppointmentSummaryDto {
        const dto = new AppointmentSummaryDto();

        dto.id = appointment.id;
        dto.customerId = appointment.customer?.id || '';
        dto.petId = appointment.pet?.id || '';
        dto.serviceId = appointment.service?.id || '';
        // Manejar date como Date o string
        dto.date = appointment.date instanceof Date
            ? appointment.date.toISOString()
            : new Date(appointment.date).toISOString();
        dto.status = appointment.status;
        dto.notes = appointment.notes;
        dto.createdAt = appointment.createdAt instanceof Date
            ? appointment.createdAt.toISOString()
            : new Date(appointment.createdAt).toISOString();
        dto.updatedAt = appointment.updatedAt instanceof Date
            ? appointment.updatedAt.toISOString()
            : new Date(appointment.updatedAt).toISOString();

        // Mapear servicio si existe (relación eager)
        if (appointment.service) {
            dto.service = {
                id: appointment.service.id,
                name: appointment.service.name,
                type: appointment.service.type,
                description: appointment.service.description,
                price: Number(appointment.service.price),
                durationMinutes: appointment.service.durationMinutes,
                image: appointment.service.image,
            };
        }

        // Mapear mascota si existe (relación eager)
        if (appointment.pet) {
            dto.pet = {
                id: appointment.pet.id,
                name: appointment.pet.name,
                breed: appointment.pet.breed,
            };
        }

        // Mapear cliente si existe (relación eager)
        if (appointment.customer) {
            dto.customer = {
                id: appointment.customer.id,
                fullName: appointment.customer.fullName,
                email: appointment.customer.email,
            };
        }

        return dto;
    }
}
