/**
 * Enum VisitType
 * Define los tipos de visitas médicas veterinarias
 * Utilizado en MedicalRecord para clasificar consultas
 *
 * Valores:
 * - consultation: Consulta general
 * - vaccination: Aplicación de vacunas
 * - surgery: Cirugía o procedimiento quirúrgico
 * - emergency: Atención de emergencia
 * - checkup: Chequeo de rutina o seguimiento
 */
export enum VisitType {
    CONSULTATION = 'consultation',
    VACCINATION = 'vaccination',
    SURGERY = 'surgery',
    EMERGENCY = 'emergency',
    CHECKUP = 'checkup'
}
