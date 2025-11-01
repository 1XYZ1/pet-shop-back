/**
 * Enum para los estados de las citas agendadas
 * Maneja el ciclo de vida completo de una cita desde su creación hasta su finalización
 */
export enum AppointmentStatus {
  /** Cita creada pero aún no confirmada */
  PENDING = 'pending',
  /** Cita confirmada y programada */
  CONFIRMED = 'confirmed',
  /** Cita completada exitosamente */
  COMPLETED = 'completed',
  /** Cita cancelada por el cliente o la tienda */
  CANCELLED = 'cancelled',
}
