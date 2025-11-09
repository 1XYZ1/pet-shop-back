import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

/**
 * Helper centralizado para manejo de errores de base de datos TypeORM
 *
 * Propósito:
 * - Consolidar el manejo de errores de DB repetido en múltiples servicios
 * - Proporcionar mensajes de error consistentes
 * - Evitar exposición de detalles internos del sistema
 * - Facilitar el logging centralizado
 *
 * Uso en servicios:
 * ```typescript
 * try {
 *   await this.repository.save(entity);
 * } catch (error) {
 *   handleDatabaseException(error, this.logger);
 * }
 * ```
 */

/**
 * Maneja excepciones de base de datos de forma centralizada
 *
 * @param error - Error capturado de TypeORM
 * @param logger - Logger del servicio que invoca (para mantener trazabilidad)
 * @param customMessages - Mensajes personalizados para códigos de error específicos
 *
 * @throws BadRequestException - Para errores manejables por el usuario (constraints, validaciones)
 * @throws InternalServerErrorException - Para errores inesperados del sistema
 *
 * Códigos de error PostgreSQL manejados:
 * - 23505: Violación de constraint UNIQUE (ej: email duplicado, microchip duplicado)
 * - 23503: Violación de FOREIGN KEY (referencia inválida)
 * - 23502: Violación de NOT NULL (campo requerido faltante)
 * - 23514: Violación de CHECK constraint
 */
export function handleDatabaseException(
  error: any,
  logger: Logger,
  customMessages?: {
    uniqueViolation?: string;
    foreignKeyViolation?: string;
    notNullViolation?: string;
    checkViolation?: string;
  },
): never {
  // Error 23505: Violación de constraint único (UNIQUE)
  // Ejemplo: intentar crear un producto con título duplicado
  if (error.code === '23505') {
    const message =
      customMessages?.uniqueViolation ||
      error.detail ||
      'Ya existe un registro con estos datos';
    throw new BadRequestException(message);
  }

  // Error 23503: Violación de foreign key (FOREIGN KEY)
  // Ejemplo: intentar crear un registro con referencia a entidad inexistente
  if (error.code === '23503') {
    const message =
      customMessages?.foreignKeyViolation ||
      'Referencia inválida a otro registro';
    throw new BadRequestException(message);
  }

  // Error 23502: Violación de NOT NULL
  // Ejemplo: intentar insertar NULL en columna requerida
  if (error.code === '23502') {
    const message =
      customMessages?.notNullViolation ||
      error.detail ||
      'Falta un campo requerido';
    throw new BadRequestException(message);
  }

  // Error 23514: Violación de CHECK constraint
  // Ejemplo: valor fuera del rango permitido
  if (error.code === '23514') {
    const message =
      customMessages?.checkViolation ||
      error.detail ||
      'Valor no válido para este campo';
    throw new BadRequestException(message);
  }

  // Loggear error completo para debugging (sin exponer al cliente)
  logger.error('Database exception:', error);

  // Error genérico para cualquier otro caso
  throw new InternalServerErrorException(
    'Error inesperado, revise los logs del servidor',
  );
}

/**
 * Wrapper simplificado para servicios que no necesitan mensajes personalizados
 *
 * @param error - Error capturado
 * @param serviceName - Nombre del servicio (para logging)
 *
 * Ejemplo de uso:
 * ```typescript
 * catch (error) {
 *   handleDBException(error, 'ProductsService');
 * }
 * ```
 */
export function handleDBException(error: any, serviceName: string): never {
  const logger = new Logger(serviceName);
  return handleDatabaseException(error, logger);
}
