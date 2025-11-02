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
 * Entidad GroomingRecord
 * Representa el registro de una sesión de peluquería para mascotas
 *
 * Propósito:
 * - Historial completo de servicios de grooming
 * - Seguimiento de estilos de corte preferidos
 * - Control de condición de piel y pelaje
 * - Registro de comportamiento durante sesiones
 * - Tracking de productos utilizados
 * - Recomendaciones para futuras sesiones
 *
 * Casos de uso:
 * - Baño y secado
 * - Corte de pelo/pelado
 * - Corte de uñas
 * - Limpieza de oídos
 * - Cepillado y deslanado
 *
 * Relaciones:
 * - ManyToOne con Pet: cada sesión pertenece a una mascota
 * - ManyToOne con User (groomer): peluquero que realizó el servicio
 *
 * Índices:
 * - [pet, sessionDate]: Para consultas rápidas del historial de grooming
 */
@Entity('grooming_records')
@Index(['pet', 'sessionDate'])
export class GroomingRecord {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Fecha de la sesión de grooming
     * Permite ordenar cronológicamente el historial
     */
    @Column('date')
    sessionDate: Date;

    /**
     * Array de servicios realizados durante la sesión
     * Ejemplos: ["Baño", "Corte de pelo", "Corte de uñas", "Limpieza de oídos"]
     * Almacenado como array de strings para flexibilidad
     */
    @Column('text', {
        array: true
    })
    servicesPerformed: string[];

    /**
     * Estilo de corte de pelo aplicado
     * Permite recordar preferencias del cliente para futuras sesiones
     * Ejemplo: "Corte puppy", "Pelado completo", "Tijera solo en cara y patas"
     */
    @Column('text', {
        nullable: true
    })
    hairStyle?: string;

    /**
     * Array de productos utilizados durante la sesión
     * Útil para tracking de productos que funcionaron bien o causaron reacciones
     * Ejemplos: ["Shampoo hipoalergénico", "Acondicionador para pelo largo"]
     */
    @Column('text', {
        array: true,
        default: []
    })
    productsUsed: string[];

    /**
     * Condición de la piel observada durante la sesión
     * Permite detectar problemas dermatológicos tempranos
     * Ejemplos: "Normal", "Piel seca con descamación", "Enrojecimiento en abdomen"
     */
    @Column('text', {
        nullable: true
    })
    skinCondition?: string;

    /**
     * Condición del pelaje observada
     * Importante para recomendar frecuencia de grooming y productos
     * Ejemplos: "Pelaje saludable y brillante", "Nudos moderados en patas traseras"
     */
    @Column('text', {
        nullable: true
    })
    coatCondition?: string;

    /**
     * Comportamiento de la mascota durante la sesión
     * Crítico para seguridad del groomer y bienestar de la mascota
     * Ejemplos: "Tranquilo y cooperativo", "Nervioso al cortar uñas", "Agresivo al bañar"
     */
    @Column('text', {
        nullable: true
    })
    behaviorDuringSession?: string;

    /**
     * Observaciones generales de la sesión
     * Información adicional relevante no categorizada
     * Ejemplo: "Se encontró garrapata en oreja izquierda (removida)"
     */
    @Column('text', {
        nullable: true
    })
    observations?: string;

    /**
     * Recomendaciones para el cliente
     * Consejos de cuidado en casa o alertas sobre problemas detectados
     * Ejemplo: "Cepillar diariamente para evitar nudos. Revisar piel seca con veterinario."
     */
    @Column('text', {
        nullable: true
    })
    recommendations?: string;

    /**
     * Duración de la sesión en minutos
     * Útil para programación y estimación de tiempos
     */
    @Column('int', {
        nullable: true
    })
    durationMinutes?: number;

    /**
     * Costo del servicio de grooming
     * Registro financiero de la sesión
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
     * Cada sesión de grooming pertenece a una mascota
     */
    @ManyToOne(
        () => Pet,
        (pet) => pet.groomingRecords,
        { eager: true }
    )
    pet: Pet;

    /**
     * Relación Many-to-One con User (groomer)
     * Registra qué peluquero realizó el servicio
     * Útil para asignar clientes a groomers preferidos
     */
    @ManyToOne(
        () => User,
        { eager: true, nullable: true }
    )
    groomer?: User;

}
