import { Pet } from '../entities';
import { MedicalRecord, Vaccination } from '../../medical-records/entities';
import { GroomingRecord } from '../../grooming-records/entities';
import { AppointmentPet } from '../../appointments/entities';

/**
 * Interface CompleteProfile
 * Representa la vista unificada completa de una mascota
 *
 * Consolida toda la información relevante de la mascota en un solo objeto:
 * - Datos básicos de la mascota (nombre, especie, raza, etc.)
 * - Historial médico reciente
 * - Vacunas activas y próximas
 * - Evolución del peso
 * - Historial de grooming
 * - Appointments relacionados
 *
 * Utilidad:
 * - Vista de perfil completo en el frontend
 * - Reporte general de la mascota
 * - Dashboard del cliente
 * - Información pre-consulta para veterinarios/groomers
 */
export interface CompleteProfile {
    /**
     * Información básica de la mascota
     * Incluye owner con eager loading
     */
    pet: Pet;

    /**
     * Historial médico reciente
     * Últimas 5 consultas veterinarias ordenadas por fecha (más recientes primero)
     */
    medicalHistory: {
        recentVisits: MedicalRecord[];
        totalVisits: number;
    };

    /**
     * Información de vacunación
     * Vacunas aplicadas y próximas a vencer
     */
    vaccinations: {
        activeVaccines: Vaccination[];
        upcomingVaccines: Vaccination[];
        totalVaccines: number;
    };

    /**
     * Evolución del peso de la mascota
     * Basado en registros médicos con weightAtVisit
     * Permite graficar tendencias de peso
     */
    weightHistory: Array<{
        date: Date;
        weight: number;
        source: 'medical' | 'pet'; // De dónde viene el dato
    }>;

    /**
     * Historial de grooming reciente
     * Últimas 5 sesiones de peluquería
     */
    groomingHistory: {
        recentSessions: GroomingRecord[];
        totalSessions: number;
        lastSessionDate?: Date;
    };

    /**
     * Appointments relacionados con esta mascota
     * Incluye pasados y futuros
     */
    appointments: {
        upcoming: AppointmentPet[];
        past: AppointmentPet[];
        totalAppointments: number;
    };

    /**
     * Resumen de datos clave
     * Información calculada útil para vista rápida
     */
    summary: {
        age?: number; // Edad en años (calculada desde birthDate)
        lastVisitDate?: Date; // Última visita médica
        nextVaccinationDue?: Date; // Próxima vacuna más cercana
        totalSpentMedical?: number; // Suma de costos médicos
        totalSpentGrooming?: number; // Suma de costos grooming
    };
}
