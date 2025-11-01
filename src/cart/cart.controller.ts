import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto, SyncCartDto } from './dto';
import { Cart } from './entities/cart.entity';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: Cart,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCart(@GetUser() user: User) {
    return this.cartService.getOrCreateCart(user.id);
  }

  @Post('items')
  @Auth()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or insufficient stock',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  addItem(@GetUser() user: User, @Body() addCartItemDto: AddCartItemDto) {
    return this.cartService.addItem(user.id, addCartItemDto);
  }

  @Patch('items/:itemId')
  @Auth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Item quantity updated successfully',
    type: Cart,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  updateItem(
    @GetUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @Auth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
    type: Cart,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  removeItem(
    @GetUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  @Auth()
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
    type: Cart,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  clearCart(@GetUser() user: User) {
    return this.cartService.clearCart(user.id);
  }

  @Post('sync')
  @Auth()
  @ApiOperation({
    summary: 'Sync guest cart with authenticated user cart',
    description:
      "Synchronizes items from a guest cart (localStorage) with the authenticated user's cart. Processes each item individually and returns a detailed sync result.",
  })
  @ApiResponse({
    status: 200,
    description:
      'Synchronization completed. Check response for individual item results.',
    schema: {
      type: 'object',
      properties: {
        synced: {
          type: 'number',
          example: 3,
          description: 'Number of items successfully synced',
        },
        failed: {
          type: 'array',
          description: 'Array of failed items with reasons',
          items: {
            type: 'object',
            properties: {
              item: {
                type: 'object',
                description: 'The item that failed to sync',
              },
              reason: {
                type: 'string',
                description: 'Reason for sync failure',
              },
            },
          },
        },
        cart: {
          type: 'object',
          description: 'Updated cart after synchronization',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or exceeds item limit (50)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User must be authenticated',
  })
  syncCart(@GetUser() user: User, @Body() syncCartDto: SyncCartDto) {
    return this.cartService.syncGuestCart(user.id, syncCartDto.items);
  }
}
