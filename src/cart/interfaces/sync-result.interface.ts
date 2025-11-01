import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { Cart } from '../entities/cart.entity';

/**
 * Interface que representa el resultado de una operación de sincronización de carrito
 *
 * Cuando un usuario invitado inicia sesión, sus items del localStorage se sincronizan
 * con su carrito en la base de datos. Esta interface proporciona información detallada
 * sobre el resultado de la sincronización.
 */
export interface SyncResult {
  /**
   * Número total de items sincronizados exitosamente
   * Items que se agregaron o actualizaron correctamente en el carrito del usuario
   */
  synced: number;

  /**
   * Array de items que fallaron durante la sincronización
   * Cada entrada contiene el item original y la razón del fallo (ej: producto no existe, sin stock)
   */
  failed: Array<{
    item: AddCartItemDto;
    reason: string;
  }>;

  /**
   * El carrito actualizado del usuario después de la sincronización
   * Incluye todos los items existentes más los items sincronizados exitosamente
   */
  cart: Cart;
}
