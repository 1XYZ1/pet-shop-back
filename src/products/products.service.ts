import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto, UpdateProductDto, FindProductsQueryDto } from './dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';
import { User } from '../auth/entities/user.entity';

/**
 * Servicio principal para manejar todas las operaciones CRUD de productos
 * Incluye funcionalidades de búsqueda, paginación, manejo de imágenes y transacciones
 */
@Injectable()
export class ProductsService {
  // Logger específico para este servicio - ayuda a debuggear problemas
  private readonly logger = new Logger('ProductsService');

  constructor(
    // Inyección del repositorio de productos - permite hacer operaciones en la tabla 'products'
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    // Repositorio separado para imágenes - maneja la tabla 'product_images'
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    // DataSource para crear transacciones manuales cuando necesitemos operaciones atómicas
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea un nuevo producto con sus imágenes asociadas
   * @param createProductDto - Datos del producto a crear (título, precio, descripción, etc.)
   * @param user - Usuario que está creando el producto (para auditoría)
   * @returns El producto creado con sus imágenes
   */
  async create(createProductDto: CreateProductDto, user: User) {
    try {
      // Destructuring: separa las imágenes del resto de propiedades del producto
      const { images = [], ...productDetails } = createProductDto;

      // Crea la instancia del producto en memoria (aún no se guarda en DB)
      const product = this.productRepository.create({
        ...productDetails,
        // Convierte cada URL de imagen en una entidad ProductImage
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user,
      });

      // Guarda el producto y sus imágenes en la base de datos (cascade: true hace esto automático)
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      // Manejo centralizado de errores de base de datos
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtiene una lista paginada de productos con filtros opcionales
   * @param paginationDto - Parámetros de paginación (limit, offset, category)
   * @returns Objeto con productos, total de registros y número de páginas
   */
  async findAll(paginationDto: PaginationDto) {
    // Destructuring con valores por defecto para evitar errores si no se envían parámetros
    const { limit = 10, offset = 0, category } = paginationDto;

    // Consulta principal con paginación y relaciones
    const products = await this.productRepository.find({
      take: limit, // Equivale a LIMIT en SQL
      skip: offset, // Equivale a OFFSET en SQL
      relations: {
        images: true, // Incluye las imágenes relacionadas en el resultado
      },
      order: {
        id: 'ASC', // Ordena por ID ascendente
      },
      // Filtro condicional: si hay category, busca solo esa categoría
      where: category ? { category } : {},
    });

    // Cuenta total de productos (necesario para calcular páginas)
    const totalProducts = await this.productRepository.count({
      where: category ? { category } : {},
    });

    return {
      count: totalProducts,
      pages: Math.ceil(totalProducts / limit), // Calcula el número total de páginas
      products: products.map((product) => ({
        ...product,
        // Transforma los objetos ProductImage a solo strings con las URLs
        images: product.images.map((img) => img.url),
      })),
    };
  }

  /**
   * Obtiene una lista paginada de productos con filtros avanzados
   * Soporta búsqueda por texto, categoría, tallas y rango de precios
   * @param queryDto - Parámetros de filtrado y paginación avanzados
   * @returns Objeto con productos filtrados, total de registros y metadata de paginación
   */
  async findAllFiltered(queryDto: FindProductsQueryDto) {
    // Extrae los parámetros del DTO con valores por defecto
    const { limit = 10, offset = 0, q, category, sizes, minPrice, maxPrice } = queryDto;

    // Crea un QueryBuilder para construir una consulta SQL dinámica y flexible
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images') // Incluye las imágenes relacionadas
      .orderBy('product.id', 'ASC'); // Ordena por ID ascendente para resultados consistentes

    // Filtro 1: Búsqueda de texto en título y descripción (case-insensitive)
    if (q) {
      queryBuilder.andWhere(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${q}%` } // Usa % para buscar coincidencias parciales (LIKE '%term%')
      );
    }

    // Filtro 2: Categoría (cats o dogs)
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    // Filtro 3: Tallas (busca productos que tengan AL MENOS UNA de las tallas especificadas)
    if (sizes) {
      // Convierte el string "S,M,L" en array ["S", "M", "L"]
      // Convierte a mayúsculas para hacer la búsqueda case-insensitive (s -> S)
      const sizesArray = sizes.split(',').map((size) => size.trim().toUpperCase());

      // Usa el operador && de PostgreSQL para verificar si hay overlap entre arrays
      // product.sizes && :sizes retorna true si los arrays comparten al menos un elemento
      queryBuilder.andWhere('product.sizes && :sizes', { sizes: sizesArray });
    }

    // Filtro 4: Precio mínimo
    if (minPrice !== undefined && minPrice !== null) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    // Filtro 5: Precio máximo
    if (maxPrice !== undefined && maxPrice !== null) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Ejecuta la consulta con paginación y obtiene el conteo total en una sola query optimizada
    // getManyAndCount() es más eficiente que hacer find() y count() por separado
    const [products, total] = await queryBuilder
      .skip(offset) // Salta los primeros N productos
      .take(limit) // Limita la cantidad de resultados
      .getManyAndCount(); // Retorna [productos[], totalCount]

    // Calcula el número total de páginas necesarias para mostrar todos los resultados
    const pages = Math.ceil(total / limit);

    // Retorna los productos con las imágenes transformadas a URLs simples
    return {
      products: products.map((product) => ({
        ...product,
        // Transforma las entidades ProductImage a un array simple de URLs
        images: product.images.map((img) => img.url),
      })),
      total, // Total de productos que cumplen con los filtros
      limit, // Límite usado en esta consulta (útil para el frontend)
      offset, // Offset usado en esta consulta
      pages, // Total de páginas disponibles
    };
  }

  /**
   * Busca un producto específico por ID, título o slug
   * Implementa dos estrategias de búsqueda para optimizar performance
   * @param term - Puede ser UUID, título del producto o slug
   * @returns El producto encontrado con todas sus relaciones
   */
  async findOne(term: string) {
    let product: Product;

    // Estrategia 1: Si es UUID, búsqueda directa por ID (más rápida)
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // Estrategia 2: Búsqueda flexible por título o slug usando Query Builder
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') // Incluye imágenes en el resultado
        .getOne();
    }

    // Si no encuentra el producto, lanza excepción
    if (!product) throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  /**
   * Versión simplificada de findOne que retorna las imágenes como URLs simples
   * Útil para APIs que necesitan respuestas más ligeras
   * @param term - Término de búsqueda (ID, título o slug)
   * @returns Producto con imágenes como array de strings
   */
  async findOnePlain(term: string) {
    // Reutiliza findOne y transforma el resultado
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      // Convierte objetos ProductImage a solo URLs
      images: images.map((image) => image.url),
    };
  }

  /**
   * Actualiza un producto existente, incluyendo sus imágenes
   * Usa transacciones para garantizar consistencia de datos
   * @param id - ID del producto a actualizar
   * @param updateProductDto - Nuevos datos del producto
   * @param user - Usuario que realiza la actualización
   * @returns El producto actualizado
   */
  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // Separa las imágenes del resto de campos a actualizar
    const { images, ...toUpdate } = updateProductDto;

    // preload: busca el producto por ID y aplica los cambios sin guardar aún
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    // Inicia una transacción manual para operaciones atómicas
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Si se enviaron nuevas imágenes, reemplaza las existentes
      if (images) {
        // Elimina todas las imágenes actuales del producto
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        // Crea las nuevas imágenes
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      // await this.productRepository.save( product );
      // Actualiza el usuario que modificó el producto (para auditoría)
      product.user = user;

      // Guarda todos los cambios dentro de la transacción
      await queryRunner.manager.save(product);

      // Si todo salió bien, confirma la transacción
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // Retorna el producto actualizado en formato simplificado
      return this.findOnePlain(id);
    } catch (error) {
      // Si algo falla, revierte todos los cambios
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  /**
   * Elimina un producto de la base de datos
   * @param id - ID del producto a eliminar
   */
  async remove(id: string) {
    // Primero busca el producto para verificar que existe
    const product = await this.findOne(id);
    // Elimina el producto (las imágenes se eliminan automáticamente por CASCADE)
    await this.productRepository.remove(product);
  }

  /**
   * Maneja errores específicos de la base de datos de forma centralizada
   * @param error - Error capturado de TypeORM
   */
  private handleDBExceptions(error: any) {
    // Error 23505: violación de constraint único (ej: título duplicado)
    if (error.code === '23505') throw new BadRequestException(error.detail);

    // Registra el error para debugging
    this.logger.error(error);
    // console.log(error)
    // Lanza error genérico para no exponer detalles internos
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  /**
   * Elimina todos los productos de la base de datos
   * Método utilitario usado principalmente en el seed para limpiar datos
   * @returns Resultado de la operación de eliminación
   */
  async deleteAllProducts() {
    // Usa Query Builder para operación DELETE masiva
    const query = this.productRepository.createQueryBuilder('product');

    try {
      // DELETE FROM products WHERE (sin condiciones = elimina todo)
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
