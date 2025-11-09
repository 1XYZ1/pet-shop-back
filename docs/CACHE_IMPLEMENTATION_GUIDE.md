# Guía de Implementación de Redis Cache
**Proyecto:** Pet Shop Backend (NestJS + TypeORM + PostgreSQL)
**Objetivo:** Implementar caché estratégico para reducir carga en PostgreSQL

---

## 1. Instalación de Dependencias

### 1.1 Instalar Paquetes NestJS Cache
```bash
cd pet-shop-back
yarn add @nestjs/cache-manager cache-manager
yarn add cache-manager-redis-store
yarn add @types/cache-manager-redis-store -D
```

### 1.2 Instalar Redis Localmente (Desarrollo)

**Opción A: Docker (Recomendado)**
```bash
# Agregar Redis al docker-compose.yml existente
# Ver sección 2.1 para configuración
docker-compose up -d redis
```

**Opción B: Windows (WSL o instalación nativa)**
```bash
# Con WSL
wsl sudo apt-get install redis-server
wsl redis-server

# O descargar desde: https://github.com/microsoftarchive/redis/releases
```

**Opción C: macOS**
```bash
brew install redis
brew services start redis
```

---

## 2. Configuración

### 2.1 Actualizar docker-compose.yml

**Ubicación:** `pet-shop-back/docker-compose.yml`

```yaml
version: '3'

services:
  db:
    image: postgres:14.3
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - ./postgres:/var/lib/postgresql/data

  # ========== AGREGAR REDIS ==========
  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - ./redis:/data
    command: redis-server --appendonly yes
    # appendonly yes = persistencia en disco
```

### 2.2 Actualizar .env.template

**Ubicación:** `pet-shop-back/.env.template`

```env
# Existentes...
STAGE=dev
DB_HOST=localhost
DB_PORT=5432
# ...

# ========== AGREGAR REDIS CONFIG ==========
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600
# TTL en segundos (3600 = 1 hora)
```

### 2.3 Actualizar .env Local

```bash
cp .env.template .env
# Editar .env y agregar las variables de Redis
```

---

## 3. Configuración de NestJS

### 3.1 Configurar CacheModule Global

**Ubicación:** `pet-shop-back/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager'; // ✅ AGREGAR
import * as redisStore from 'cache-manager-redis-store'; // ✅ AGREGAR

@Module({
  imports: [
    ConfigModule.forRoot(),

    // ========== AGREGAR CACHE MODULE ==========
    CacheModule.registerAsync({
      isGlobal: true, // Disponible en todos los módulos
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: configService.get('REDIS_TTL'), // TTL por defecto
        max: 100, // Máximo de items en caché
      }),
    }),

    TypeOrmModule.forRootAsync({
      // ... configuración existente
    }),

    // ... otros módulos
  ],
})
export class AppModule {}
```

---

## 4. Implementación en ServicesService (Ejemplo Completo)

### 4.1 Actualizar ServicesService

**Ubicación:** `pet-shop-back/src/services/services.service.ts`

