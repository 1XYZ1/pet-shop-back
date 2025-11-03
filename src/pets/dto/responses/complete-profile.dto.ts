import { ApiProperty } from '@nestjs/swagger';
import { PetSummaryDto } from './pet-summary.dto';
import { MedicalRecordSummaryDto } from './medical-record-summary.dto';
import { VaccinationSummaryDto } from './vaccination-summary.dto';
import { GroomingRecordSummaryDto } from './grooming-record-summary.dto';
import { AppointmentSummaryDto } from './appointment-summary.dto';
import { WeightHistoryDto } from './weight-history.dto';

/**
 * DTO de historial médico
 *
 * Consolida información de visitas médicas de la mascota
 */
export class MedicalHistoryDto {

    @ApiProperty({
        description: 'Últimas 5-10 visitas ordenadas por fecha DESC',
        type: [MedicalRecordSummaryDto],
    })
    recentVisits: MedicalRecordSummaryDto[];

    @ApiProperty({
        example: 8,
        description: 'Total de visitas médicas de esta mascota',
    })
    totalVisits: number;
}

/**
 * DTO de vacunaciones
 *
 * Consolida información de vacunas de la mascota
 */
export class VaccinationsDto {

    @ApiProperty({
        description: 'Vacunas activas/vigentes ordenadas por nextDueDate ASC',
        type: [VaccinationSummaryDto],
    })
    activeVaccines: VaccinationSummaryDto[];

    @ApiProperty({
        description: 'Vacunas próximas a vencer (próximos 30 días)',
        type: [VaccinationSummaryDto],
    })
    upcomingVaccines: VaccinationSummaryDto[];

    @ApiProperty({
        example: 5,
        description: 'Total de vacunas registradas',
    })
    totalVaccines: number;
}

/**
 * DTO de historial de grooming
 *
 * Consolida información de sesiones de grooming de la mascota
 */
export class GroomingHistoryDto {

    @ApiProperty({
        description: 'Últimas 5-10 sesiones ordenadas por fecha DESC',
        type: [GroomingRecordSummaryDto],
    })
    recentSessions: GroomingRecordSummaryDto[];

    @ApiProperty({
        example: 12,
        description: 'Total de sesiones de grooming',
    })
    totalSessions: number;

    @ApiProperty({
        example: '2024-01-02T00:00:00.000Z',
        description: 'Fecha de la última sesión en formato ISO 8601',
        required: false,
    })
    lastSessionDate?: string;
}

/**
 * DTO de citas
 *
 * Consolida información de appointments de la mascota
 */
export class AppointmentsDto {

    @ApiProperty({
        description: 'Citas futuras o pending/confirmed ordenadas por fecha ASC',
        type: [AppointmentSummaryDto],
    })
    upcoming: AppointmentSummaryDto[];

    @ApiProperty({
        description: 'Citas pasadas (completed/cancelled) ordenadas por fecha DESC',
        type: [AppointmentSummaryDto],
    })
    past: AppointmentSummaryDto[];

    @ApiProperty({
        example: 3,
        description: 'Total de citas',
    })
    totalAppointments: number;
}

/**
 * DTO de resumen calculado
 *
 * Datos calculados y agregados del perfil de la mascota
 */
export class SummaryDto {

    @ApiProperty({
        example: 3.8,
        description: 'Edad en años (puede ser decimal: 2.5 años)',
        required: false,
    })
    age?: number;

    @ApiProperty({
        example: '2024-01-05T10:00:00.000Z',
        description: 'Fecha de la última visita médica en formato ISO 8601',
        required: false,
    })
    lastVisitDate?: string;

    @ApiProperty({
        example: '2024-03-15T00:00:00.000Z',
        description: 'Fecha de la próxima vacuna a aplicar en formato ISO 8601',
        required: false,
    })
    nextVaccinationDue?: string;

    @ApiProperty({
        example: 400.00,
        description: 'Suma de todos los costos médicos',
    })
    totalSpentMedical: number;

    @ApiProperty({
        example: 540.00,
        description: 'Suma de todos los costos de grooming',
    })
    totalSpentGrooming: number;
}

/**
 * DTO de perfil completo de mascota
 *
 * Respuesta unificada del endpoint GET /api/pets/:id/complete-profile
 * Consolida toda la información de la mascota en una sola llamada
 *
 * Incluye:
 * - Datos básicos de la mascota
 * - Historial médico reciente y total de visitas
 * - Vacunas activas y próximas con status calculado
 * - Evolución del peso desde múltiples fuentes
 * - Historial de grooming reciente y total de sesiones
 * - Appointments futuros y pasados
 * - Resumen con datos calculados (edad, gastos, próxima vacuna)
 */
export class CompleteProfileDto {

    @ApiProperty({
        description: 'Información básica de la mascota',
        type: PetSummaryDto,
    })
    pet: PetSummaryDto;

    @ApiProperty({
        description: 'Historial médico de la mascota',
        type: MedicalHistoryDto,
    })
    medicalHistory: MedicalHistoryDto;

    @ApiProperty({
        description: 'Vacunas de la mascota',
        type: VaccinationsDto,
    })
    vaccinations: VaccinationsDto;

    @ApiProperty({
        description: 'Historial de peso de la mascota',
        type: [WeightHistoryDto],
    })
    weightHistory: WeightHistoryDto[];

    @ApiProperty({
        description: 'Historial de grooming de la mascota',
        type: GroomingHistoryDto,
    })
    groomingHistory: GroomingHistoryDto;

    @ApiProperty({
        description: 'Citas de la mascota',
        type: AppointmentsDto,
    })
    appointments: AppointmentsDto;

    @ApiProperty({
        description: 'Resumen calculado del perfil',
        type: SummaryDto,
    })
    summary: SummaryDto;
}
