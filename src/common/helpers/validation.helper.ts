import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validate as isUUID } from 'uuid';
import { Repository } from 'typeorm';

/**
 * Helper centralizado para validaciones comunes
 *
 * Propósito:
 * - Consolidar validaciones repetitivas a lo largo de la aplicación
 * - Proporcionar mensajes de error consistentes
 * - Simplificar código de servicios eliminando validaciones inline
 * - Facilitar testing al centralizar lógica de validación
 *
 * Validaciones comunes:
 * - Formato de UUID
 * - Existencia de entidades
 * - Validación de fechas
 * - Normalización de strings (email, texto)
 */

/**
 * Valida que un string sea un UUID válido
 *
 * @param id - String a validar
 * @param fieldName - Nombre del campo (para mensaje de error descriptivo)
 *
 * @throws BadRequestException si el ID no es un UUID válido
 *
 * Ejemplo de uso:
 * ```typescript
 * validateUUID(petId, 'petId');
 * // Lanza excepción: "petId no es un UUID válido"
 * ```
 */
export function validateUUID(id: string, fieldName: string = 'ID'): void {
  if (!isUUID(id)) {
    throw new BadRequestException(`${fieldName} no es un UUID válido`);
  }
}

/**
 * Busca una entidad por ID y lanza excepción si no existe
 *
 * @param repository - Repositorio de TypeORM
 * @param id - UUID de la entidad a buscar
 * @param entityName - Nombre de la entidad (para mensaje de error)
 * @param options - Opciones adicionales de búsqueda (relations, select, etc.)
 * @returns La entidad encontrada
 *
 * @throws BadRequestException si el ID no es UUID válido
 * @throws NotFoundException si la entidad no existe
 *
 * Ejemplo de uso:
 * ```typescript
 * const pet = await findEntityOrFail(
 *   this.petRepository,
 *   petId,
 *   'Mascota',
 *   { where: { isActive: true } }
 * );
 * ```
 */
export async function findEntityOrFail<T>(
  repository: Repository<T>,
  id: string,
  entityName: string,
  options?: any,
): Promise<T> {
  // Valida formato UUID
  validateUUID(id, `${entityName} ID`);

  // Busca la entidad con las opciones proporcionadas
  const entity = await repository.findOne({
    where: { id, ...options?.where },
    ...options,
  });

  // Si no existe, lanza excepción
  if (!entity) {
    throw new NotFoundException(`${entityName} con id ${id} no encontrada`);
  }

  return entity;
}

/**
 * Valida que una fecha sea futura
 *
 * @param date - Fecha a validar (string ISO o Date)
 * @param fieldName - Nombre del campo (para mensaje de error)
 *
 * @throws BadRequestException si la fecha no es futura
 *
 * Uso común: validar fechas de citas, eventos, etc.
 *
 * Ejemplo de uso:
 * ```typescript
 * validateFutureDate(appointmentDate, 'fecha de la cita');
 * // Lanza excepción: "La fecha de la cita debe ser futura"
 * ```
 */
export function validateFutureDate(
  date: string | Date,
  fieldName: string = 'fecha',
): void {
  const targetDate = new Date(date);
  const now = new Date();

  if (targetDate <= now) {
    throw new BadRequestException(`La ${fieldName} debe ser futura`);
  }
}

/**
 * Valida que una fecha no sea futura (fecha pasada o presente)
 *
 * @param date - Fecha a validar
 * @param fieldName - Nombre del campo
 *
 * @throws BadRequestException si la fecha es futura
 *
 * Uso común: validar fechas de nacimiento, registros históricos
 *
 * Ejemplo de uso:
 * ```typescript
 * validatePastOrPresentDate(birthDate, 'fecha de nacimiento');
 * ```
 */
export function validatePastOrPresentDate(
  date: string | Date,
  fieldName: string = 'fecha',
): void {
  const targetDate = new Date(date);
  const now = new Date();

  if (targetDate > now) {
    throw new BadRequestException(`La ${fieldName} no puede ser futura`);
  }
}

/**
 * Normaliza un email (lowercase y trim)
 *
 * @param email - Email a normalizar
 * @returns Email normalizado
 *
 * Previene duplicados por diferencias en mayúsculas/espacios
 *
 * Ejemplo de uso:
 * ```typescript
 * const normalizedEmail = normalizeEmail(' John@Example.COM ');
 * // Retorna: 'john@example.com'
 * ```
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normaliza texto general (trim y opcional lowercase)
 *
 * @param text - Texto a normalizar
 * @param toLowerCase - Si debe convertir a minúsculas (default: false)
 * @returns Texto normalizado
 *
 * Ejemplo de uso:
 * ```typescript
 * const name = normalizeText('  Juan Pérez  ');
 * // Retorna: 'Juan Pérez'
 *
 * const slug = normalizeText('  My Product  ', true);
 * // Retorna: 'my product'
 * ```
 */