```typescript
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Inject, // ✅ AGREGAR
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // ✅ AGREGAR
import { Cache } from 'cache-manager'; // ✅ AGREGAR

import { CreateServiceDto, UpdateServiceDto } from './dto';
import { Service } from './entities';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { handleDatabaseException } from '../common/helpers';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger('ServicesService');

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    // ========== AGREGAR CACHE MANAGER ==========
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Crea un nuevo servicio y limpia el caché
   * @param createServiceDto - Datos del servicio a crear
   * @param user - Usuario que está creando el servicio
   * @returns El servicio creado
   */
  async create(createServiceDto: CreateServiceDto, user: User): Promise<Service> {
    try {
      const service = this.serviceRepository.create({
        ...createServiceDto,
        user,
      });

      await this.serviceRepository.save(service);

      // ========== INVALIDAR CACHÉ AL CREAR ==========
      await this.clearServicesCache();
      this.logger.log('Cache invalidated after creating service');

      return service;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtiene una lista paginada de servicios CON CACHÉ
   * @param paginationDto - Parámetros de paginación (limit, offset)
   * @returns Objeto con servicios, total de registros y número de páginas
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    // ========== GENERAR CACHE KEY ==========
    const cacheKey = `services:active:${limit}:${offset}`;

    // ========== INTENTAR OBTENER DESDE CACHÉ ==========
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      this.logger.log(`Cache HIT for key: ${cacheKey}`);
      return cachedData;
    }

    // ========== CACHE MISS: CONSULTAR BD ==========
    this.logger.log(`Cache MISS for key: ${cacheKey} - querying database`);

    const [services, total] = await this.serviceRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        createdAt: 'DESC',
      },
      where: {
        isActive: true,
      },
    });

    const result = {
      services,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };

    // ========== GUARDAR EN CACHÉ ==========
    // TTL: 1 hora (3600 segundos) - configurable en .env
    await this.cacheManager.set(cacheKey, result, 3600);
    this.logger.log(`Data cached with key: ${cacheKey}`);

    return result;
  }

  /**
   * Actualiza un servicio existente y limpia el caché
   */
  async update(id: string, updateServiceDto: UpdateServiceDto, user: User): Promise<Service> {
    const service = await this.serviceRepository.preload({
      id,
      ...updateServiceDto,
    });

    if (!service) {
      throw new NotFoundException(`Service with id "${id}" not found`);
    }

    try {
      service.user = user;
      await this.serviceRepository.save(service);

      // ========== INVALIDAR CACHÉ AL ACTUALIZAR ==========
      await this.clearServicesCache();
      this.logger.log('Cache invalidated after updating service');

      return service;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Elimina un servicio de la base de datos y limpia el caché
   */
  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);

    // ========== INVALIDAR CACHÉ AL ELIMINAR ==========
    await this.clearServicesCache();
    this.logger.log('Cache invalidated after deleting service');
  }

  /**
   * Limpia todo el caché de servicios
   * Invalida todas las combinaciones de paginación
   * @private
   */
  private async clearServicesCache(): Promise<void> {
    // Obtener todas las keys que empiezan con 'services:active:'
    // NOTA: En producción, usar patrón más robusto o Redis SCAN
    const patterns = [
      'services:active:10:0',
      'services:active:10:10',
      'services:active:10:20',
      'services:active:20:0',
      'services:active:50:0',
      // Agregar más combinaciones comunes según analytics
    ];

    for (const key of patterns) {
      await this.cacheManager.del(key);
    }

    this.logger.log('Services cache cleared');
  }

  // ... resto de métodos sin cambios
}
```

---

## 5. Estrategia de Cache Keys

### 5.1 Patrón de Nomenclatura

```
{entity}:{variant}:{param1}:{param2}:...
```

**Ejemplos:**
```typescript
// Servicios activos paginados
services:active:10:0           // limit=10, offset=0
services:active:20:10          // limit=20, offset=10

// Productos filtrados
products:type:ALIMENTO_SECO:10:0
products:species:DOGS:10:0
products:type:ACCESORIOS:species:CATS:10:0

// Carrito de usuario
cart:user:uuid-123-456

// Perfil completo de mascota (solo si es frecuente)
pet:profile:uuid-pet-789
```

### 5.2 TTL Recomendados por Endpoint

| Endpoint | TTL | Justificación |
|----------|-----|---------------|
| `GET /api/services` | 3600s (1h) | Cambia poco, público |
| `GET /api/products` | 600s (10min) | Stock cambia con ventas |
| `GET /api/cart` | 300s (5min) | Usuario modifica frecuentemente |
| `GET /api/pets/:id/complete-profile` | 1800s (30min) | Historial médico actualiza ocasionalmente |

---

## 6. Implementación en ProductsService (Ejemplo Avanzado)

### 6.1 Caché con Múltiples Filtros

