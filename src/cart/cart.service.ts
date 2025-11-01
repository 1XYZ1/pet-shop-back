import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { SyncResult } from './interfaces/sync-result.interface';

/**
 * Service for managing shopping cart operations
 * Handles cart creation, item management, and total calculations
 */
@Injectable()
export class CartService {
  private readonly logger = new Logger('CartService');

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    // Inject ProductsService to validate products
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Get user's cart or create if doesn't exist
   * @param userId - Authenticated user's ID
   * @returns User's cart with all items
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    try {
      let cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        cart = this.cartRepository.create({
          userId,
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
        });
        await this.cartRepository.save(cart);
      }

      // Recalculate totals to ensure accuracy
      this.calculateTotals(cart);
      return await this.cartRepository.save(cart);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Add item to cart or update quantity if already exists
   * @param userId - Authenticated user's ID
   * @param dto - Product details to add
   * @returns Updated cart
   */
  async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    try {
      // 1. Get or create cart
      const cart = await this.getOrCreateCart(userId);

      // 2. Validate product exists and get real data
      const product = await this.productsService.findOne(dto.productId);

      // 3. Validate size is available for this product
      if (!product.sizes.includes(dto.size)) {
        throw new BadRequestException(
          `Size '${dto.size}' is not available for this product. Available sizes: ${product.sizes.join(', ')}`,
        );
      }

      // 4. Validate stock availability
      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${dto.quantity}`,
        );
      }

      // 5. Check if item already exists in cart (same product + size)
      const existingItem = cart.items.find(
        (item) => item.productId === dto.productId && item.size === dto.size,
      );

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + dto.quantity;

        // Validate total quantity doesn't exceed stock
        if (product.stock < newQuantity) {
          throw new BadRequestException(
            `Cannot add ${dto.quantity} more. You already have ${existingItem.quantity} in cart. Stock available: ${product.stock}`,
          );
        }

        existingItem.quantity = newQuantity;
        await this.cartItemRepository.save(existingItem);
      } else {
        // Create new cart item
        const newItem = this.cartItemRepository.create({
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
          size: dto.size,
          priceAtTime: product.price,
        });

        await this.cartItemRepository.save(newItem);
      }

      // 6. Return updated cart
      return await this.getOrCreateCart(userId);
    } catch (error) {
      // Re-throw known exceptions, handle unknown ones
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  /**
   * Update quantity of a cart item
   * @param userId - Authenticated user's ID
   * @param itemId - Cart item ID to update
   * @param dto - New quantity
   * @returns Updated cart
   */
  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    try {
      // 1. Get user's cart
      const cart = await this.getOrCreateCart(userId);

      // 2. Find the item in user's cart
      const item = cart.items.find((i) => i.id === itemId);

      if (!item) {
        throw new NotFoundException(
          `Cart item with ID '${itemId}' not found in your cart`,
        );
      }

      // 3. Validate stock for new quantity
      const product = await this.productsService.findOne(item.productId);

      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${dto.quantity}`,
        );
      }

      // 4. Update quantity
      item.quantity = dto.quantity;
      await this.cartItemRepository.save(item);

      // 5. Return updated cart
      return await this.getOrCreateCart(userId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  /**
   * Remove item from cart
   * @param userId - Authenticated user's ID
   * @param itemId - Cart item ID to remove
   * @returns Updated cart
   */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    try {
      // 1. Get user's cart
      const cart = await this.getOrCreateCart(userId);

      // 2. Find the item in user's cart (ownership validation)
      const item = cart.items.find((i) => i.id === itemId);

      if (!item) {
        throw new NotFoundException(
          `Cart item with ID '${itemId}' not found in your cart`,
        );
      }

      // 3. Delete the item
      await this.cartItemRepository.delete(itemId);

      // 4. Return updated cart
      return await this.getOrCreateCart(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  /**
   * Clear all items from user's cart
   * @param userId - Authenticated user's ID
   * @returns Empty cart
   */
  async clearCart(userId: string): Promise<Cart> {
    try {
      const cart = await this.getOrCreateCart(userId);

      if (cart.items.length > 0) {
        await this.cartItemRepository.delete({ cartId: cart.id });
      }

      return await this.getOrCreateCart(userId);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Sync guest cart items with authenticated user's cart
   * Processes each item individually and continues on failures
   * @param userId - Authenticated user's ID
   * @param items - Array of items from guest cart
   * @returns Sync result with success/failure details
   */
  async syncGuestCart(
    userId: string,
    items: AddCartItemDto[],
  ): Promise<SyncResult> {
    // Validar límite de items para prevenir DoS
    if (items.length > 50) {
      throw new BadRequestException(
        'Cannot sync more than 50 items at once. Please reduce the number of items.',
      );
    }

    const syncResult: SyncResult = {
      synced: 0,
      failed: [],
      cart: null,
    };

    this.logger.log(
      `Starting cart sync for user ${userId} with ${items.length} items`,
    );

    // Procesar cada item individualmente
    for (const item of items) {
      try {
        // Reutilizar método addItem existente con sus validaciones
        await this.addItem(userId, item);
        syncResult.synced++;

        this.logger.log(
          `Item synced successfully: Product ${item.productId}, Size ${item.size}, Qty ${item.quantity}`,
        );
      } catch (error) {
        // Capturar errores sin detener el proceso
        let reason = 'Unknown error occurred';

        if (error instanceof NotFoundException) {
          reason = `Product not found`;
        } else if (error instanceof BadRequestException) {
          reason = error.message;
        } else {
          this.logger.error(
            `Unexpected error syncing item ${item.productId}:`,
            error,
          );
        }

        syncResult.failed.push({
          item,
          reason,
        });

        this.logger.warn(
          `Failed to sync item: Product ${item.productId}, Reason: ${reason}`,
        );
      }
    }

    // Obtener el carrito actualizado con todos los items
    syncResult.cart = await this.getOrCreateCart(userId);

    this.logger.log(
      `Sync completed for user ${userId}: ${syncResult.synced} synced, ${syncResult.failed.length} failed`,
    );

    return syncResult;
  }

  /**
   * Calculate cart totals (subtotal, tax, total)
   * @param cart - Cart to calculate totals for
   * @private
   */
  private calculateTotals(cart: Cart): void {
    const subtotal = cart.items.reduce((sum, item) => {
      const itemTotal = Number(item.priceAtTime) * item.quantity;
      return sum + itemTotal;
    }, 0);

    cart.subtotal = Number(subtotal.toFixed(2));
    cart.tax = Number((subtotal * 0.16).toFixed(2)); // 16% tax
    cart.total = Number((cart.subtotal + cart.tax).toFixed(2));
  }

  /**
   * Handle database exceptions consistently
   * @param error - Error from database operation
   * @private
   */
  private handleDBExceptions(error: any): never {
    // Unique constraint violation (duplicate cart item)
    if (error.code === '23505') {
      throw new BadRequestException(
        'This item with the same size already exists in your cart',
      );
    }

    // Foreign key violation
    if (error.code === '23503') {
      throw new BadRequestException('Invalid product or cart reference');
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error occurred. Please try again later.',
    );
  }
}
