import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Cart ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'user-uuid-here',
    description: 'User ID who owns this cart',
  })
  @Column('uuid')
  @Index({ unique: true })
  userId: string;

  @ApiProperty({
    description: 'Cart items',
    type: () => CartItem,
    isArray: true,
  })
  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  @ApiProperty({
    example: 199.99,
    description: 'Subtotal before tax',
  })
  @Column('float', { default: 0 })
  subtotal: number;

  @ApiProperty({
    example: 31.99,
    description: 'Tax amount (16%)',
  })
  @Column('float', { default: 0 })
  tax: number;

  @ApiProperty({
    example: 231.98,
    description: 'Total amount (subtotal + tax)',
  })
  @Column('float', { default: 0 })
  total: number;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
