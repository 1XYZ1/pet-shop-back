import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities';

/**
 * Entidad User que representa los usuarios del sistema
 * Puede ser cliente o administrador según los roles
 *
 * Relaciones:
 * - OneToMany con Product: un usuario puede crear muchos productos
 * - OneToMany con Service: un usuario puede crear muchos servicios
 * - OneToMany con Appointment: un usuario puede tener muchas citas agendadas
 */
@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    /**
     * Relación One-to-Many con Product
     * Un usuario puede crear múltiples productos
     */
    @OneToMany(
        () => Product,
        ( product ) => product.user
    )
    product: Product;

    /**
     * Relación One-to-Many con Service
     * Un usuario (admin) puede crear múltiples servicios
     */
    @OneToMany(
        'Service',
        (service: any) => service.user
    )
    services: any[];

    /**
     * Relación One-to-Many con Appointment
     * Un usuario (cliente) puede tener múltiples citas
     */
    @OneToMany(
        'Appointment',
        (appointment: any) => appointment.customer
    )
    appointments: any[];


    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }

}
