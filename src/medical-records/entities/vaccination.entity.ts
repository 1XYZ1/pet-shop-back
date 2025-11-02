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

/**
 * Entidad Vaccination
 * Representa el registro de una vacuna aplicada a una mascota
 *
 * Propósito:
 * - Control de vacunación
 * - Alertas de próximas vacunas
 * - Historial completo de inmunizaciones
 * - Cumplimiento de requisitos legales (ej: antirrábica)
 *
 * Relaciones:
 * - ManyToOne con Pet: cada vacuna pertenece a una mascota
 * - ManyToOne con User (veterinarian): veterinario que aplicó la vacuna
 *
 * Índices:
 * - [pet, nextDueDate]: Para consultas de vacunas próximas a vencer
 */
@Entity('vaccinations')
@Index(['pet', 'nextDueDate'])
export class Vaccination {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Nombre de la vacuna
     * Ejemplos: "Rabia", "Parvovirus", "Moquillo", "Triple Felina"
     */
    @Column('text')
    vaccineName: string;

    /**
     * Fecha de administración de la vacuna
     * Registra cuándo se aplicó
     */
    @Column('date')
    administeredDate: Date;

    /**
     * Próxima fecha de refuerzo
     * Permite programar alertas de revacunación
     * Puede ser null si es vacuna única o aún no se programa refuerzo
     */
    @Column('date', {
        nullable: true
    })
    nextDueDate?: Date;

    /**
     * Número de lote de la vacuna
     * Importante para trazabilidad en caso de reacciones adversas
     * Requerido por normativas sanitarias
     */
    @Column('text', {
        nullable: true
    })
    batchNumber?: string;

    /**
     * Notas adicionales
     * Reacciones adversas, lugar de aplicación, peso al momento de vacunar
     * Ejemplo: "Aplicada en cuarto trasero derecho. Sin reacciones inmediatas."
     */
    @Column('text', {
        nullable: true
    })
    notes?: string;

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
     * Cada vacuna pertenece a una mascota
     */
    @ManyToOne(
        () => Pet,
        (pet) => pet.vaccinations,
        { eager: true }
    )
    pet: Pet;

    /**
     * Relación Many-to-One con User (veterinarian)
     * Registra qué veterinario aplicó la vacuna
     */
    @ManyToOne(
        () => User,
        { eager: true, nullable: true }
    )
    veterinarian?: User;

}
