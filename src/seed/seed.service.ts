import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductsService } from '../products/products.service';
import { ServicesService } from '../services/services.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Vaccination } from '../medical-records/entities/vaccination.entity';
import { GroomingRecord } from '../grooming-records/entities/grooming-record.entity';
import { AppointmentPet } from '../appointments/entities/appointment-pet.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { PetSpecies, PetGender, PetTemperament, VisitType } from '../common/enums';

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
    private readonly userRepository: Repository<User>,

    // Repositorios para sistema de mascotas
    @InjectRepository( Pet )
    private readonly petRepository: Repository<Pet>,

    @InjectRepository( MedicalRecord )
    private readonly medicalRecordRepository: Repository<MedicalRecord>,

    @InjectRepository( Vaccination )
    private readonly vaccinationRepository: Repository<Vaccination>,

    @InjectRepository( GroomingRecord )
    private readonly groomingRecordRepository: Repository<GroomingRecord>,

    @InjectRepository( AppointmentPet )
    private readonly appointmentPetRepository: Repository<AppointmentPet>,

    @InjectRepository( Cart )
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository( CartItem )
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  /**
   * Ejecuta el seed completo de la base de datos
   * 1. Elimina todos los datos existentes
   * 2. Inserta usuarios
   * 3. Inserta productos
   * 4. Inserta servicios
   * 5. Inserta mascotas
   * 6. Inserta registros médicos y vacunas
   * 7. Inserta registros de grooming
   * 8. Inserta citas
   * 9. Vincula mascotas a citas
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

    // Inserta mascotas asociadas a usuarios
    const pets = await this.insertPets( users );

    // Inserta registros médicos para las mascotas
    await this.insertMedicalRecords( pets, adminUser );

    // Inserta vacunas para las mascotas
    await this.insertVaccinations( pets, adminUser );

    // Inserta registros de grooming para las mascotas
    await this.insertGroomingRecords( pets, adminUser );

    // Inserta citas de ejemplo usando los servicios, usuarios y mascotas creados
    const appointments = await this.insertNewAppointments( services, users, pets, adminUser );

    // Vincula mascotas a las citas creadas
    await this.linkPetsToAppointments( appointments, pets, services );

    return 'SEED EXECUTED - Database populated successfully with pets system';
  }

  /**
   * Elimina todos los datos de todas las tablas
   * El orden es importante debido a las relaciones:
   * 1. AppointmentPet (depende de Appointments y Pets)
   * 2. Appointments (depende de Services y Users)
   * 3. GroomingRecords (depende de Pets y Users)
   * 4. Vaccinations (depende de Pets y Users)
   * 5. MedicalRecords (depende de Pets y Users)
   * 6. Pets (depende de Users)
   * 7. Services (depende de Users)
   * 8. CartItems (depende de Products y Carts)
   * 9. Carts (depende de Users)
   * 10. Products (depende de Users)
   * 11. Users (base)
   */
  private async deleteTables() {
    // Eliminar AppointmentPet primero (tabla intermedia)
    await this.appointmentPetRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Eliminar citas (depende de servicios y usuarios)
    await this.appointmentsService.deleteAllAppointments();

    // Eliminar registros de grooming (depende de mascotas)
    await this.groomingRecordRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Eliminar vacunas (depende de mascotas)
    await this.vaccinationRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Eliminar registros médicos (depende de mascotas)
    await this.medicalRecordRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Eliminar mascotas (depende de usuarios)
    await this.petRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Eliminar servicios (depende de usuarios)
    await this.servicesService.deleteAllServices();

    // Eliminar items del carrito (depende de productos y carritos)
    await this.cartItemRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Eliminar carritos (depende de usuarios)
    await this.cartRepository.createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Eliminar productos (depende de usuarios)
    await this.productsService.deleteAllProducts();

    // Eliminar usuarios al final
    await this.userRepository.createQueryBuilder()
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
   * @param pets - Array de mascotas creadas
   * @param adminUser - Usuario administrador para actualizar estados
   * @returns Array de appointments creados
   */
  private async insertNewAppointments( services: any[], users: User[], pets: Pet[], adminUser: User ): Promise<any[]> {
    const appointmentsData = initialData.appointments;
    const createdAppointments = [];

    for (const appointmentData of appointmentsData) {
      const { serviceIndex, customerIndex, petIndex, ...appointmentInfo } = appointmentData;

      // Obtiene el servicio, el cliente y la mascota según los índices
      const service = services[serviceIndex];
      const customer = users[customerIndex];
      const pet = pets[petIndex];

      // Crea el DTO de appointment
      const appointmentDto = {
        date: appointmentInfo.date.toISOString(),
        petId: pet.id,
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

      createdAppointments.push(appointment);
    }

    return createdAppointments;
  }

  /**
   * Inserta mascotas de ejemplo en la base de datos
   * @param users - Array de usuarios para asignar como dueños
   * @returns Array de mascotas creadas
   */
  private async insertPets( users: User[] ): Promise<Pet[]> {
    const petsData = [
      {
        name: 'Max',
        species: PetSpecies.DOG,
        breed: 'Golden Retriever',
        birthDate: new Date('2020-05-15'),
        gender: PetGender.MALE,
        color: 'Dorado',
        weight: 32.5,
        microchipNumber: '123456789012345',
        temperament: PetTemperament.FRIENDLY,
        behaviorNotes: ['Le gusta nadar', 'Nervioso con otros perros', 'Obediente'],
        generalNotes: 'Muy activo, necesita ejercicio diario. Excelente con niños.',
        owner: users[1], // test1@google.com
      },
      {
        name: 'Luna',
        species: PetSpecies.CAT,
        breed: 'Siamés',
        birthDate: new Date('2021-08-20'),
        gender: PetGender.FEMALE,
        color: 'Crema con puntos oscuros',
        weight: 4.2,
        microchipNumber: '987654321098765',
        temperament: PetTemperament.CALM,
        behaviorNotes: ['Independiente', 'No le gustan las visitas', 'Prefiere espacios tranquilos'],
        generalNotes: 'Gata tranquila, perfecta para apartamento.',
        owner: users[1], // test1@google.com (mismo dueño que Max)
      },
      {
        name: 'Rocky',
        species: PetSpecies.DOG,
        breed: 'Bulldog Francés',
        birthDate: new Date('2019-11-10'),
        gender: PetGender.MALE,
        color: 'Atigrado',
        weight: 12.0,
        temperament: PetTemperament.FRIENDLY,
        behaviorNotes: ['Ronca mucho', 'Le gusta dormir', 'Sociable'],
        generalNotes: 'Perro tranquilo, ideal para espacios pequeños.',
        owner: users[2], // test2@google.com
      },
      {
        name: 'Michi',
        species: PetSpecies.CAT,
        breed: 'Persa',
        birthDate: new Date('2022-03-05'),
        gender: PetGender.MALE,
        color: 'Blanco',
        weight: 5.5,
        microchipNumber: '112233445566778',
        temperament: PetTemperament.CALM,
        behaviorNotes: ['Requiere cepillado diario', 'Pelo largo'],
        generalNotes: 'Gato de pelo largo que requiere cuidados especiales.',
        owner: users[3], // test3@google.com
      },
      {
        name: 'Bella',
        species: PetSpecies.DOG,
        breed: 'Beagle',
        birthDate: new Date('2021-01-15'),
        gender: PetGender.FEMALE,
        color: 'Tricolor',
        weight: 10.5,
        temperament: PetTemperament.NERVOUS,
        behaviorNotes: ['Ansiedad por separación', 'Ladradora', 'Muy olfateadora'],
        generalNotes: 'Necesita entrenamiento para ansiedad.',
        owner: users[4], // test4@google.com
      },
      {
        name: 'Coco',
        species: PetSpecies.BIRD,
        breed: 'Cacatúa',
        birthDate: new Date('2020-07-22'),
        gender: PetGender.UNKNOWN,
        color: 'Blanco',
        weight: 0.85,
        temperament: PetTemperament.FRIENDLY,
        behaviorNotes: ['Habla mucho', 'Le gusta la música', 'Sociable'],
        generalNotes: 'Ave muy inteligente y vocal.',
        owner: users[5], // test5@google.com
      },
      {
        name: 'Toby',
        species: PetSpecies.RABBIT,
        breed: 'Mini Lop',
        birthDate: new Date('2022-09-10'),
        gender: PetGender.MALE,
        color: 'Gris',
        weight: 1.8,
        temperament: PetTemperament.CALM,
        behaviorNotes: ['Tímido al principio', 'Le gustan las zanahorias'],
        generalNotes: 'Conejo enano muy tierno.',
        owner: users[0], // admin (test1@google.com)
      },
    ];

    const pets: Pet[] = [];

    for (const petData of petsData) {
      const pet = this.petRepository.create(petData);
      pets.push(pet);
    }

    const savedPets = await this.petRepository.save(pets);
    return savedPets;
  }

  /**
   * Inserta registros médicos de ejemplo para las mascotas
   * @param pets - Array de mascotas creadas
   * @param adminUser - Usuario que actúa como veterinario
   */
  private async insertMedicalRecords( pets: Pet[], adminUser: User ): Promise<void> {
    const medicalRecordsData = [
      // Registros para Max
      {
        pet: pets[0], // Max
        visitDate: new Date('2025-10-15T14:00:00'),
        visitType: VisitType.CHECKUP,
        reason: 'Chequeo anual de rutina',
        diagnosis: 'Salud óptima. Condición física excelente.',
        treatment: 'Ninguno necesario. Continuar con dieta actual.',
        notes: 'Perro en excelente estado. Peso ideal para su raza.',
        weightAtVisit: 32.5,
        temperature: 38.3,
        serviceCost: 35.00,
        veterinarian: adminUser,
      },
      {
        pet: pets[0], // Max
        visitDate: new Date('2025-07-10T10:00:00'),
        visitType: VisitType.CONSULTATION,
        reason: 'Revisión de piel - irritación en patas',
        diagnosis: 'Dermatitis alérgica leve',
        treatment: 'Crema tópica por 7 días. Evitar pastos recién cortados.',
        weightAtVisit: 31.8,
        temperature: 38.5,
        serviceCost: 50.00,
        veterinarian: adminUser,
      },
      // Registros para Luna
      {
        pet: pets[1], // Luna
        visitDate: new Date('2025-09-20T11:00:00'),
        visitType: VisitType.CHECKUP,
        reason: 'Chequeo semestral',
        diagnosis: 'Estado de salud bueno',
        treatment: 'Reforzar dieta con taurina',
        notes: 'Gata en buen estado general. Recomendar juguetes interactivos.',
        weightAtVisit: 4.2,
        temperature: 38.7,
        serviceCost: 30.00,
        veterinarian: adminUser,
      },
      // Registros para Rocky
      {
        pet: pets[2], // Rocky
        visitDate: new Date('2025-08-05T15:30:00'),
        visitType: VisitType.CONSULTATION,
        reason: 'Dificultad respiratoria',
        diagnosis: 'Problemas respiratorios típicos de la raza',
        treatment: 'Evitar ejercicio intenso en climas calurosos. Humidificador en casa.',
        notes: 'Propietario educado sobre cuidados especiales del Bulldog Francés.',
        weightAtVisit: 12.0,
        temperature: 38.9,
        serviceCost: 45.00,
        veterinarian: adminUser,
      },
      // Registros para Bella
      {
        pet: pets[4], // Bella
        visitDate: new Date('2025-06-15T09:00:00'),
        visitType: VisitType.CONSULTATION,
        reason: 'Ansiedad - comportamiento destructivo',
        diagnosis: 'Ansiedad por separación moderada',
        treatment: 'Remitido a entrenador canino. Considerar juguetes de enriquecimiento.',
        notes: 'Se recomendó programa de modificación de conducta.',
        weightAtVisit: 10.5,
        temperature: 38.4,
        serviceCost: 40.00,
        veterinarian: adminUser,
      },
    ];

    const medicalRecords = medicalRecordsData.map(data =>
      this.medicalRecordRepository.create(data)
    );

    await this.medicalRecordRepository.save(medicalRecords);
  }

  /**
   * Inserta vacunas de ejemplo para las mascotas
   * @param pets - Array de mascotas creadas
   * @param adminUser - Usuario que actúa como veterinario
   */
  private async insertVaccinations( pets: Pet[], adminUser: User ): Promise<void> {
    const vaccinationsData = [
      // Vacunas para Max
      {
        pet: pets[0],
        vaccineName: 'Antirrábica',
        administeredDate: new Date('2025-05-15'),
        nextDueDate: new Date('2026-05-15'),
        batchNumber: 'RAB-2025-ABC123',
        notes: 'Sin reacciones adversas',
        veterinarian: adminUser,
      },
      {
        pet: pets[0],
        vaccineName: 'Séxtuple (DHPPI-L)',
        administeredDate: new Date('2025-05-15'),
        nextDueDate: new Date('2026-05-15'),
        batchNumber: 'SEX-2025-XYZ789',
        veterinarian: adminUser,
      },
      {
        pet: pets[0],
        vaccineName: 'Tos de las perreras',
        administeredDate: new Date('2025-03-10'),
        nextDueDate: new Date('2025-12-10'),
        batchNumber: 'TOS-2025-DEF456',
        notes: 'Refuerzo anual recomendado',
        veterinarian: adminUser,
      },
      // Vacunas para Luna
      {
        pet: pets[1],
        vaccineName: 'Triple Felina',
        administeredDate: new Date('2025-08-20'),
        nextDueDate: new Date('2026-08-20'),
        batchNumber: 'TRI-2025-FEL111',
        veterinarian: adminUser,
      },
      {
        pet: pets[1],
        vaccineName: 'Antirrábica',
        administeredDate: new Date('2025-08-20'),
        nextDueDate: new Date('2026-08-20'),
        batchNumber: 'RAB-2025-CAT222',
        veterinarian: adminUser,
      },
      // Vacunas para Rocky
      {
        pet: pets[2],
        vaccineName: 'Antirrábica',
        administeredDate: new Date('2024-11-10'),
        nextDueDate: new Date('2025-11-10'),
        batchNumber: 'RAB-2024-DOG333',
        notes: 'Próxima a vencer - enviar recordatorio',
        veterinarian: adminUser,
      },
      {
        pet: pets[2],
        vaccineName: 'Séxtuple (DHPPI-L)',
        administeredDate: new Date('2024-11-10'),
        nextDueDate: new Date('2025-11-10'),
        batchNumber: 'SEX-2024-BUL444',
        veterinarian: adminUser,
      },
      // Vacunas para Bella
      {
        pet: pets[4],
        vaccineName: 'Antirrábica',
        administeredDate: new Date('2025-01-15'),
        nextDueDate: new Date('2026-01-15'),
        batchNumber: 'RAB-2025-BEA555',
        veterinarian: adminUser,
      },
    ];

    const vaccinations = vaccinationsData.map(data =>
      this.vaccinationRepository.create(data)
    );

    await this.vaccinationRepository.save(vaccinations);
  }

  /**
   * Inserta registros de grooming de ejemplo para las mascotas
   * @param pets - Array de mascotas creadas
   * @param adminUser - Usuario que actúa como groomer
   */
  private async insertGroomingRecords( pets: Pet[], adminUser: User ): Promise<void> {
    const groomingRecordsData = [
      // Sesiones para Max
      {
        pet: pets[0],
        sessionDate: new Date('2025-10-20T11:00:00'),
        servicesPerformed: ['Baño', 'Corte', 'Uñas', 'Limpieza de oídos'],
        hairStyle: 'Corte verano',
        productsUsed: ['Shampoo hipoalergénico', 'Acondicionador', 'Perfume canino'],
        skinCondition: 'Piel sana',
        coatCondition: 'Pelaje brillante y suave',
        behaviorDuringSession: 'Muy cooperativo y tranquilo',
        observations: 'Excelente comportamiento. Se quedó dormido durante el secado.',
        recommendations: 'Cepillar 2 veces por semana para evitar nudos',
        durationMinutes: 90,
        serviceCost: 45.00,
        groomer: adminUser,
      },
      {
        pet: pets[0],
        sessionDate: new Date('2025-08-15T10:00:00'),
        servicesPerformed: ['Baño', 'Uñas'],
        productsUsed: ['Shampoo hipoalergénico'],
        behaviorDuringSession: 'Tranquilo',
        observations: 'Sesión rápida, solo baño y uñas',
        durationMinutes: 60,
        serviceCost: 30.00,
        groomer: adminUser,
      },
      // Sesiones para Luna
      {
        pet: pets[1],
        sessionDate: new Date('2025-09-25T14:00:00'),
        servicesPerformed: ['Baño', 'Cepillado', 'Uñas'],
        hairStyle: 'Cepillado completo',
        productsUsed: ['Shampoo para gatos', 'Spray desenredante'],
        skinCondition: 'Normal',
        coatCondition: 'Pelo brillante',
        behaviorDuringSession: 'Nerviosa al principio, luego se calmó',
        observations: 'Gata tímida pero cooperativa',
        recommendations: 'Cepillar diariamente en casa',
        durationMinutes: 45,
        serviceCost: 35.00,
        groomer: adminUser,
      },
      // Sesiones para Rocky
      {
        pet: pets[2],
        sessionDate: new Date('2025-07-30T15:00:00'),
        servicesPerformed: ['Baño', 'Limpieza de arrugas faciales', 'Uñas'],
        productsUsed: ['Shampoo especial Bulldog', 'Toallitas para arrugas'],
        skinCondition: 'Arrugas requieren limpieza frecuente',
        coatCondition: 'Pelo corto en buen estado',
        behaviorDuringSession: 'Muy tranquilo, casi dormido',
        observations: 'Excelente paciente. Ronca incluso durante el baño.',
        recommendations: 'Limpiar arrugas faciales diariamente con toallitas especiales',
        durationMinutes: 75,
        serviceCost: 40.00,
        groomer: adminUser,
      },
      // Sesiones para Michi
      {
        pet: pets[3],
        sessionDate: new Date('2025-10-05T11:30:00'),
        servicesPerformed: ['Baño', 'Cepillado profundo', 'Corte sanitario', 'Uñas'],
        hairStyle: 'Corte higiénico',
        productsUsed: ['Shampoo para pelo largo', 'Acondicionador', 'Spray desenredante'],
        skinCondition: 'Piel sensible',
        coatCondition: 'Pelo largo con algunos nudos',
        behaviorDuringSession: 'Muy tranquilo y colaborador',
        observations: 'Requiere cepillado frecuente. Se encontraron algunos nudos pequeños.',
        recommendations: 'Cepillado diario obligatorio. Usar cepillo de cerdas naturales.',
        durationMinutes: 120,
        serviceCost: 55.00,
        groomer: adminUser,
      },
      // Sesiones para Bella
      {
        pet: pets[4],
        sessionDate: new Date('2025-06-20T09:30:00'),
        servicesPerformed: ['Baño', 'Uñas'],
        productsUsed: ['Shampoo neutro'],
        skinCondition: 'Normal',
        coatCondition: 'Pelo corto, fácil de manejar',
        behaviorDuringSession: 'Nerviosa y ladradora',
        observations: 'Requirió más tiempo por ansiedad. Se usó técnica de calmado.',
        recommendations: 'Visitas más frecuentes para acostumbrarla',
        durationMinutes: 70,
        serviceCost: 30.00,
        groomer: adminUser,
      },
    ];

    const groomingRecords = groomingRecordsData.map(data =>
      this.groomingRecordRepository.create(data)
    );

    await this.groomingRecordRepository.save(groomingRecords);
  }

  /**
   * Vincula mascotas a appointments existentes
   * @param appointments - Array de appointments creados
   * @param pets - Array de mascotas creadas
   * @param services - Array de servicios creados
   */
  private async linkPetsToAppointments( appointments: any[], pets: Pet[], services: any[] ): Promise<void> {
    // No vincular si no hay appointments
    if (!appointments || appointments.length === 0) {
      return;
    }

    const appointmentPetsData = [
      // Appointment 1: Max - Baño completo
      {
        appointment: appointments[0],
        pet: pets[0], // Max
        notes: 'Corte verano especial',
        price: 45.00,
        status: 'pending' as 'pending' | 'completed' | 'cancelled',
        services: [services[0]], // Primer servicio
      },
      // Appointment 2: Luna y Max juntos
      {
        appointment: appointments[1] || appointments[0],
        pet: pets[1], // Luna
        notes: 'Solo baño para gata',
        price: 35.00,
        status: 'pending' as 'pending' | 'completed' | 'cancelled',
        services: [services[1] || services[0]],
      },
      {
        appointment: appointments[1] || appointments[0],
        pet: pets[0], // Max (mismo appointment que Luna)
        notes: 'Baño rápido',
        price: 30.00,
        status: 'pending' as 'pending' | 'completed' | 'cancelled',
        services: [services[0]],
      },
      // Appointment 3: Rocky
      {
        appointment: appointments[2] || appointments[0],
        pet: pets[2], // Rocky
        notes: 'Limpieza de arrugas facial',
        price: 40.00,
        status: 'pending' as 'pending' | 'completed' | 'cancelled',
        services: [services[0]],
      },
    ];

    const appointmentPets = [];
    for (const data of appointmentPetsData) {
      const appointmentPet = this.appointmentPetRepository.create(data);
      appointmentPets.push(appointmentPet);
    }

    await this.appointmentPetRepository.save(appointmentPets);
  }

}
