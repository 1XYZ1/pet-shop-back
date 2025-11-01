import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('cart_items')
@Index(['cartId', 'productId', 'size'], { unique: true })
export class CartItem {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Cart Item ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'cart-uuid-here',
    description: 'Cart ID',
  })
  @Column('uuid')
  cartId: string;

  @ApiProperty({
    example: 'product-uuid-here',
    description: 'Product ID',
  })
  @Column('uuid')
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of this item',
  })
  @Column('int')
  quantity: number;

  @ApiProperty({
    example: 'XL',
    description: 'Selected size',
  })
  @Column('text')
  size: string;

  @ApiProperty({
    example: 29.99,
    description: 'Price at the time item was added to cart',
  })
  @Column('float')
  priceAtTime: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ApiProperty({
    description: 'Product details',
    type: () => Product,
  })
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
