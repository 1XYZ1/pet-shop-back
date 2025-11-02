import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from './appointment.entity';
import { Pet } from '../../pets/entities';
import { Service } from '../../services/entities/service.entity';

/**
 * Entidad AppointmentPet
 * Tabla intermedia que vincula Appointments con Pets en relación N:N
 *
 * Propósito:
 * - Permite que una cita (Appointment) tenga múltiples mascotas
 * - Cada mascota en la cita puede tener configuración individual:
 *   - Servicios específicos diferentes
 *   - Notas particulares por mascota
 *   - Precio individual
 *   - Estado individual (pending/completed/cancelled)
 *
 * Ejemplo de caso de uso:
 * Un cliente agenda una cita y trae 2 perros:
 * - Perro 1: Baño + Corte (servicios: [baño, corte], precio: 500)
 * - Perro 2: Solo Baño (servicios: [baño], precio: 300)
 * Ambos en la misma cita pero con configuración diferente.
 *
 * Relaciones:
 * - ManyToOne con Appointment: múltiples mascotas por cita
 * - ManyToOne con Pet: una mascota puede estar en múltiples citas
 * - ManyToMany con Service: cada mascota puede tener varios servicios en la cita
 */
@Entity({ name: 'appointment_pets' })
export class AppointmentPet {

    @ApiProperty({
        example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        description: 'AppointmentPet ID (UUID)',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Notas específicas para esta mascota en esta cita
     * Ejemplo: "Revisar uñas, estaban muy largas la última vez"
     * Es independiente de las notas generales del Appointment
     */
    @ApiProperty({
        example: 'Revisar oídos, tenía otitis el mes pasado',
        description: 'Notas específicas para esta mascota en esta cita',
        required: false,
    })
    @Column('text', { nullable: true })
    notes?: string;

    /**
     * Precio individual para esta mascota en esta cita
     * Permite facturación detallada por mascota
     * El total del appointment sería la suma de todos los prices
     */
    @ApiProperty({
        example: 350.00,
        description: 'Precio del servicio para esta mascota en esta cita',
        required: false,
    })
    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: true
    })
    price?: number;

    /**
     * Estado individual de esta mascota en la cita
     * Permite que una mascota esté completada y otra pendiente
     * en la misma cita
     */
    @ApiProperty({
        example: 'pending',
        description: 'Estado del servicio para esta mascota',
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    })
    @Column({
        type: 'enum',
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    })
    status: 'pending' | 'completed' | 'cancelled';

    /**
     * Fecha de creación del registro
     */
    @ApiProperty({
        description: 'Creation timestamp',
    })
    @CreateDateColumn()
    createdAt: Date;

    /**
     * Fecha de última actualización
     */
    @ApiProperty({
        description: 'Last update timestamp',
    })
    @UpdateDateColumn()
    updatedAt: Date;

    // ==================== RELACIONES ====================

    /**
     * Relación Many-to-One con Appointment
     * Múltiples mascotas pueden estar en la misma cita
     */
    @ManyToOne(
        () => Appointment,
        (appointment) => appointment.appointmentPets,
        { eager: false }
    )
    appointment: Appointment;

    /**
     * Relación Many-to-One con Pet
     * Cada registro pertenece a una mascota específica
     * eager: true para cargar siempre los datos de la mascota
     */
    @ManyToOne(
        () => Pet,
        (pet) => pet.appointmentPets,
        { eager: true }
    )
    pet: Pet;

    /**
     * Relación Many-to-Many con Service
     * Cada mascota en la cita puede tener múltiples servicios asignados
     * Ejemplo: [Baño, Corte de pelo, Corte de uñas]
     *
     * Esta relación es independiente del Service general del Appointment
     * El Appointment puede tener un servicio "Paquete Grooming Completo"
     * pero cada mascota puede tener servicios específicos diferentes
     */
    @ManyToMany(
        () => Service,
        { eager: true }
    )
    @JoinTable({
        name: 'appointment_pet_services',
        joinColumn: { name: 'appointment_pet_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' }
    })
    services: Service[];

}
