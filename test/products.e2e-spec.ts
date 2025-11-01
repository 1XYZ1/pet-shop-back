import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Suite de pruebas E2E para el endpoint GET /api/products
 * Prueba la funcionalidad completa de filtrado y paginación de productos
 *
 * NOTA: Estas pruebas requieren que la base de datos esté corriendo y
 * tenga datos seed cargados para funcionar correctamente.
 */
describe('Products Filters (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configura el ValidationPipe global igual que en main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/products - Casos básicos', () => {
    it('debe retornar productos sin filtros', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('products');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('offset');
          expect(res.body).toHaveProperty('pages');
          expect(Array.isArray(res.body.products)).toBe(true);
        });
    });

    it('debe retornar productos con estructura correcta', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            const product = res.body.products[0];
            expect(product).toHaveProperty('id');
            expect(product).toHaveProperty('title');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('description');
            expect(product).toHaveProperty('gender');
            expect(product).toHaveProperty('sizes');
            expect(product).toHaveProperty('images');
            expect(Array.isArray(product.images)).toBe(true);
            expect(Array.isArray(product.sizes)).toBe(true);
          }
        });
    });

    it('debe transformar imágenes a URLs simples', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            const product = res.body.products[0];
            if (product.images.length > 0) {
              expect(typeof product.images[0]).toBe('string');
            }
          }
        });
    });
  });

  describe('GET /api/products - Paginación', () => {
    it('debe respetar el límite especificado', () => {
      return request(app.getHttpServer())
        .get('/api/products?limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.products.length).toBeLessThanOrEqual(5);
          expect(res.body.limit).toBe(5);
        });
    });

    it('debe respetar el offset especificado', () => {
      return request(app.getHttpServer())
        .get('/api/products?offset=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.offset).toBe(10);
        });
    });

    it('debe combinar limit y offset', () => {
      return request(app.getHttpServer())
        .get('/api/products?limit=3&offset=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.limit).toBe(3);
          expect(res.body.offset).toBe(5);
          expect(res.body.products.length).toBeLessThanOrEqual(3);
        });
    });

    it('debe calcular correctamente el número de páginas', () => {
      return request(app.getHttpServer())
        .get('/api/products?limit=5')
        .expect(200)
        .expect((res) => {
          const expectedPages = Math.ceil(res.body.total / res.body.limit);
          expect(res.body.pages).toBe(expectedPages);
        });
    });

    it('debe rechazar límite mayor a 100', () => {
      return request(app.getHttpServer())
        .get('/api/products?limit=101')
        .expect(400);
    });

    it('debe rechazar límite menor a 1', () => {
      return request(app.getHttpServer())
        .get('/api/products?limit=0')
        .expect(400);
    });

    it('debe rechazar offset negativo', () => {
      return request(app.getHttpServer())
        .get('/api/products?offset=-1')
        .expect(400);
    });

    it('debe rechazar valores no numéricos para limit', () => {
      return request(app.getHttpServer())
        .get('/api/products?limit=abc')
        .expect(400);
    });
  });

  describe('GET /api/products - Filtro por búsqueda de texto (q)', () => {
    it('debe filtrar productos por término de búsqueda', () => {
      return request(app.getHttpServer())
        .get('/api/products?q=shirt')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.products)).toBe(true);
          // Si hay resultados, verifica que contengan el término buscado
          if (res.body.products.length > 0) {
            const hasSearchTerm = res.body.products.some(
              (p) =>
                p.title.toLowerCase().includes('shirt') ||
                (p.description && p.description.toLowerCase().includes('shirt'))
            );
            expect(hasSearchTerm).toBe(true);
          }
        });
    });

    it('debe ser case-insensitive', () => {
      return request(app.getHttpServer())
        .get('/api/products?q=SHIRT')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.products)).toBe(true);
        });
    });

    it('debe buscar en título y descripción', () => {
      return request(app.getHttpServer())
        .get('/api/products?q=premium')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.products)).toBe(true);
        });
    });

    it('debe manejar búsquedas con espacios', () => {
      return request(app.getHttpServer())
        .get('/api/products?q=men%20shirt')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.products)).toBe(true);
        });
    });

    it('debe retornar array vacío para búsquedas sin resultados', () => {
      return request(app.getHttpServer())
        .get('/api/products?q=xyznonexistent123')
        .expect(200)
        .expect((res) => {
          expect(res.body.products).toEqual([]);
          expect(res.body.total).toBe(0);
        });
    });
  });

  describe('GET /api/products - Filtro por género', () => {
    it('debe filtrar productos por género men', () => {
      return request(app.getHttpServer())
        .get('/api/products?gender=men')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            // Debe incluir productos men y unisex
            res.body.products.forEach((product) => {
              expect(['men', 'unisex']).toContain(product.gender);
            });
          }
        });
    });

    it('debe filtrar productos por género women', () => {
      return request(app.getHttpServer())
        .get('/api/products?gender=women')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            res.body.products.forEach((product) => {
              expect(['women', 'unisex']).toContain(product.gender);
            });
          }
        });
    });

    it('debe filtrar productos por género kid', () => {
      return request(app.getHttpServer())
        .get('/api/products?gender=kid')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            res.body.products.forEach((product) => {
              expect(['kid', 'unisex']).toContain(product.gender);
            });
          }
        });
    });

    it('debe aceptar género unisex', () => {
      return request(app.getHttpServer())
        .get('/api/products?gender=unisex')
        .expect(200);
    });

    it('debe rechazar géneros inválidos', () => {
      return request(app.getHttpServer())
        .get('/api/products?gender=invalid')
        .expect(400);
    });
  });

  describe('GET /api/products - Filtro por tallas', () => {
    it('debe filtrar productos por una sola talla', () => {
      return request(app.getHttpServer())
        .get('/api/products?sizes=M')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            // Verifica que los productos tengan la talla M
            res.body.products.forEach((product) => {
              expect(product.sizes).toContain('M');
            });
          }
        });
    });

    it('debe filtrar productos por múltiples tallas', () => {
      return request(app.getHttpServer())
        .get('/api/products?sizes=S,M,L')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            // Verifica que los productos tengan al menos una de las tallas especificadas
            res.body.products.forEach((product) => {
              const hasAtLeastOneSize = ['S', 'M', 'L'].some((size) =>
                product.sizes.includes(size)
              );
              expect(hasAtLeastOneSize).toBe(true);
            });
          }
        });
    });

    it('debe manejar tallas con espacios', () => {
      return request(app.getHttpServer())
        .get('/api/products?sizes=S,%20M,%20L')
        .expect(200);
    });
  });

  describe('GET /api/products - Filtro por rango de precios', () => {
    it('debe filtrar productos por precio mínimo', () => {
      return request(app.getHttpServer())
        .get('/api/products?minPrice=50')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            res.body.products.forEach((product) => {
              expect(product.price).toBeGreaterThanOrEqual(50);
            });
          }
        });
    });

    it('debe filtrar productos por precio máximo', () => {
      return request(app.getHttpServer())
        .get('/api/products?maxPrice=100')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            res.body.products.forEach((product) => {
              expect(product.price).toBeLessThanOrEqual(100);
            });
          }
        });
    });

    it('debe filtrar productos por rango completo de precios', () => {
      return request(app.getHttpServer())
        .get('/api/products?minPrice=20&maxPrice=80')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            res.body.products.forEach((product) => {
              expect(product.price).toBeGreaterThanOrEqual(20);
              expect(product.price).toBeLessThanOrEqual(80);
            });
          }
        });
    });

    it('debe aceptar precio cero como mínimo', () => {
      return request(app.getHttpServer())
        .get('/api/products?minPrice=0')
        .expect(200);
    });

    it('debe rechazar precios negativos', () => {
      return request(app.getHttpServer())
        .get('/api/products?minPrice=-10')
        .expect(400);
    });

    it('debe rechazar valores no numéricos para precios', () => {
      return request(app.getHttpServer())
        .get('/api/products?minPrice=abc')
        .expect(400);
    });
  });

  describe('GET /api/products - Filtros combinados', () => {
    it('debe aplicar múltiples filtros simultáneamente', () => {
      return request(app.getHttpServer())
        .get('/api/products?q=shirt&gender=men&sizes=M,L&minPrice=20&maxPrice=100&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('products');
          expect(res.body).toHaveProperty('total');
          expect(res.body.limit).toBe(5);

          if (res.body.products.length > 0) {
            res.body.products.forEach((product) => {
              // Verifica género (men o unisex)
              expect(['men', 'unisex']).toContain(product.gender);

              // Verifica precio
              expect(product.price).toBeGreaterThanOrEqual(20);
              expect(product.price).toBeLessThanOrEqual(100);

              // Verifica tallas (debe tener M o L)
              const hasValidSize = ['M', 'L'].some((size) =>
                product.sizes.includes(size)
              );
              expect(hasValidSize).toBe(true);
            });
          }
        });
    });

    it('debe combinar búsqueda de texto con paginación', () => {
      return request(app.getHttpServer())
        .get('/api/products?q=shirt&limit=3&offset=0')
        .expect(200)
        .expect((res) => {
          expect(res.body.products.length).toBeLessThanOrEqual(3);
          expect(res.body.limit).toBe(3);
          expect(res.body.offset).toBe(0);
        });
    });

    it('debe combinar género con rango de precios', () => {
      return request(app.getHttpServer())
        .get('/api/products?gender=women&minPrice=30&maxPrice=70')
        .expect(200)
        .expect((res) => {
          if (res.body.products.length > 0) {
            res.body.products.forEach((product) => {
              expect(['women', 'unisex']).toContain(product.gender);
              expect(product.price).toBeGreaterThanOrEqual(30);
              expect(product.price).toBeLessThanOrEqual(70);
            });
          }
        });
    });
  });

  describe('GET /api/products - Casos edge y validación', () => {
    it('debe rechazar parámetros no permitidos', () => {
      return request(app.getHttpServer())
        .get('/api/products?invalidParam=test')
        .expect(400);
    });

    it('debe manejar múltiples filtros con resultados vacíos', () => {
      return request(app.getHttpServer())
        .get('/api/products?gender=men&minPrice=9999&maxPrice=10000')
        .expect(200)
        .expect((res) => {
          expect(res.body.products).toEqual([]);
          expect(res.body.total).toBe(0);
          expect(res.body.pages).toBe(0);
        });
    });

    it('debe manejar offset mayor al total de productos', () => {
      return request(app.getHttpServer())
        .get('/api/products?offset=9999')
        .expect(200)
        .expect((res) => {
          expect(res.body.products).toEqual([]);
        });
    });

    it('debe usar valores por defecto cuando no se especifican parámetros', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          expect(res.body.limit).toBe(10);
          expect(res.body.offset).toBe(0);
        });
    });
  });
});
