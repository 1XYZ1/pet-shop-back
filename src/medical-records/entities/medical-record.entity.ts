import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Pet } from '../../pets/entities';
import { User } from '../../auth/entities/user.entity';
import { VisitType } from '../../common/enums';

/**
 * Entidad MedicalRecord
 * Representa un registro médico veterinario de una mascota
 *
 * Casos de uso:
 * - Consultas generales
 * - Procedimientos quirúrgicos
 * - Atenciones de emergencia
 * - Chequeos preventivos
 * - Diagnósticos y tratamientos
 *
 * Relaciones:
 * - ManyToOne con Pet: cada registro pertenece a una mascota
 * - ManyToOne con User (veterinarian): veterinario que atendió la consulta
 *
 * Índices:
 * - [pet, visitDate]: Para consultas rápidas del historial de una mascota
 */
@Entity('medical_records')
@Index(['pet', 'visitDate'])
export class MedicalRecord {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Fecha de la visita médica
     * Permite ordenar cronológicamente el historial
     */
    @Column('date')
    visitDate: Date;

    /**
     * Tipo de visita médica
     * Valores: consultation, vaccination, surgery, emergency, checkup
     */
    @Column({
        type: 'enum',
        enum: VisitType
    })
    visitType: VisitType;

    /**
     * Motivo de la consulta
     * Síntomas o razón principal de la visita
     * Ejemplo: "Vómito y diarrea desde hace 2 días"
     */
    @Column('text')
    reason: string;

    /**
     * Diagnóstico médico del veterinario
     * Puede ser provisional o definitivo
     * Ejemplo: "Gastroenteritis aguda"
     */
    @Column('text', {
        nullable: true
    })
    diagnosis?: string;

    /**
     * Tratamiento prescrito
     * Medicamentos, dosis, duración del tratamiento
     * Ejemplo: "Metronidazol 250mg cada 12 hrs por 7 días"
     */
    @Column('text', {
        nullable: true
    })
    treatment?: string;

    /**
     * Notas adicionales del veterinario
     * Observaciones importantes, recomendaciones, seguimiento
     */
    @Column('text', {
        nullable: true
    })
    notes?: string;

    /**
     * Array de prescripciones médicas
     * Medicamentos prescritos con sus dosis e instrucciones
     * Ejemplo: ["Vitamina C - 1 tableta diaria", "Desparasitante - cada 3 meses"]
     */
    @Column('text', {
        array: true,
        default: []
    })
    prescriptions: string[];

    /**
     * Fecha de seguimiento programada
     * Próxima cita recomendada para revisar la evolución del tratamiento
     */
    @Column('date', {
        nullable: true
    })
    followUpDate?: Date;

    /**
     * Peso de la mascota en el momento de la visita (kg)
     * Permite seguir la evolución del peso a lo largo del tiempo
     */
    @Column('decimal', {
        precision: 5,
        scale: 2,
        nullable: true
    })
    weightAtVisit?: number;

    /**
     * Temperatura corporal de la mascota (°C)
     * Rango normal perros: 38-39°C
     * Rango normal gatos: 38-39.2°C
     */
    @Column('decimal', {
        precision: 4,
        scale: 2,
        nullable: true
    })
    temperature?: number;

    /**
     * Costo del servicio médico
     * Permite llevar registro de gastos médicos de la mascota
     */
    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: true
    })
    serviceCost?: number;

    /**
     * Fecha de creación del registro
     * Generada automáticamente
     */
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    /**
     * Fecha de última actualización
     * Actualizada automáticamente
     */
    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    // ==================== RELACIONES ====================

    /**
     * Relación Many-to-One con Pet
     * Cada registro médico pertenece a una mascota
     */
    @ManyToOne(
        () => Pet,
        (pet) => pet.medicalRecords,
        { eager: true }
    )
    pet: Pet;

    /**
     * Relación Many-to-One con User (veterinarian)
     * Registra qué veterinario realizó la atención
     * Útil para auditoría y seguimiento
     */
    @ManyToOne(
        () => User,
        { eager: true, nullable: true }
    )
    veterinarian?: User;

}
