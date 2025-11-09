import { ForbiddenException } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';

/**
 * Helper centralizado para validación de ownership (propiedad de recursos)
 *
 * Propósito:
 * - Consolidar lógica de validación de acceso repetida en múltiples servicios
 * - Implementar control de acceso basado en roles (RBAC) consistente
 * - Prevenir acceso no autorizado a recursos de otros usuarios
 * - Mantener principio DRY (Don't Repeat Yourself)
 *
 * Regla de negocio:
 * - Los usuarios regulares solo pueden acceder a sus propios recursos
 * - Los administradores tienen acceso completo a todos los recursos
 * - Los super-users tienen acceso total al sistema
 *
 * Servicios que usan esta validación:
 * - PetsService: validar acceso a mascotas
 * - MedicalRecordsService: validar acceso a registros médicos vía mascota
 * - GroomingRecordsService: validar acceso a registros de grooming vía mascota
 * - AppointmentsService: validar acceso a citas
 */

/**
 * Valida que el usuario tenga permiso para acceder a una mascota específica
 *
 * @param pet - Mascota a la que se intenta acceder
 * @param user - Usuario que intenta acceder
 * @param customErrorMessage - Mensaje de error personalizado (opcional)
 *
 * @throws ForbiddenException si el usuario no es owner ni admin
 *
 * Casos de acceso permitido:
 * 1. Usuario es el owner de la mascota (pet.owner.id === user.id)
 * 2. Usuario tiene rol 'admin' o 'super-user'
 *
 * Ejemplo de uso:
 * ```typescript
 * const pet = await this.petRepository.findOne({ where: { id: petId } });
 * validatePetOwnership(pet, user);
 * // Si no lanza excepción, el acceso está permitido
 * ```
 */
export function validatePetOwnership(
  pet: Pet,
  user: User,
  customErrorMessage?: string,
): void {
  // Verifica si el usuario es el dueño de la mascota
  const isOwner = pet.owner.id === user.id;

  // Verifica si el usuario tiene rol de administrador
  const isAdmin =
    user.roles.includes('admin') || user.roles.includes('super-user');

  // Si no es owner ni admin, acceso denegado
  if (!isOwner && !isAdmin) {
    throw new ForbiddenException(
      customErrorMessage || 'No tienes permiso para acceder a esta mascota',
    );
  }

  // Si llegamos aquí, el acceso está permitido
}

/**
 * Valida que un usuario tenga permiso para acceder a un recurso de otro usuario
 *
 * @param resourceOwnerId - ID del usuario dueño del recurso
 * @param requestingUser - Usuario que intenta acceder
 * @param resourceType - Tipo de recurso (para mensaje de error descriptivo)
 *
 * @throws ForbiddenException si el usuario no es owner ni admin
 *
 * Uso genérico para recursos que no son mascotas (ej: carritos, órdenes)
 *
 * Ejemplo de uso:
 * ```typescript
 * const cart = await this.cartRepository.findOne({ where: { id } });
 * validateResourceOwnership(cart.userId, user, 'carrito');
 * ```
 */
export function validateResourceOwnership(
  resourceOwnerId: string,
  requestingUser: User,
  resourceType: string = 'recurso',
): void {
  // Verifica si el usuario es el dueño del recurso
  const isOwner = resourceOwnerId === requestingUser.id;

  // Verifica si el usuario tiene rol de administrador
  const isAdmin =
    requestingUser.roles.includes('admin') ||
    requestingUser.roles.includes('super-user');

  // Si no es owner ni admin, acceso denegado
  if (!isOwner && !isAdmin) {
    throw new ForbiddenException(
      `No tienes permiso para acceder a este ${resourceType}`,
    );
  }
}

/**
 * Verifica si un usuario tiene rol de administrador
 *
 * @param user - Usuario a verificar
 * @returns true si es admin o super-user, false en caso contrario
 *
 * Uso común en queries condicionales:
 * ```typescript
 * const isAdmin = isUserAdmin(user);
 * if (!isAdmin) {
 *   queryBuilder.andWhere('resource.userId = :userId', { userId: user.id });
 * }
 * ```
 */
export function isUserAdmin(user: User): boolean {
  return user.roles.includes('admin') || user.roles.includes('super-user');
}

/**
 * Valida que un usuario tenga roles específicos requeridos
 *
 * @param user - Usuario a validar
 * @param requiredRoles - Roles requeridos (debe tener al menos uno)
 * @param customErrorMessage - Mensaje de error personalizado
 *
 * @throws ForbiddenException si el usuario no tiene ninguno de los roles requeridos
 *
 * Ejemplo de uso:
 * ```typescript
 * // Solo veterinarios o admins pueden crear registros médicos
 * validateUserRoles(user, ['veterinarian', 'admin'], 'Solo veterinarios pueden crear registros médicos');
 * ```
 */
export function validateUserRoles(
  user: User,
  requiredRoles: string[],
  customErrorMessage?: string,
): void {
  // Verifica si el usuario tiene al menos uno de los roles requeridos
  const hasRequiredRole = requiredRoles.some((role) =>
    user.roles.includes(role),
  );

  if (!hasRequiredRole) {
    throw new ForbiddenException(
      customErrorMessage ||
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
    );
  }
}
