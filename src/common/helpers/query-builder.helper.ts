import { SelectQueryBuilder } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { isUserAdmin } from './ownership-validation.helper';

/**
 * Helper centralizado para construcción de queries comunes con TypeORM
 *
 * Propósito:
 * - Consolidar patrones repetitivos de QueryBuilder
 * - Simplificar queries con filtros de ownership
 * - Estandarizar paginación en toda la aplicación
 * - Reducir duplicación de código en servicios
 *
 * Beneficios:
 * - Queries más legibles y mantenibles
 * - Lógica de ownership centralizada
 * - Facilita cambios futuros en estrategia de paginación
 * - Reduce errores por inconsistencias
 */

/**
 * Interfaz para parámetros de paginación estándar
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Interfaz para resultado de query paginado
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  pages: number;
}

/**
 * Aplica paginación a un QueryBuilder y ejecuta la consulta
 *
 * @param queryBuilder - QueryBuilder de TypeORM
 * @param params - Parámetros de paginación (limit y offset)
 * @returns Resultado paginado con metadata
 *
 * Comportamiento:
 * - Valores por defecto: limit=10, offset=0
 * - Usa getManyAndCount() para obtener datos y conteo en una sola query
 * - Calcula automáticamente el número de páginas
 *
 * Ejemplo de uso:
 * ```typescript
 * const queryBuilder = this.repository.createQueryBuilder('entity');
 * const result = await applyPagination(queryBuilder, { limit: 20, offset: 0 });
 * return result; // { data: [...], total: 100, limit: 20, offset: 0, pages: 5 }
 * ```
 */
export async function applyPagination<T>(
  queryBuilder: SelectQueryBuilder<T>,
  params: PaginationParams = {},
): Promise<PaginatedResult<T>> {
  // Valores por defecto para paginación
  const limit = params.limit ?? 10;
  const offset = params.offset ?? 0;

  // Aplica paginación al query
  queryBuilder.skip(offset).take(limit);

  // Ejecuta query y obtiene conteo total en una sola operación
  const [data, total] = await queryBuilder.getManyAndCount();

  // Calcula número de páginas (redondeado hacia arriba)
  const pages = Math.ceil(total / limit);

  return {
    data,
    total,
    limit,
    offset,
    pages,
  };
}

/**
 * Aplica filtro de ownership a un QueryBuilder basado en el usuario
 *
 * @param queryBuilder - QueryBuilder a modificar
 * @param user - Usuario que realiza la consulta
 * @param ownerJoinAlias - Alias de la relación con el owner (ej: 'owner', 'customer')
 * @param entityAlias - Alias de la entidad principal en el query (ej: 'pet', 'appointment')
 *
 * Comportamiento:
 * - Si el usuario es admin: no aplica filtro (ve todos los registros)
 * - Si el usuario es regular: filtra por ownership (owner.id = user.id)
 *
 * Ejemplo de uso:
 * ```typescript
 * const queryBuilder = this.repository
 *   .createQueryBuilder('pet')
 *   .leftJoinAndSelect('pet.owner', 'owner');
 *
 * applyOwnershipFilter(queryBuilder, user, 'owner', 'pet');
 * // Si no es admin, agrega: WHERE owner.id = :userId
 * ```
 */
export function applyOwnershipFilter<T>(
  queryBuilder: SelectQueryBuilder<T>,
  user: User,
  ownerJoinAlias: string = 'owner',
  entityAlias?: string,
): SelectQueryBuilder<T> {
  // Si es admin, no aplicar filtro (acceso completo)
  if (isUserAdmin(user)) {
    return queryBuilder;
  }

  // Construir condición WHERE para filtrar por ownership
  const condition = `${ownerJoinAlias}.id = :userId`;

  // Aplicar filtro con andWhere para no sobrescribir filtros previos
  return queryBuilder.andWhere(condition, { userId: user.id });
}

/**
 * Aplica filtro de rango de fechas a un QueryBuilder
 *
 * @param queryBuilder - QueryBuilder a modificar
 * @param fieldName - Nombre del campo de fecha (ej: 'entity.createdAt', 'appointment.date')
 * @param dateFrom - Fecha inicial del rango (opcional)
 * @param dateTo - Fecha final del rango (opcional)
 *
 * Comportamiento:
 * - Si solo dateFrom: filtra registros >= dateFrom
 * - Si solo dateTo: filtra registros <= dateTo
 * - Si ambos: filtra registros BETWEEN dateFrom AND dateTo
 * - Si ninguno: no aplica filtro
 *
 * Ejemplo de uso:
 * ```typescript
 * const queryBuilder = this.repository.createQueryBuilder('appointment');
 * applyDateRangeFilter(queryBuilder, 'appointment.date', '2024-01-01', '2024-12-31');
 * // WHERE appointment.date BETWEEN :dateFrom AND :dateTo
 * ```
 */
