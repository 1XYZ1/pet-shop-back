import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateAppointmentDto, UpdateAppointmentDto, FindAppointmentsQueryDto } from './dto';
import { Appointment } from './entities';
import { User } from '../auth/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { ServicesService } from '../services/services.service';
import { ValidRoles } from '../auth/interfaces';

/**
 * Servicio principal para manejar todas las operaciones CRUD de citas
 * Incluye funcionalidades de búsqueda, paginación, validaciones y control de acceso
 */
@Injectable()
export class AppointmentsService {
  // Logger específico para este servicio
  private readonly logger = new Logger('AppointmentsService');

  constructor(
    // Inyección del repositorio de citas
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    // Inyección del repositorio de mascotas para validar ownership
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,

    // Inyección del servicio de servicios para validar que el servicio existe
    private readonly servicesService: ServicesService,
  ) {}

  /**
   * Crea una nueva cita
   * Valida que la fecha sea futura, que el servicio exista y que la mascota pertenezca al usuario
   * @param createAppointmentDto - Datos de la cita a crear
   * @param customer - Usuario que está creando la cita (cliente)
   * @returns La cita creada con la mascota y servicio populados
   */
  async create(createAppointmentDto: CreateAppointmentDto, customer: User): Promise<Appointment> {
    const { serviceId, petId, date, ...appointmentData } = createAppointmentDto;

    // Validar que la fecha sea futura
    const appointmentDate = new Date(date);
    const now = new Date();
    if (appointmentDate <= now) {
      throw new BadRequestException('La fecha de la cita debe ser futura');
    }

    // Validar que la mascota existe y pertenece al usuario autenticado
    const pet = await this.petRepository.findOne({
      where: {
        id: petId,
        owner: { id: customer.id },
        isActive: true
      },
    });

    if (!pet) {
      throw new NotFoundException(
        'Mascota no encontrada o no pertenece al usuario autenticado'
      );
    }

    // Validar que el servicio existe
    const service = await this.servicesService.findOne(serviceId);

    try {
      // Crea la instancia de la cita en memoria
      const appointment = this.appointmentRepository.create({
        ...appointmentData,
        date: appointmentDate,
        pet,
        service,
        customer,
      });

      // Guarda la cita en la base de datos
      await this.appointmentRepository.save(appointment);

      return appointment;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtiene una lista filtrada de citas con paginación
   * Control de acceso:
   * - Usuarios normales solo ven sus propias citas
   * - Administradores ven todas las citas
   *
   * @param queryDto - Parámetros de filtrado y paginación
   * @param user - Usuario que realiza la consulta
   * @returns Objeto con citas filtradas, total de registros y metadata, incluyendo el objeto pet poblado
   */
  async findAll(queryDto: FindAppointmentsQueryDto, user: User) {
    const { limit = 10, offset = 0, status, serviceId, dateFrom, dateTo } = queryDto;

    // Construye el query builder incluyendo la relación con pet
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.pet', 'pet')
      .leftJoinAndSelect('appointment.service', 'service')
      .leftJoinAndSelect('appointment.customer', 'customer')
      .orderBy('appointment.date', 'ASC'); // Ordena por fecha ascendente (próximas citas primero)

    // Control de acceso: usuarios normales solo ven sus propias citas
    if (!user.roles.includes(ValidRoles.admin)) {
      queryBuilder.andWhere('appointment.customer.id = :customerId', {
        customerId: user.id,
      });
    }

    // Filtro por estado
    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    // Filtro por servicio
    if (serviceId) {
      queryBuilder.andWhere('appointment.service.id = :serviceId', { serviceId });
    }

    // Filtro por rango de fechas
    if (dateFrom && dateTo) {
      queryBuilder.andWhere('appointment.date BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    } else if (dateFrom) {
      queryBuilder.andWhere('appointment.date >= :dateFrom', {
        dateFrom: new Date(dateFrom),
      });
    } else if (dateTo) {
      queryBuilder.andWhere('appointment.date <= :dateTo', {
        dateTo: new Date(dateTo),
      });
    }

    // Ejecuta la consulta con paginación
    const [appointments, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      appointments,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca una cita específica por ID
   * Control de acceso:
   * - Usuarios normales solo pueden ver sus propias citas
   * - Administradores pueden ver cualquier cita
   *
   * @param id - ID de la cita (UUID)
   * @param user - Usuario que realiza la consulta
   * @returns La cita encontrada
   */
  async findOne(id: string, user: User): Promise<Appointment> {
    if (!isUUID(id)) {
      throw new BadRequestException('ID inválido');
    }

    const appointment = await this.appointmentRepository.findOneBy({ id });

    if (!appointment) {
      throw new NotFoundException(`Cita con ID "${id}" no encontrada`);
    }

    // Control de acceso: usuarios normales solo pueden ver sus propias citas
    if (!user.roles.includes(ValidRoles.admin) && appointment.customer.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para ver esta cita');
    }

    return appointment;
  }

  /**
   * Actualiza una cita existente
   * Control de acceso:
   * - Usuarios normales solo pueden actualizar sus propias citas y no pueden cambiar el estado
   * - Administradores pueden actualizar cualquier cita y cambiar el estado
   *
   * @param id - ID de la cita a actualizar
   * @param updateAppointmentDto - Nuevos datos de la cita
   * @param user - Usuario que realiza la actualización
   * @returns La cita actualizada con pet y service poblados
   */
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, user: User): Promise<Appointment> {
    // Busca la cita y valida permisos
    const appointment = await this.findOne(id, user);

    const { serviceId, petId, date, status, ...appointmentData } = updateAppointmentDto;

    // Control de acceso: usuarios normales no pueden cambiar el estado
    if (status && !user.roles.includes(ValidRoles.admin)) {
      throw new ForbiddenException('Solo los administradores pueden cambiar el estado de la cita');
    }

    // Control de acceso: usuarios normales solo pueden actualizar sus propias citas
    if (!user.roles.includes(ValidRoles.admin) && appointment.customer.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para actualizar esta cita');
    }

    try {
      // Actualiza la mascota si se proporciona una nueva (validando ownership)
      if (petId) {
        const pet = await this.petRepository.findOne({
          where: {
            id: petId,
            owner: { id: user.id },
            isActive: true
          },
        });

        if (!pet) {
          throw new NotFoundException(
            'Mascota no encontrada o no pertenece al usuario autenticado'
          );
        }

        appointment.pet = pet;
      }

      // Actualiza el servicio si se proporciona uno nuevo
      if (serviceId) {
        const service = await this.servicesService.findOne(serviceId);
        appointment.service = service;
      }

      // Actualiza la fecha si se proporciona una nueva (y valida que sea futura)
      if (date) {
        const appointmentDate = new Date(date);
        const now = new Date();
        if (appointmentDate <= now) {
          throw new BadRequestException('La fecha de la cita debe ser futura');
        }
        appointment.date = appointmentDate;
      }

      // Actualiza el estado si se proporciona (solo admins)
      if (status) {
        appointment.status = status;
      }

      // Actualiza los demás campos
      Object.assign(appointment, appointmentData);

      await this.appointmentRepository.save(appointment);
      return appointment;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  /**
   * Elimina una cita
   * Control de acceso:
   * - Usuarios normales solo pueden eliminar sus propias citas
   * - Administradores pueden eliminar cualquier cita
   *
   * @param id - ID de la cita a eliminar
   * @param user - Usuario que realiza la eliminación
   */
  async remove(id: string, user: User): Promise<void> {
    const appointment = await this.findOne(id, user);

    // Control de acceso: usuarios normales solo pueden eliminar sus propias citas
    if (!user.roles.includes(ValidRoles.admin) && appointment.customer.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para eliminar esta cita');
    }

    await this.appointmentRepository.remove(appointment);
  }

  /**
   * Maneja errores específicos de la base de datos de forma centralizada
   * @param error - Error capturado de TypeORM
   */
  private handleDBExceptions(error: any): never {
    // Error 23505: violación de constraint único
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    // Registra el error para debugging
    this.logger.error(error);
    // Lanza error genérico para no exponer detalles internos
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  /**
   * Elimina todas las citas de la base de datos
   * Método utilitario usado principalmente en el seed para limpiar datos
   * @returns Resultado de la operación de eliminación
   */
  async deleteAllAppointments() {
    const query = this.appointmentRepository.createQueryBuilder('appointment');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
