import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { ProductsService } from './products.service';
import { Product, ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

/**
 * Suite de pruebas unitarias para ProductsService
 * Cubre el método findAllFiltered con todos los filtros posibles
 */
describe('ProductsService - findAllFiltered', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let mockQueryBuilder: any;

  // Mock de imágenes de productos
  const mockImage1: Partial<ProductImage> = {
    id: 1,
    url: 'http://localhost:3000/files/product/image1.jpg',
  };

  const mockImage2: Partial<ProductImage> = {
    id: 2,
    url: 'http://localhost:3000/files/product/image2.jpg',
  };

  // Mock de productos de prueba
  const mockProducts: Partial<Product>[] = [
    {
      id: '1',
      title: 'Dog Collar Premium',
      description: 'High quality collar for dogs',
      price: 25.99,
      gender: 'unisex',
      sizes: ['S', 'M', 'L'],
      images: [mockImage1 as ProductImage],
    },
    {
      id: '2',
      title: 'Cat Food Bowl',
      description: 'Stainless steel bowl for cats',
      price: 15.50,
      gender: 'unisex',
      sizes: ['M'],
      images: [mockImage2 as ProductImage],
    },
  ];

  beforeEach(async () => {
    // Crea un QueryBuilder mock que simula el comportamiento real de TypeORM
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockProducts, mockProducts.length]),
    };

    // Mock del repositorio de productos
    const mockProductRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    // Mock del repositorio de imágenes
    const mockProductImageRepository = {
      create: jest.fn(),
    };

    // Mock del DataSource
    const mockDataSource = {
      createQueryRunner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: mockProductImageRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Filtrado básico - Sin filtros', () => {
    it('debe retornar todos los productos sin filtros aplicados', async () => {
      const result = await service.findAllFiltered({ limit: 10, offset: 0 });

      // Verifica que se haya creado el query builder
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith('product');

      // Verifica que se hayan hecho los joins y ordenamiento
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('product.images', 'images');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('product.id', 'ASC');

      // Verifica la paginación
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);

      // Verifica la estructura del resultado
      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('offset');
      expect(result).toHaveProperty('pages');

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
    });

    it('debe transformar las imágenes de entidades a URLs simples', async () => {
      const result = await service.findAllFiltered({ limit: 10, offset: 0 });

      result.products.forEach((product) => {
        expect(Array.isArray(product.images)).toBe(true);
        product.images.forEach((image) => {
          expect(typeof image).toBe('string');
          expect(image).toContain('http://');
        });
      });
    });
  });

  describe('Filtro por búsqueda de texto (q)', () => {
    it('debe aplicar filtro de búsqueda por texto en título y descripción', async () => {
      await service.findAllFiltered({ q: 'collar', limit: 10, offset: 0 });

      // Verifica que se haya aplicado el filtro de búsqueda
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: '%collar%' }
      );
    });

    it('debe manejar búsquedas con espacios y caracteres especiales', async () => {
      await service.findAllFiltered({ q: 'premium dog', limit: 10, offset: 0 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(String),
        { search: '%premium dog%' }
      );
    });
  });

  describe('Filtro por género (gender)', () => {
    it('debe filtrar por género e incluir productos unisex', async () => {
      await service.findAllFiltered({ gender: 'men', limit: 10, offset: 0 });

      // Verifica que se incluyan tanto el género específico como unisex
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(product.gender = :gender OR product.gender = :unisex)',
        { gender: 'men', unisex: 'unisex' }
      );
    });

    it('debe aceptar todos los géneros válidos', async () => {
      const validGenders = ['men', 'women', 'kid', 'unisex'];

      for (const gender of validGenders) {
        jest.clearAllMocks();
        await service.findAllFiltered({ gender, limit: 10, offset: 0 });

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ gender })
        );
      }
    });
  });

  describe('Filtro por tallas (sizes)', () => {
    it('debe filtrar productos por tallas usando array overlap', async () => {
      await service.findAllFiltered({ sizes: 'S,M,L', limit: 10, offset: 0 });

      // Verifica que se use el operador && de PostgreSQL para arrays
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.sizes && :sizes',
        { sizes: ['S', 'M', 'L'] }
      );
    });

    it('debe manejar tallas con espacios extra', async () => {
      await service.findAllFiltered({ sizes: 'S, M , L', limit: 10, offset: 0 });

      // Verifica que se hayan eliminado los espacios extra
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.sizes && :sizes',
        { sizes: ['S', 'M', 'L'] }
      );
    });

    it('debe manejar una sola talla', async () => {
      await service.findAllFiltered({ sizes: 'XL', limit: 10, offset: 0 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.sizes && :sizes',
        { sizes: ['XL'] }
      );
    });

    it('debe convertir tallas a mayúsculas (case-insensitive)', async () => {
      await service.findAllFiltered({ sizes: 's,m,l', limit: 10, offset: 0 });

      // Verifica que las tallas en minúsculas se conviertan a mayúsculas
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.sizes && :sizes',
        { sizes: ['S', 'M', 'L'] }
      );
    });
  });

  describe('Filtro por rango de precios', () => {
    it('debe filtrar por precio mínimo', async () => {
      await service.findAllFiltered({ minPrice: 10, limit: 10, offset: 0 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: 10 }
      );
    });

    it('debe filtrar por precio máximo', async () => {
      await service.findAllFiltered({ maxPrice: 50, limit: 10, offset: 0 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        { maxPrice: 50 }
      );
    });

    it('debe filtrar por rango completo (min y max)', async () => {
      await service.findAllFiltered({ minPrice: 10, maxPrice: 50, limit: 10, offset: 0 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: 10 }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        { maxPrice: 50 }
      );
    });

    it('debe aceptar precio cero como mínimo', async () => {
      await service.findAllFiltered({ minPrice: 0, limit: 10, offset: 0 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: 0 }
      );
    });
  });

  describe('Filtros combinados', () => {
    it('debe aplicar múltiples filtros simultáneamente', async () => {
      await service.findAllFiltered({
        q: 'collar',
        gender: 'men',
        sizes: 'M,L',
        minPrice: 20,
        maxPrice: 100,
        limit: 10,
        offset: 0,
      });

      // Verifica que se hayan aplicado todos los filtros
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(5);
    });
  });

  describe('Paginación', () => {
    it('debe calcular correctamente el número de páginas', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockProducts, 25]);

      const result = await service.findAllFiltered({ limit: 10, offset: 0 });

      expect(result.pages).toBe(3); // 25 productos / 10 por página = 3 páginas
    });

    it('debe manejar límites personalizados', async () => {
      await service.findAllFiltered({ limit: 5, offset: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('debe usar valores por defecto si no se especifican', async () => {
      await service.findAllFiltered({});

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  describe('Casos edge', () => {
    it('debe manejar resultados vacíos', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findAllFiltered({ limit: 10, offset: 0 });

      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.pages).toBe(0);
    });

    it('debe manejar productos sin imágenes', async () => {
      const productsWithoutImages = [
        { ...mockProducts[0], images: [] },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([productsWithoutImages, 1]);

      const result = await service.findAllFiltered({ limit: 10, offset: 0 });

      expect(result.products[0].images).toEqual([]);
    });
  });
});
