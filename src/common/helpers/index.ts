/**
 * Barrel export for common helpers
 *
 * Centraliza las exportaciones de todos los helpers compartidos
 * para facilitar imports en servicios
 *
 * Uso en servicios:
 * ```typescript
 * import {
 *   handleDatabaseException,
 *   validatePetOwnership,
 *   applyPagination,
 *   validateUUID
 * } from '../../common/helpers';
 * ```
 */

// Database exception handling
export * from './database-exception.helper';

// Ownership validation
export * from './ownership-validation.helper';

// Query builder utilities
export * from './query-builder.helper';

// General validation utilities
export * from './validation.helper';
