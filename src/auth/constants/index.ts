/**
 * Barrel export para constantes del módulo Auth
 *
 * Este archivo centraliza las exportaciones de todas las constantes
 * relacionadas con autenticación, facilitando imports más limpios:
 *
 * @example
 * // En lugar de:
 * import { PASSWORD_REGEX } from './constants/password-validation.constants';
 *
 * // Puedes usar:
 * import { PASSWORD_REGEX } from './constants';
 */

export {
  PASSWORD_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_VALIDATION_MESSAGE,
} from './password-validation.constants';
