import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../auth/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { AppointmentStatus } from '../../common/enums';

/**
 * Entidad Appointment que representa las citas agendadas en la tienda de mascotas
 * Gestiona el sistema de agendamiento de servicios para las mascotas de los clientes
 *
 * Relaciones:
 * - ManyToOne con Service: cada cita está asociada a un servicio específico
 * - ManyToOne con User (customer): cada cita pertenece a un cliente
 * - OneToMany con AppointmentPet: una cita puede tener múltiples mascotas asociadas
 */
@Entity({ name: 'appointments' })
@Index(['date', 'status']) // Índice compuesto para filtrar por fecha y estado
@Index(['status']) // Índice simple para filtrar por estado
export class Appointment {
  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'Appointment ID (UUID)',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '2025-11-05T10:00:00.000Z',
    description: 'Appointment date and time (ISO 8601 format)',
  })
  @Column('timestamp')
  date: Date;

  @ApiProperty({
    example: AppointmentStatus.PENDING,
    description: 'Appointment status',
    enum: AppointmentStatus,
  })
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @ApiProperty({
    example: 'Primera vez que viene Max, es un poco nervioso',
    description: 'Additional notes about the appointment or pet',
    required: false,
  })
  @Column('text', { nullable: true })
  notes?: string;

  @ApiProperty({
    example: 'Max',
    description: 'Pet name',
  })
  @Column('text')
  petName: string;

  @ApiProperty({
    example: 'Golden Retriever',
    description: 'Pet breed (optional)',
    required: false,
  })
  @Column('text', { nullable: true })
  petBreed?: string;

  /**
   * Relación Many-to-One con Service
   * Cada cita está asociada a un servicio específico (peluquería o veterinaria)
   * eager: true carga automáticamente el servicio al consultar la cita
   */
  @ManyToOne(() => Service, { eager: true })
  service: Service;

  /**
   * Relación Many-to-One con User (customer)
   * Cada cita pertenece a un cliente específico
   * eager: true carga automáticamente el cliente al consultar la cita
   */
  @ManyToOne(() => User, (user) => user.appointments, { eager: true })
  customer: User;

  @ApiProperty({
    description: 'Appointment creation timestamp',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Appointment last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Relación One-to-Many con AppointmentPet
   * Una cita puede tener múltiples mascotas asociadas
   * Cada mascota puede tener servicios, notas y precios individuales
   */
  @OneToMany(
    'AppointmentPet',
    (appointmentPet: any) => appointmentPet.appointment
  )
  appointmentPets: any[];
}
