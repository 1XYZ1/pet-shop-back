import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PetSpecies, PetGender, PetTemperament } from '../../common/enums';

/**
 * Entidad Pet que representa una mascota registrada en el sistema
 *
 * Características:
 * - Cada mascota pertenece a un usuario (owner)
 * - Soporta múltiples especies: perros, gatos, aves, conejos, hámsters y otras
 * - Almacena información básica: nombre, raza, fecha de nacimiento, peso, color
 * - Información médica: microchip, temperamento, notas de comportamiento
 * - Implementa soft delete con campo isActive
 *
 * Relaciones:
 * - ManyToOne con User: cada mascota tiene un dueño
 * - OneToMany con MedicalRecord: historial de consultas veterinarias
 * - OneToMany con Vaccination: registro de vacunas
 * - OneToMany con GroomingRecord: historial de sesiones de peluquería
 * - ManyToMany con Appointment: citas asociadas a esta mascota
 */
@Entity('pets')
@Index(['owner', 'isActive'])
export class Pet {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Nombre de la mascota
     * Requerido, mínimo 1 caracter
     */
    @Column('text')
    name: string;

    /**
     * Especie de la mascota
     * Valores permitidos: dog, cat, bird, rabbit, hamster, other
     */
    @Column({
        type: 'enum',
        enum: PetSpecies
    })
    species: PetSpecies;

    /**
     * Raza de la mascota
     * Opcional, puede ser desconocida o mestiza
     */
    @Column('text', {
        nullable: true
    })
    breed?: string;

    /**
     * Fecha de nacimiento de la mascota
     * Permite calcular edad y programar chequeos preventivos
     */
    @Column('date', {
        nullable: true
    })
    birthDate?: Date;

    /**
     * Género de la mascota
     * Valores permitidos: male, female, unknown
     */
    @Column({
        type: 'enum',
        enum: PetGender,
        default: PetGender.UNKNOWN
    })
    gender: PetGender;

    /**
     * Color o descripción física de la mascota
     * Útil para identificación
     */
    @Column('text', {
        nullable: true
    })
    color?: string;

    /**
     * Peso actual de la mascota en kilogramos
     * Se actualiza en cada consulta veterinaria
     */
    @Column('decimal', {
        precision: 5,
        scale: 2,
        nullable: true
    })
    weight?: number;

    /**
     * Número de microchip
     * Identificador único internacional para mascotas
     */
    @Column('text', {
        nullable: true,
        unique: true
    })
    microchipNumber?: string;

    /**
     * URL de la foto de perfil de la mascota
     * Almacenada en el sistema de archivos o servicio de storage
     */
    @Column('text', {
        nullable: true
    })
    profilePhoto?: string;

    /**
     * Temperamento general de la mascota
     * Valores: calm, nervous, aggressive, friendly, unknown
     * Útil para prevenir situaciones de riesgo durante servicios
     */
    @Column({
        type: 'enum',
        enum: PetTemperament,
        default: PetTemperament.UNKNOWN
    })
    temperament: PetTemperament;

    /**
     * Array de notas sobre comportamientos específicos
     * Ejemplos: "Muerde al bañarse", "Asustadizo con ruidos fuertes"
     */
    @Column('text', {
        array: true,
        default: []
    })
    behaviorNotes: string[];

    /**
     * Notas generales sobre la mascota
     * Información adicional relevante: alergias, condiciones preexistentes, etc.
     */
    @Column('text', {
        nullable: true
    })
    generalNotes?: string;

    /**
     * Indica si la mascota está activa en el sistema
     * Se usa para soft delete (false = eliminada)
     */
    @Column('bool', {
        default: true
    })
    isActive: boolean;

    /**
     * Fecha de creación del registro
     * Generada automáticamente por TypeORM
     */
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    /**
     * Fecha de última actualización del registro
     * Actualizada automáticamente por TypeORM
     */
    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    // ==================== RELACIONES ====================

    /**
     * Relación Many-to-One con User
     * Cada mascota pertenece a un usuario (owner/dueño)
     * La relación es eager para siempre cargar el dueño al obtener la mascota
     */
    @ManyToOne(
        () => User,
        (user) => user.pets,
        { eager: true }
    )
    owner: User;

    /**
     * Relación One-to-Many con MedicalRecord
     * Una mascota puede tener múltiples registros médicos
     */
    @OneToMany(
        'MedicalRecord',
        (medicalRecord: any) => medicalRecord.pet
    )
    medicalRecords: any[];

    /**
     * Relación One-to-Many con Vaccination
     * Una mascota puede tener múltiples vacunas registradas
     */
    @OneToMany(
        'Vaccination',
        (vaccination: any) => vaccination.pet
    )
    vaccinations: any[];

    /**
     * Relación One-to-Many con GroomingRecord
     * Una mascota puede tener múltiples sesiones de grooming
     */
    @OneToMany(
        'GroomingRecord',
        (groomingRecord: any) => groomingRecord.pet
    )
    groomingRecords: any[];

    /**
     * Relación Many-to-Many con Appointment a través de AppointmentPet
     * Una mascota puede estar asociada a múltiples citas
     */
    @OneToMany(
        'AppointmentPet',
        (appointmentPet: any) => appointmentPet.pet
    )
    appointmentPets: any[];

}
