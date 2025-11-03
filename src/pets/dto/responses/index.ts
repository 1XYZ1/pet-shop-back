/**
 * Exportación centralizada de todos los DTOs de respuesta del módulo Pets
 *
 * Este archivo facilita la importación de DTOs desde otros módulos
 * Permite usar: import { CompleteProfileDto, PetSummaryDto } from './dto/responses'
 * En lugar de importar desde archivos individuales
 */

// DTO principal del perfil completo
export { CompleteProfileDto, MedicalHistoryDto, VaccinationsDto, GroomingHistoryDto, AppointmentsDto, SummaryDto } from './complete-profile.dto';

// DTOs de resumen de entidades
export { PetSummaryDto } from './pet-summary.dto';
export { MedicalRecordSummaryDto } from './medical-record-summary.dto';
export { VaccinationSummaryDto } from './vaccination-summary.dto';
export { GroomingRecordSummaryDto } from './grooming-record-summary.dto';
export { AppointmentSummaryDto, AppointmentServiceDto, AppointmentPetDto, AppointmentCustomerDto } from './appointment-summary.dto';

// DTO de historial de peso
export { WeightHistoryDto, WeightSource } from './weight-history.dto';