export function normalizeText(text: string, toLowerCase: boolean = false): string {
  let normalized = text.trim();
  if (toLowerCase) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

/**
 * Genera un slug a partir de un título
 *
 * @param title - Título a convertir en slug
 * @returns Slug normalizado (lowercase, espacios reemplazados por guiones bajos)
 *
 * Uso común: generar URLs amigables, identificadores únicos
 *
 * Ejemplo de uso:
 * ```typescript
 * const slug = generateSlug('Comida para Perros Premium');
 * // Retorna: 'comida_para_perros_premium'
 * ```
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // Reemplaza espacios por guiones bajos
    .replace(/[^\w\-]+/g, '') // Elimina caracteres especiales
    .replace(/\_\_+/g, '_') // Reemplaza múltiples guiones bajos consecutivos por uno solo
    .replace(/^-+/, '') // Elimina guiones al inicio
    .replace(/-+$/, ''); // Elimina guiones al final
}

/**
 * Valida que un número esté dentro de un rango
 *
 * @param value - Valor a validar
 * @param min - Valor mínimo permitido (inclusive)
 * @param max - Valor máximo permitido (inclusive)
 * @param fieldName - Nombre del campo
 *
 * @throws BadRequestException si el valor está fuera del rango
 *
 * Ejemplo de uso:
 * ```typescript
 * validateNumberRange(price, 0, 999999, 'precio');
 * // Lanza excepción si price < 0 o price > 999999
 * ```
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'valor',
): void {
  if (value < min || value > max) {
    throw new BadRequestException(
      `${fieldName} debe estar entre ${min} y ${max}`,
    );
  }
}

/**
 * Valida que un array contenga elementos
 *
 * @param array - Array a validar
 * @param fieldName - Nombre del campo
 *
 * @throws BadRequestException si el array está vacío
 *
 * Ejemplo de uso:
 * ```typescript
 * validateArrayNotEmpty(cartItems, 'items del carrito');
 * // Lanza excepción: "items del carrito no puede estar vacío"
 * ```
 */
export function validateArrayNotEmpty<T>(
  array: T[],
  fieldName: string = 'array',
): void {
  if (!array || array.length === 0) {
    throw new BadRequestException(`${fieldName} no puede estar vacío`);
  }
}

/**
 * Valida que un array de valores estén permitidos en un enum
 *
 * @param values - Valores a validar
 * @param allowedValues - Valores permitidos (enum)
 * @param fieldName - Nombre del campo
 *
 * @throws BadRequestException si algún valor no está permitido
 *
 * Ejemplo de uso:
 * ```typescript
 * enum Status { ACTIVE = 'active', INACTIVE = 'inactive' }
 * validateEnumValues(['active', 'pending'], Object.values(Status), 'status');
 * // Lanza excepción: "Valores no permitidos en status: pending"
 * ```
 */
export function validateEnumValues<T>(
  values: T[],
  allowedValues: T[],
  fieldName: string = 'campo',
): void {
  const invalidValues = values.filter((val) => !allowedValues.includes(val));

  if (invalidValues.length > 0) {
    throw new BadRequestException(
      `Valores no permitidos en ${fieldName}: ${invalidValues.join(', ')}. ` +
        `Valores permitidos: ${allowedValues.join(', ')}`,
    );
  }
}

/**
 * Valida que un valor sea positivo (> 0)
 *
 * @param value - Valor a validar
 * @param fieldName - Nombre del campo
 *
 * @throws BadRequestException si el valor no es positivo
 *
 * Ejemplo de uso:
 * ```typescript
 * validatePositiveNumber(price, 'precio');
 * validatePositiveNumber(stock, 'stock');
 * ```
 */
export function validatePositiveNumber(
  value: number,
  fieldName: string = 'valor',
): void {
  if (value <= 0) {
    throw new BadRequestException(`${fieldName} debe ser mayor a 0`);
  }
}

/**
 * Valida que un valor no sea negativo (>= 0)
 *
 * @param value - Valor a validar
 * @param fieldName - Nombre del campo
 *
 * @throws BadRequestException si el valor es negativo
 */
export function validateNonNegativeNumber(
  value: number,
  fieldName: string = 'valor',
): void {
  if (value < 0) {
    throw new BadRequestException(`${fieldName} no puede ser negativo`);
  }
}
