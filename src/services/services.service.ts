import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateServiceDto, UpdateServiceDto } from './dto';
import { Service } from './entities';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { handleDatabaseException } from '../common/helpers';

/**
 * Servicio principal para manejar todas las operaciones CRUD de servicios
 * Incluye funcionalidades de búsqueda, paginación y manejo de errores
 */
@Injectable()
export class ServicesService {
  // Logger específico para este servicio
  private readonly logger = new Logger('ServicesService');

  constructor(
    // Inyección del repositorio de servicios
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  /**
   * Crea un nuevo servicio
   * @param createServiceDto - Datos del servicio a crear
   * @param user - Usuario que está creando el servicio (para auditoría)
   * @returns El servicio creado
   */
  async create(createServiceDto: CreateServiceDto, user: User): Promise<Service> {
    try {
      // Crea la instancia del servicio en memoria
      const service = this.serviceRepository.create({
        ...createServiceDto,
        user,
      });

      // Guarda el servicio en la base de datos
      await this.serviceRepository.save(service);

      return service;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtiene una lista paginada de servicios
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @returns Objeto con servicios, total de registros y número de páginas
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    // Consulta principal con paginación
    const [services, total] = await this.serviceRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        createdAt: 'DESC', // Ordena por fecha de creación descendente (más recientes primero)
      },
      where: {
        isActive: true, // Solo muestra servicios activos por defecto
      },
    });

    return {
      services,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene todos los servicios sin paginación (incluye inactivos)
   * Útil para el panel de administración
   * @returns Array con todos los servicios
   */
  async findAllAdmin(): Promise<Service[]> {
    return await this.serviceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Busca un servicio específico por ID o nombre
   * @param term - Puede ser UUID o nombre del servicio
   * @returns El servicio encontrado
   */
  async findOne(term: string): Promise<Service> {
    let service: Service;

    // Estrategia 1: Si es UUID, búsqueda directa por ID
    if (isUUID(term)) {
      service = await this.serviceRepository.findOneBy({ id: term });
    } else {
      // Estrategia 2: Búsqueda por nombre (case-insensitive)
      service = await this.serviceRepository
        .createQueryBuilder('service')
        .where('LOWER(service.name) = LOWER(:name)', { name: term })
        .getOne();
    }

    if (!service) {
      throw new NotFoundException(`Service with term "${term}" not found`);
    }

    return service;
  }

  /**
   * Actualiza un servicio existente
   * @param id - ID del servicio a actualizar
   * @param updateServiceDto - Nuevos datos del servicio
   * @param user - Usuario que realiza la actualización
   * @returns El servicio actualizado
   */
  async update(id: string, updateServiceDto: UpdateServiceDto, user: User): Promise<Service> {
    // preload: busca el servicio por ID y aplica los cambios sin guardar aún
    const service = await this.serviceRepository.preload({
      id,
      ...updateServiceDto,
    });

    if (!service) {
      throw new NotFoundException(`Service with id "${id}" not found`);
    }

    try {
      // Actualiza el usuario que modificó el servicio (para auditoría)
      service.user = user;
      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Elimina un servicio de la base de datos
   * NOTA: Considera implementar soft delete si hay appointments relacionados
   * @param id - ID del servicio a eliminar
   */
  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }

  /**
   * Maneja errores específicos de la base de datos de forma centralizada
   * Utiliza helper compartido para consistencia
   * @param error - Error capturado de TypeORM
   */
  private handleDBExceptions(error: any): never {
    handleDatabaseException(error, this.logger);
  }

  /**
   * Elimina todos los servicios de la base de datos
   * Método utilitario usado principalmente en el seed para limpiar datos
   * @returns Resultado de la operación de eliminación
   */
  async deleteAllServices() {
    const query = this.serviceRepository.createQueryBuilder('service');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