**Ubicación:** `pet-shop-back/src/products/products.service.ts`

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

    // ========== AGREGAR CACHE ==========
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Obtiene productos filtrados CON CACHÉ
   * Cache key incluye todos los filtros para uniqueness
   */
  async findAllFiltered(queryDto: FindProductsQueryDto) {
    const { limit = 10, offset = 0, q, type, species, sizes, minPrice, maxPrice } = queryDto;

    // ========== GENERAR CACHE KEY COMPLEJA ==========
    const cacheKey = this.generateProductCacheKey({
      limit,
      offset,
      q,
      type,
      species,
      sizes,
      minPrice,
      maxPrice,
    });

    // ========== INTENTAR CACHÉ ==========
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS: ${cacheKey} - querying database`);

    // ========== QUERY NORMAL (existente) ==========
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.id', 'ASC');

    // ... todos los filtros existentes (líneas 128-164)

    const [products, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const result = {
      products: products.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      })),
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };

    // ========== GUARDAR EN CACHÉ ==========
    // TTL: 10 minutos (stock puede cambiar)
    await this.cacheManager.set(cacheKey, result, 600);
    this.logger.log(`Cached: ${cacheKey}`);

    return result;
  }

  /**
   * Actualiza un producto e invalida cachés relacionados
   */
  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // ... lógica existente de actualización

    // ========== INVALIDAR CACHÉ AL ACTUALIZAR ==========
    await this.clearProductsCache();
    this.logger.log('Products cache invalidated after update');

    return this.findOnePlain(id);
  }

  /**
   * Genera cache key única basada en filtros
   * Ordena parámetros alfabéticamente para consistencia
   * @private
   */
  private generateProductCacheKey(filters: any): string {
    // Crear objeto solo con filtros definidos
    const definedFilters = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b)); // Ordenar alfabéticamente

    // Convertir a string compacto
    const filterString = definedFilters
      .map(([key, value]) => `${key}:${value}`)
      .join('|');

    return `products:${filterString}`;
  }

  /**
   * Limpia todo el caché de productos
   * En producción, usar Redis SCAN para encontrar todas las keys
   * @private
   */
  private async clearProductsCache(): Promise<void> {
    // Estrategia simple: eliminar combinaciones comunes
    // Estrategia avanzada: implementar prefix-based deletion

    // Por ahora, clear todo el caché (solo en desarrollo)
    await this.cacheManager.reset();
    this.logger.log('All products cache cleared');
  }
}
```

---

## 7. Monitoreo y Debugging

### 7.1 Logs de Cache Hit/Miss

Los servicios ya incluyen logs:
```typescript
this.logger.log(`Cache HIT for key: ${cacheKey}`);
this.logger.log(`Cache MISS for key: ${cacheKey} - querying database`);
```

**Verificar en consola:**
```bash
yarn start:dev

# Deberías ver logs como:
# [ServicesService] Cache MISS for key: services:active:10:0 - querying database
# [ServicesService] Data cached with key: services:active:10:0
# [ServicesService] Cache HIT for key: services:active:10:0  (en siguiente request)
```

### 7.2 Monitorear Redis

**Conectar a Redis CLI:**
```bash
# Si usas Docker
docker exec -it pet-shop-back-redis-1 redis-cli

# Si está instalado localmente
redis-cli
```

**Comandos útiles:**
```redis
# Ver todas las keys
KEYS *

# Ver valor de una key específica
GET services:active:10:0

# Ver TTL restante de una key
TTL services:active:10:0

# Eliminar una key manualmente
DEL services:active:10:0

# Limpiar todo el caché (usar con cuidado)
FLUSHALL

# Ver estadísticas de Redis
INFO stats

# Ver memoria usada
INFO memory
```

### 7.3 Interceptor de Cache (Opcional)

**Ubicación:** `pet-shop-back/src/common/interceptors/cache-logging.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor que registra el tiempo de respuesta
 * Útil para medir impacto del caché
 */
@Injectable()
export class CacheLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('CachePerformance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`${method} ${url} - ${duration}ms`);
      }),
    );
  }
}
```

**Usar en ServicesController:**
```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheLoggingInterceptor } from '../common/interceptors/cache-logging.interceptor';

@Controller('services')
@UseInterceptors(CacheLoggingInterceptor) // Aplica a todos los endpoints
export class ServicesController {
  // ...
}
```

---

## 8. Testing de Caché

### 8.1 Test de Cache Hit/Miss

**Ubicación:** `pet-shop-back/src/services/services.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ServicesService } from './services.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './entities';

describe('ServicesService - Cache', () => {
  let service: ServicesService;
  let cacheManager: any;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([
              [{ id: '1', name: 'Test Service' }],
              1,
            ]),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should return cached data if available (cache HIT)', async () => {
    const cachedData = { services: [], total: 0, limit: 10, offset: 0, pages: 0 };
    mockCacheManager.get.mockResolvedValue(cachedData);

    const result = await service.findAll({ limit: 10, offset: 0 });

    expect(result).toEqual(cachedData);
    expect(cacheManager.get).toHaveBeenCalledWith('services:active:10:0');
    expect(cacheManager.set).not.toHaveBeenCalled(); // No debería guardar si ya existe
  });

  it('should query database and cache if not cached (cache MISS)', async () => {
    mockCacheManager.get.mockResolvedValue(null); // Cache MISS

    const result = await service.findAll({ limit: 10, offset: 0 });

    expect(cacheManager.get).toHaveBeenCalledWith('services:active:10:0');
    expect(cacheManager.set).toHaveBeenCalledWith(
      'services:active:10:0',
      expect.any(Object),
      3600,
    );
  });

  it('should clear cache after creating a service', async () => {
    const createDto = { name: 'New Service', type: 'GROOMING' } as any;
    const user = { id: '1' } as any;

    await service.create(createDto, user);

    expect(cacheManager.del).toHaveBeenCalled(); // Debería invalidar caché
  });
});
```

**Ejecutar test:**
```bash
yarn test services.service
```

---

## 9. Producción

### 9.1 Redis en Producción (AWS ElastiCache)

**Configuración recomendada:**
```typescript
// app.module.ts (producción)
CacheModule.registerAsync({
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const isProduction = configService.get('STAGE') === 'prod';

    return {
      store: redisStore,
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      ttl: configService.get('REDIS_TTL'),
      max: 500, // Mayor capacidad en producción

      // Solo en producción: configuración de cluster
      ...(isProduction && {
        cluster: {
          nodes: [
            { host: configService.get('REDIS_HOST_1'), port: 6379 },
            { host: configService.get('REDIS_HOST_2'), port: 6379 },
          ],
        },
      }),
    };
  },
}),
```

### 9.2 Variables de Entorno Producción

```env
# .env.production
REDIS_HOST=your-elasticache-endpoint.amazonaws.com
REDIS_PORT=6379
REDIS_TTL=3600
REDIS_MAX_ITEMS=500
```

### 9.3 Estrategia de Invalidación en Producción

**Opción 1: TTL Bajo + Cache Warming**
- TTL corto (5-10 minutos)
- Tarea cron que precarga caché cada 5 minutos

**Opción 2: Event-Based Invalidation**
- Usar EventEmitter de NestJS
- Invalidar caché cuando ocurre un evento (create, update, delete)

**Opción 3: Redis Pub/Sub (Multi-Server)**
- Para múltiples instancias del backend
- Publicar eventos de invalidación a todos los servidores

---

## 10. Troubleshooting

### 10.1 Problema: "Cannot connect to Redis"

**Solución:**
```bash
# Verificar que Redis está corriendo
docker-compose ps

# Ver logs de Redis
docker-compose logs redis

# Reiniciar Redis
docker-compose restart redis
```

### 10.2 Problema: "Cache no se invalida"

**Verificar:**
```typescript
// 1. Revisar que clearCache() se llama en create/update/delete
await this.clearServicesCache();

// 2. Verificar logs
this.logger.log('Cache invalidated after...');

// 3. Conectar a Redis y verificar manualmente
redis-cli
KEYS services:*
DEL services:active:10:0
```

### 10.3 Problema: "Respuestas desactualizadas"

**Solución:**
```typescript
// Reducir TTL en desarrollo
await this.cacheManager.set(cacheKey, result, 60); // 1 minuto en dev

// O deshabilitar caché en desarrollo
if (process.env.STAGE !== 'prod') {
  return result; // Sin caché en desarrollo
}
```

---

## 11. Métricas de Éxito

### 11.1 Antes de Implementar Caché

**Medir baseline:**
```bash
# Instalar Apache Bench (si no está instalado)
# macOS: incluido en sistema
# Windows: descargar desde https://httpd.apache.org/

# Test de carga
ab -n 1000 -c 10 http://localhost:3000/api/services

# Observar:
# - Time per request: ~50ms
# - Requests per second: ~200/s
```

### 11.2 Después de Implementar Caché

**Esperar mejoras:**
```bash
ab -n 1000 -c 10 http://localhost:3000/api/services

# Observar mejoras:
# - Time per request: ~5ms (↓ 90%)
# - Requests per second: ~2000/s (↑ 1000%)
```

### 11.3 Monitoreo PostgreSQL

**Antes:**
```sql
-- Queries por segundo
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
-- Resultado esperado: ~50 queries/s en endpoint /api/services
```

**Después:**
```sql
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
-- Resultado esperado: ~5 queries/s (↓ 90% con cache hit ratio del 90%)
```

---

## 12. Próximos Pasos

### 12.1 Fase 1: MVP (Semana 1)
- ✅ Instalar Redis y dependencias
- ✅ Configurar CacheModule en AppModule
- ✅ Implementar caché en ServicesService.findAll()
- ✅ Testing básico

### 12.2 Fase 2: Expansión (Semana 2-3)
- ⬜ Implementar caché en ProductsService.findAllFiltered()
- ⬜ Estrategia de invalidación robusta
- ⬜ Monitoreo y alertas

### 12.3 Fase 3: Optimización (Semana 4)
- ⬜ Cache warming para queries comunes
- ⬜ Análisis de hit/miss ratio
- ⬜ Ajuste de TTL según métricas reales

---

**Última Actualización:** 2025-11-09
**Mantenido Por:** Equipo Backend
