import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../auth/entities/user.entity';
import { ServiceType } from '../../common/enums';

/**
 * Entidad Service que representa los servicios ofrecidos en la tienda de mascotas
 * Incluye servicios de peluquería (grooming) y veterinarios (veterinary)
 *
 * Relaciones:
 * - ManyToOne con User: cada servicio es creado/administrado por un usuario
 */
@Entity({ name: 'services' })
@Index(['type']) // Índice para filtrar por tipo de servicio
@Index(['isActive']) // Índice para filtrar servicios activos
export class Service {
  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'Service ID (UUID)',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Peluquería Canina Básica',
    description: 'Service name',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  name: string;

  @ApiProperty({
    example: 'Servicio completo de peluquería para perros que incluye baño, secado y corte de uñas',
    description: 'Service description',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 35.00,
    description: 'Service price in dollars',
  })
  @Column('float')
  price: number;

  @ApiProperty({
    example: 90,
    description: 'Estimated duration in minutes',
  })
  @Column('int')
  durationMinutes: number;

  @ApiProperty({
    example: ServiceType.GROOMING,
    description: 'Service type',
    enum: ServiceType,
  })
  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  @ApiProperty({
    example: 'grooming-basic.jpg',
    description: 'Service image URL',
    required: false,
  })
  @Column('text', { nullable: true })
  image?: string;

  @ApiProperty({
    example: true,
    description: 'Is service active and available for booking',
    default: true,
  })
  @Column('bool', { default: true })
  isActive: boolean;

  /**
   * Relación Many-to-One con User
   * Cada servicio es creado/administrado por un usuario específico
   * eager: true carga automáticamente el usuario al consultar el servicio
   */
  @ManyToOne(() => User, (user) => user.services, { eager: true })
  user: User;

  @ApiProperty({
    description: 'Service creation timestamp',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Service last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