export function applyDateRangeFilter<T>(
  queryBuilder: SelectQueryBuilder<T>,
  fieldName: string,
  dateFrom?: string | Date,
  dateTo?: string | Date,
): SelectQueryBuilder<T> {
  // Si se proporcionan ambas fechas, usar BETWEEN
  if (dateFrom && dateTo) {
    queryBuilder.andWhere(`${fieldName} BETWEEN :dateFrom AND :dateTo`, {
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
    });
  }
  // Si solo fecha inicial, filtrar >= dateFrom
  else if (dateFrom) {
    queryBuilder.andWhere(`${fieldName} >= :dateFrom`, {
      dateFrom: new Date(dateFrom),
    });
  }
  // Si solo fecha final, filtrar <= dateTo
  else if (dateTo) {
    queryBuilder.andWhere(`${fieldName} <= :dateTo`, {
      dateTo: new Date(dateTo),
    });
  }

  return queryBuilder;
}

/**
 * Aplica búsqueda por texto en múltiples campos (LIKE case-insensitive)
 *
 * @param queryBuilder - QueryBuilder a modificar
 * @param searchTerm - Término de búsqueda
 * @param fields - Array de campos donde buscar (ej: ['entity.title', 'entity.description'])
 *
 * Comportamiento:
 * - Usa LOWER() para búsqueda case-insensitive
 * - Agrega % al inicio y final para coincidencias parciales
 * - Combina campos con OR (busca en cualquiera de los campos)
 *
 * Ejemplo de uso:
 * ```typescript
 * const queryBuilder = this.repository.createQueryBuilder('product');
 * applySearchFilter(queryBuilder, 'comida', ['product.title', 'product.description']);
 * // WHERE (LOWER(product.title) LIKE '%comida%' OR LOWER(product.description) LIKE '%comida%')
 * ```
 */
export function applySearchFilter<T>(
  queryBuilder: SelectQueryBuilder<T>,
  searchTerm: string | undefined,
  fields: string[],
): SelectQueryBuilder<T> {
  // Si no hay término de búsqueda, no aplicar filtro
  if (!searchTerm || searchTerm.trim() === '') {
    return queryBuilder;
  }

  // Construir condiciones OR para cada campo
  const conditions = fields
    .map((field) => `LOWER(${field}) LIKE LOWER(:searchTerm)`)
    .join(' OR ');

  // Aplicar filtro con paréntesis para agrupar condiciones OR
  return queryBuilder.andWhere(`(${conditions})`, {
    searchTerm: `%${searchTerm}%`,
  });
}

/**
 * Aplica ordenamiento estándar a un QueryBuilder
 *
 * @param queryBuilder - QueryBuilder a modificar
 * @param orderBy - Campo por el cual ordenar (ej: 'entity.createdAt')
 * @param order - Dirección del ordenamiento ('ASC' o 'DESC')
 *
 * Ejemplo de uso:
 * ```typescript
 * const queryBuilder = this.repository.createQueryBuilder('pet');
 * applySorting(queryBuilder, 'pet.createdAt', 'DESC');
 * // ORDER BY pet.createdAt DESC
 * ```
 */
export function applySorting<T>(
  queryBuilder: SelectQueryBuilder<T>,
  orderBy: string,
  order: 'ASC' | 'DESC' = 'DESC',
): SelectQueryBuilder<T> {
  return queryBuilder.orderBy(orderBy, order);
}

/**
 * Ejecuta query con paginación y retorna formato estandarizado
 *
 * @param queryBuilder - QueryBuilder configurado
 * @param limit - Límite de registros por página
 * @param offset - Número de registros a saltar
 * @returns Resultado paginado con formato estándar
 *
 * Formato de respuesta unificado:
 * ```typescript
 * {
 *   data: [...],      // Array de resultados
 *   total: 100,       // Total de registros que cumplen los filtros
 *   limit: 10,        // Límite aplicado
 *   offset: 0,        // Offset aplicado
 *   pages: 10         // Total de páginas disponibles
 * }
 * ```
 *
 * Ejemplo de uso:
 * ```typescript
 * const queryBuilder = this.repository
 *   .createQueryBuilder('product')
 *   .where('product.isActive = :isActive', { isActive: true });
 *
 * return await executePaginatedQuery(queryBuilder, 20, 0);
 * ```
 */
export async function executePaginatedQuery<T>(
  queryBuilder: SelectQueryBuilder<T>,
  limit: number = 10,
  offset: number = 0,
): Promise<PaginatedResult<T>> {
  return applyPagination(queryBuilder, { limit, offset });
}
