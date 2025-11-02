import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';
import { ProductSpecies, ProductType } from '../../common/enums';

/**
 * Entidad Product con índices optimizados para consultas frecuentes
 * Índices agregados:
 * - type: Para filtros por tipo de producto (alimento, accesorio, juguete, etc.)
 * - species: Para filtros por especie (gatos/perros)
 * - [type, species]: Índice compuesto para consultas que filtran por ambos
 * - [type, price]: Índice compuesto para consultas de tipo con ordenamiento por precio
 */
@Entity({ name: 'products' })
@Index(['type']) // Índice para búsquedas por tipo de producto
@Index(['species']) // Índice para búsquedas por especie
@Index(['type', 'species']) // Índice compuesto para consultas combinadas
@Index(['type', 'price']) // Índice compuesto para consultas de tipo con precio
export class Product {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Pet Collar Premium',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Anim reprehenderit nulla in anim mollit minim irure commodo.',
    description: 'Product description',
    default: null,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 'pet_collar_premium',
    description: 'Product SLUG - for SEO',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['M', 'XL', 'XXL'],
    description: 'Product sizes',
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    description: 'Product type (food, accessories, toys, hygiene, etc.)',
    enum: ProductType,
    example: ProductType.ALIMENTO_SECO,
  })
  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @ApiProperty({
    description: 'Pet species this product is for (optional - some products are universal)',
    enum: ProductSpecies,
    example: ProductSpecies.DOGS,
    required: false,
  })
  @Column({
    type: 'enum',
    enum: ProductSpecies,
    nullable: true,
  })
  species?: ProductSpecies;

  @ApiProperty()
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  // images
  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product)
  @Exclude()
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
