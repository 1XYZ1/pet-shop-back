import { Injectable, Logger } from '@nestjs/common';
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
  // Logger para tracking del proceso de seeding
  private readonly logger = new Logger('SeedService');

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
    this.logger.log('Iniciando proceso de seed de base de datos...');

    // Elimina todos los datos existentes
    this.logger.log('Eliminando datos existentes...');
    await this.deleteTables();

    // Inserta usuarios y obtiene el usuario administrador
    this.logger.log('Insertando usuarios...');
    const users = await this.insertUsers();
    const adminUser = users[0];

    // Inserta productos con el usuario administrador
    this.logger.log('Insertando productos...');
    await this.insertNewProducts( adminUser );

    // Inserta servicios con el usuario administrador
    this.logger.log('Insertando servicios...');
    const services = await this.insertNewServices( adminUser );

    // Inserta mascotas asociadas a usuarios
    this.logger.log('Insertando mascotas...');
    const pets = await this.insertPets( users );

    // Inserta registros médicos para las mascotas
    this.logger.log('Insertando registros médicos...');
    await this.insertMedicalRecords( pets, adminUser );

    // Inserta vacunas para las mascotas
    this.logger.log('Insertando vacunaciones...');
    await this.insertVaccinations( pets, adminUser );

    // Inserta registros de grooming para las mascotas
    this.logger.log('Insertando registros de grooming...');
    await this.insertGroomingRecords( pets, adminUser );

    // Inserta citas de ejemplo usando los servicios, usuarios y mascotas creados
    this.logger.log('Insertando citas...');
    const appointments = await this.insertNewAppointments( services, users, pets, adminUser );

    // Vincula mascotas a las citas creadas
    this.logger.log('Vinculando mascotas a citas...');
    await this.linkPetsToAppointments( appointments, pets, services );

    this.logger.log('SEED COMPLETADO - Base de datos poblada exitosamente');
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
        profilePhoto: `${process.env.HOST_API}/files/pet/max-golden-retriever.jpg`,
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
        profilePhoto: `${process.env.HOST_API}/files/pet/luna-siames.jpg`,
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
        profilePhoto: `${process.env.HOST_API}/files/pet/rocky-bulldog.jpg`,
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
        prescriptions: ['Vitamina C - 1 tableta diaria por 30 días', 'Suplemento omega-3 - con comida, una vez al día'],
        followUpDate: new Date('2026-10-15'),
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
        prescriptions: ['Crema de hidrocortisona 1% - aplicar 2 veces al día en zonas afectadas', 'Antihistamínico Cetirizina 10mg - 1 tableta cada 12 horas por 7 días'],
        followUpDate: new Date('2025-07-24'),
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
        prescriptions: ['Suplemento de taurina - mezclar con comida húmeda diariamente'],
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
        prescriptions: [],
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
        prescriptions: ['Adaptil (feromonas calmantes) - difusor en habitación principal', 'Suplemento calmante natural - 1 tableta cada 12 horas'],
        followUpDate: new Date('2025-09-15'),
        weightAtVisit: 10.5,
        temperature: 38.4,
        serviceCost: 40.00,
        veterinarian: adminUser,
      },
      // Registros para Michi (gato persa)
      {
        pet: pets[3], // Michi
        visitDate: new Date('2025-10-01T10:30:00'),
        visitType: VisitType.CHECKUP,
        reason: 'Primer chequeo - gato joven',
        diagnosis: 'Salud excelente. Desarrollo normal para su edad.',
        treatment: 'Continuar con dieta premium para gatos persas.',
        notes: 'Requiere cepillado diario debido a pelo largo. Sin problemas de salud.',
        prescriptions: ['Pasta de malta - 2 veces por semana para prevenir bolas de pelo'],
        weightAtVisit: 5.5,
        temperature: 38.6,
        serviceCost: 30.00,
        veterinarian: adminUser,
      },
      // Registros para Coco (cacatúa)
      {
        pet: pets[5], // Coco
        visitDate: new Date('2025-09-10T14:00:00'),
        visitType: VisitType.CHECKUP,
        reason: 'Chequeo anual aviar',
        diagnosis: 'Ave en excelente estado. Plumaje brillante y saludable.',
        treatment: 'Mantener dieta variada con frutas y semillas.',
        notes: 'Pico y uñas en buen estado. Comportamiento social saludable.',
        prescriptions: ['Suplemento vitamínico aviar - 3 gotas en agua diariamente', 'Calcio en polvo - espolvorear sobre frutas 2 veces por semana'],
        followUpDate: new Date('2026-09-10'),
        weightAtVisit: 0.85,
        temperature: 41.2,
        serviceCost: 45.00,
        veterinarian: adminUser,
      },
      // Registros para Toby (conejo)
      {
        pet: pets[6], // Toby
        visitDate: new Date('2025-10-25T11:00:00'),
        visitType: VisitType.CHECKUP,
        reason: 'Control rutinario - primer año',
        diagnosis: 'Conejo saludable. Dientes en buen estado.',
        treatment: 'Dieta rica en heno para mantener dientes sanos.',
        notes: 'Peso adecuado para la raza. Comportamiento normal.',
        prescriptions: ['Heno timothy ilimitado - base de la dieta', 'Verduras frescas - 1 taza diaria'],
        weightAtVisit: 1.8,
        temperature: 38.8,
        serviceCost: 35.00,
        veterinarian: adminUser,
      },
      // SURGERY - Max (operación de un quiste)
      {
        pet: pets[0], // Max
        visitDate: new Date('2025-05-20T09:00:00'),
        visitType: VisitType.SURGERY,
        reason: 'Remoción de quiste sebáceo en lomo',
        diagnosis: 'Quiste sebáceo benigno de 2cm en región lumbar',
        treatment: 'Cirugía menor bajo anestesia local. Extracción completa del quiste.',
        notes: 'Procedimiento exitoso. Muestra enviada a patología (resultado: benigno). Sutura con puntos absorbibles.',
        prescriptions: ['Antibiótico Cefalexina 500mg - cada 12 horas por 10 días', 'Analgésico Tramadol 50mg - cada 8 horas por 5 días', 'Collar isabelino - usar por 10 días hasta retirar puntos'],
        followUpDate: new Date('2025-06-03'),
        weightAtVisit: 32.0,
        temperature: 38.4,
        serviceCost: 250.00,
        veterinarian: adminUser,
      },
      // EMERGENCY - Rocky (crisis respiratoria)
      {
        pet: pets[2], // Rocky
        visitDate: new Date('2025-10-28T22:30:00'),
        visitType: VisitType.EMERGENCY,
        reason: 'Crisis respiratoria aguda - dificultad severa para respirar',
        diagnosis: 'Síndrome braquicefálico con obstrucción aguda de vías respiratorias',
        treatment: 'Oxigenoterapia inmediata. Corticoides IV. Enfriamiento corporal.',
        notes: 'EMERGENCIA NOCTURNA. Paciente llegó con cianosis leve. Estabilizado después de 2 horas. Se recomienda considerar cirugía correctiva de paladar blando.',
        prescriptions: ['Prednisona 10mg - 1 tableta cada 12 horas por 5 días, luego reducir dosis', 'Reposo absoluto - evitar ejercicio y calor por 2 semanas'],
        followUpDate: new Date('2025-11-04'),
        weightAtVisit: 12.2,
        temperature: 40.1,
        serviceCost: 180.00,
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
