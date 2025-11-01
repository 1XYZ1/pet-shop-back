import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductsService } from '../products/products.service';
import { ServicesService } from '../services/services.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';

/**
 * Servicio encargado de poblar la base de datos con datos iniciales
 * Incluye usuarios, productos, servicios y citas de ejemplo
 */
@Injectable()
export class SeedService {

  constructor(
    // Servicio de productos para insertar productos de ejemplo
    private readonly productsService: ProductsService,
    // Servicio de servicios para insertar servicios de ejemplo
    private readonly servicesService: ServicesService,
    // Servicio de citas para insertar citas de ejemplo
    private readonly appointmentsService: AppointmentsService,

    // Repositorio de usuarios para insertar usuarios de ejemplo
    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Ejecuta el seed completo de la base de datos
   * 1. Elimina todos los datos existentes
   * 2. Inserta usuarios
   * 3. Inserta productos
   * 4. Inserta servicios
   * 5. Inserta citas
   *
   * @returns Mensaje de confirmación
   */
  async runSeed() {
    // Elimina todos los datos existentes
    await this.deleteTables();

    // Inserta usuarios y obtiene el usuario administrador
    const users = await this.insertUsers();
    const adminUser = users[0];

    // Inserta productos con el usuario administrador
    await this.insertNewProducts( adminUser );

    // Inserta servicios con el usuario administrador
    const services = await this.insertNewServices( adminUser );

    // Inserta citas de ejemplo usando los servicios y usuarios creados
    await this.insertNewAppointments( services, users, adminUser );

    return 'SEED EXECUTED - Database populated successfully';
  }

  /**
   * Elimina todos los datos de todas las tablas
   * El orden es importante debido a las relaciones:
   * 1. Appointments (depende de Services y Users)
   * 2. Services (depende de Users)
   * 3. Products (depende de Users)
   * 4. Users (base)
   */
  private async deleteTables() {
    // Eliminar citas primero (depende de servicios y usuarios)
    await this.appointmentsService.deleteAllAppointments();

    // Eliminar servicios (depende de usuarios)
    await this.servicesService.deleteAllServices();

    // Eliminar productos (depende de usuarios)
    await this.productsService.deleteAllProducts();

    // Eliminar usuarios al final
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  /**
   * Inserta usuarios de ejemplo en la base de datos
   * @returns Array de usuarios insertados
   */
  private async insertUsers(): Promise<User[]> {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create( user ) );
    });

    const dbUsers = await this.userRepository.save( users );

    return dbUsers;
  }


  /**
   * Inserta productos de ejemplo en la base de datos
   * @param user - Usuario que creará los productos
   */
  private async insertNewProducts( user: User ): Promise<void> {
    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.productsService.create( product, user ) );
    });

    await Promise.all( insertPromises );
  }

  /**
   * Inserta servicios de ejemplo en la base de datos
   * @param user - Usuario que creará los servicios
   * @returns Array de servicios creados (para usarlos en appointments)
   */
  private async insertNewServices( user: User ) {
    const servicesData = initialData.services;

    const insertedServices = [];

    for (const serviceData of servicesData) {
      const service = await this.servicesService.create( serviceData, user );
      insertedServices.push(service);
    }

    return insertedServices;
  }

  /**
   * Inserta citas de ejemplo en la base de datos
   * @param services - Array de servicios creados
   * @param users - Array de usuarios creados
   * @param adminUser - Usuario administrador para actualizar estados
   */
  private async insertNewAppointments( services: any[], users: User[], adminUser: User ): Promise<void> {
    const appointmentsData = initialData.appointments;

    for (const appointmentData of appointmentsData) {
      const { serviceIndex, customerIndex, ...appointmentInfo } = appointmentData;

      // Obtiene el servicio y el cliente según los índices
      const service = services[serviceIndex];
      const customer = users[customerIndex];

      // Crea el DTO de appointment
      const appointmentDto = {
        date: appointmentInfo.date.toISOString(),
        petName: appointmentInfo.petName,
        petBreed: appointmentInfo.petBreed,
        notes: appointmentInfo.notes,
        serviceId: service.id,
      };

      // Crea la cita
      const appointment = await this.appointmentsService.create(appointmentDto, customer);

      // Si la cita tiene un estado diferente de PENDING, actualizarlo
      // (por defecto se crea como PENDING)
      // NOTA: Usar adminUser porque solo admin puede cambiar estados
      if (appointmentInfo.status !== 'pending') {
        await this.appointmentsService.update(
          appointment.id,
          { status: appointmentInfo.status },
          adminUser
        );
      }
    }
  }

}
