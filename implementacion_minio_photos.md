# 📋 Plan de Integración de MinIO para Pet Shop Backend

## 🎯 Objetivo
Migrar el sistema de almacenamiento de imágenes desde almacenamiento local (`./static/products`) a MinIO alojado en Railway, permitiendo escalabilidad, mejor rendimiento y almacenamiento en la nube.

---

## 📦 Fase 1: Configuración Inicial de MinIO

### 1.1 Configurar MinIO en Railway
- Desplegar una instancia de MinIO en Railway
- Obtener credenciales: `MINIO_ACCESS_KEY` y `MINIO_SECRET_KEY`
- Obtener el endpoint público de MinIO (ej: `your-app.railway.app`)
- Anotar el puerto (usualmente 9000)

### 1.2 Instalar Dependencias
```bash
npm install minio
npm install --save-dev @types/minio
```

### 1.3 Variables de Entorno
Agregar a `.env.template`:
```env
# MinIO Configuration
MINIO_ENDPOINT=your-app.railway.app
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=pet-shop-images
```

---

## 🏗️ Fase 2: Implementación del Módulo MinIO

### 2.1 Crear MinioClientModule
Estructura propuesta:
```
src/minio-client/
├── minio-client.module.ts
├── minio-client.service.ts
├── dto/
│   └── upload-file.dto.ts
└── interfaces/
    └── minio-config.interface.ts
```

### 2.2 MinioClientService - Métodos Principales
Basándome en la documentación de MinIO JavaScript Client, el servicio debe incluir:

```typescript
// Métodos principales:
- uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string>
- downloadFile(fileName: string): Promise<Stream>
- deleteFile(fileName: string): Promise<void>
- getPublicUrl(fileName: string): string
- getPresignedUrl(fileName: string, expiry?: number): Promise<string>
- fileExists(fileName: string): Promise<boolean>
- ensureBucket(): Promise<void>
```

**Ejemplo de implementación basado en documentación MinIO:**

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioClientService implements OnModuleInit {
  private readonly logger = new Logger(MinioClientService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // Inicializar cliente MinIO
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get<string>('MINIO_PORT')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  async ensureBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created successfully`);

        // Configurar política pública de lectura
        await this.setBucketPolicy();
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    try {
      const metaData = {
        'Content-Type': contentType,
      };

      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file,
        file.length,
        metaData,
      );

      return this.getPublicUrl(fileName);
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  async downloadFile(fileName: string): Promise<Readable> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, fileName);
      return stream;
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File ${fileName} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  getPublicUrl(fileName: string): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}/${this.bucketName}/${fileName}`;
  }

  async getPresignedUrl(fileName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        expiry,
      );
      return url;
    } catch (error) {
      this.logger.error(`Error generating presigned URL: ${error.message}`);
      throw error;
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  private async setBucketPolicy(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    try {
      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy),
      );
      this.logger.log(`Bucket policy set successfully for ${this.bucketName}`);
    } catch (error) {
      this.logger.error(`Error setting bucket policy: ${error.message}`);
    }
  }
}
```

---

## 🔄 Fase 3: Refactorización del FilesModule

### 3.1 Actualizar FilesController
**Cambios necesarios:**

#### Ubicación actual: `src/files/files.controller.ts`

**1. Endpoint POST /files/product** (línea 39)
- Eliminar `diskStorage` de multer
- Usar `memoryStorage()` para mantener el archivo en buffer
- Pasar el buffer a MinioClientService para subir a MinIO
- Retornar la URL pública de MinIO

```typescript
import { memoryStorage } from 'multer';

@Post('product')
@UseInterceptors(
  FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: memoryStorage(), // Cambio principal
  }),
)
async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('Make sure that the file is an image');
  }

  // Generar nombre único usando el helper existente
  const fileName = fileNamer(null, file, null);

  // Subir a MinIO
  const secureUrl = await this.minioClientService.uploadFile(
    file.buffer,
    fileName,
    file.mimetype,
  );

  return { secureUrl, fileName };
}
```

**2. Endpoint GET /files/product/:imageName** (línea 29)

**Opción A: Redirigir a URL pública (Recomendado si bucket es público)**
```typescript
@Get('product/:imageName')
async findProductImage(
  @Res() res: Response,
  @Param('imageName') imageName: string,
) {
  const exists = await this.minioClientService.fileExists(imageName);

  if (!exists) {
    throw new BadRequestException(`No product found with image ${imageName}`);
  }

  const publicUrl = this.minioClientService.getPublicUrl(imageName);
  return res.redirect(302, publicUrl);
}
```

**Opción B: Generar presigned URL (Más seguro)**
```typescript
@Get('product/:imageName')
async findProductImage(@Param('imageName') imageName: string) {
  const exists = await this.minioClientService.fileExists(imageName);

  if (!exists) {
    throw new BadRequestException(`No product found with image ${imageName}`);
  }

  const presignedUrl = await this.minioClientService.getPresignedUrl(imageName);
  return { url: presignedUrl };
}
```

**Opción C: Stream proxy (Mantiene URLs originales)**
```typescript
@Get('product/:imageName')
async findProductImage(
  @Res() res: Response,
  @Param('imageName') imageName: string,
) {
  try {
    const stream = await this.minioClientService.downloadFile(imageName);
    stream.pipe(res);
  } catch (error) {
    throw new BadRequestException(`No product found with image ${imageName}`);
  }
}
```

### 3.2 Actualizar FilesService
**Ubicación: `src/files/files.service.ts`**

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { MinioClientService } from '../minio-client/minio-client.service';

@Injectable()
export class FilesService {
  constructor(private readonly minioClientService: MinioClientService) {}

  async getProductImageUrl(imageName: string): Promise<string> {
    const exists = await this.minioClientService.fileExists(imageName);

    if (!exists) {
      throw new BadRequestException(`No product found with image ${imageName}`);
    }

    return this.minioClientService.getPublicUrl(imageName);
  }

  async deleteProductImage(imageName: string): Promise<void> {
    await this.minioClientService.deleteFile(imageName);
  }
}
```

### 3.3 Actualizar FilesModule
**Ubicación: `src/files/files.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MinioClientModule } from '../minio-client/minio-client.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    ConfigModule,
    MinioClientModule, // Importar el nuevo módulo
  ],
  exports: [FilesService], // Exportar para usar en ProductsModule
})
export class FilesModule {}
```

---

## 🗃️ Fase 4: Gestión de Buckets y Políticas

### 4.1 Crear Bucket Automáticamente
El servicio debe verificar y crear el bucket al iniciar (ya implementado en `onModuleInit`):
```typescript
const exists = await minioClient.bucketExists(bucketName);
if (!exists) {
  await minioClient.makeBucket(bucketName, 'us-east-1');
}
```

### 4.2 Configurar Políticas de Acceso

**Opción 1: Bucket Público (Recomendado para imágenes de productos)**
```typescript
const policy = {
  Version: "2012-10-17",
  Statement: [{
    Effect: "Allow",
    Principal: { AWS: ["*"] },
    Action: ["s3:GetObject"],
    Resource: [`arn:aws:s3:::${bucketName}/*`]
  }]
};

await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
```

**Opción 2: URLs Pre-firmadas** (más seguro, expiran)
```typescript
// Generar URL temporal válida por 7 días
const url = await minioClient.presignedGetObject(bucketName, fileName, 7*24*60*60);
```

### 4.3 Comandos útiles con MinIO Client (mc)
```bash
# Configurar alias
mc alias set mypetshop https://your-minio.railway.app ACCESS_KEY SECRET_KEY

# Listar buckets
mc ls mypetshop

# Crear bucket
mc mb mypetshop/pet-shop-images

# Configurar política pública de lectura
mc anonymous set download mypetshop/pet-shop-images

# Listar objetos en bucket
mc ls mypetshop/pet-shop-images

# Ver política del bucket
mc anonymous get mypetshop/pet-shop-images
```

---

## 🚚 Fase 5: Migración de Datos

### 5.1 Script de Migración
**Crear archivo: `src/scripts/migrate-images-to-minio.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ProductsService } from '../products/products.service';
import * as fs from 'fs';
import * as path from 'path';

async function migrateImagesToMinio() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const minioService = app.get(MinioClientService);
  const productsService = app.get(ProductsService);

  const staticDir = path.join(__dirname, '../../static/products');

  console.log('🚀 Iniciando migración de imágenes a MinIO...');

  try {
    // Verificar si existe el directorio
    if (!fs.existsSync(staticDir)) {
      console.log('❌ No se encontró el directorio de imágenes');
      return;
    }

    // Leer todos los archivos
    const files = fs.readdirSync(staticDir);
    console.log(`📁 Encontrados ${files.length} archivos`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(staticDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const contentType = getContentType(file);

        // Subir a MinIO
        const url = await minioService.uploadFile(fileBuffer, file, contentType);
        console.log(`✅ Migrado: ${file} -> ${url}`);

        // Actualizar URL en base de datos
        await updateImageUrlInDatabase(productsService, file, url);

        successCount++;
      } catch (error) {
        console.error(`❌ Error migrando ${file}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📝 Total: ${files.length}`);

  } catch (error) {
    console.error('💥 Error en la migración:', error);
  } finally {
    await app.close();
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function updateImageUrlInDatabase(
  productsService: ProductsService,
  fileName: string,
  newUrl: string,
) {
  // Implementar lógica para actualizar URLs en la base de datos
  // Esto dependerá de cómo esté estructurado tu ProductsService
  console.log(`   🔄 Actualizando URL en BD: ${fileName}`);
}

// Ejecutar migración
migrateImagesToMinio()
  .then(() => {
    console.log('✨ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
```

**Agregar script al `package.json`:**
```json
{
  "scripts": {
    "migrate:images": "ts-node src/scripts/migrate-images-to-minio.ts"
  }
}
```

**Ejecutar migración:**
```bash
npm run migrate:images
```

### 5.2 Actualizar URLs en Base de Datos
**Ubicación de entidad: `src/products/entities/product-image.entity.ts:12`**

La columna `url` debe cambiar de:
```
http://localhost:3000/api/files/product/abc-123.jpg
```
A:
```
https://your-minio.railway.app/pet-shop-images/abc-123.jpg
```

**Query SQL para actualización masiva (ejecutar después de migración):**
```sql
-- Backup de URLs originales
CREATE TABLE product_images_backup AS SELECT * FROM product_images;

-- Actualizar URLs (ajustar según tu dominio)
UPDATE product_images
SET url = REPLACE(
  url,
  'http://localhost:3000/api/files/product/',
  'https://your-minio.railway.app/pet-shop-images/'
);
```

---

## 🧪 Fase 6: Testing

### 6.1 Tests Unitarios
**Crear: `src/minio-client/minio-client.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MinioClientService } from './minio-client.service';

describe('MinioClientService', () => {
  let service: MinioClientService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioClientService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                MINIO_ENDPOINT: 'localhost',
                MINIO_PORT: '9000',
                MINIO_USE_SSL: 'false',
                MINIO_ACCESS_KEY: 'minioadmin',
                MINIO_SECRET_KEY: 'minioadmin',
                MINIO_BUCKET_NAME: 'test-bucket',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MinioClientService>(MinioClientService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate correct public URL', () => {
    const fileName = 'test-image.jpg';
    const url = service.getPublicUrl(fileName);
    expect(url).toBe('http://localhost/test-bucket/test-image.jpg');
  });

  // Agregar más tests según necesidad
});
```

### 6.2 Tests de Integración
**Crear: `test/files-minio.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Files with MinIO (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/files/product (POST) - Upload image', () => {
    return request(app.getHttpServer())
      .post('/files/product')
      .attach('file', './test/fixtures/test-image.jpg')
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('secureUrl');
        expect(res.body).toHaveProperty('fileName');
      });
  });

  it('/files/product/:imageName (GET) - Get image', async () => {
    // Primero subir una imagen
    const uploadRes = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', './test/fixtures/test-image.jpg');

    const fileName = uploadRes.body.fileName;

    // Luego obtenerla
    return request(app.getHttpServer())
      .get(`/files/product/${fileName}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### 6.3 Pruebas Manuales
**Checklist de pruebas:**

1. **Upload de diferentes formatos**
   - [ ] JPG
   - [ ] PNG
   - [ ] WEBP
   - [ ] GIF

2. **Validaciones**
   - [ ] Rechazar archivos no válidos
   - [ ] Límite de tamaño
   - [ ] Nombres de archivo con caracteres especiales

3. **Funcionalidad**
   - [ ] Subir imagen de producto
   - [ ] Visualizar imagen en frontend
   - [ ] Eliminar producto (verificar que imagen se elimina)
   - [ ] URLs funcionan correctamente

4. **Performance**
   - [ ] Tiempo de upload aceptable
   - [ ] Tiempo de carga de imágenes aceptable
   - [ ] Múltiples uploads simultáneos

---

## 🚀 Fase 7: Deployment

### 7.1 Configuración en Railway

#### Configurar MinIO en Railway
1. Crear nuevo servicio MinIO desde template
2. Anotar credenciales generadas
3. Configurar dominio público
4. Verificar que puerto 9000 está expuesto

#### Configurar Backend en Railway
Variables de entorno necesarias:
```env
MINIO_ENDPOINT=your-minio-app.railway.app
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key-from-railway
MINIO_SECRET_KEY=your-secret-key-from-railway
MINIO_BUCKET_NAME=pet-shop-images
```

### 7.2 Verificaciones Post-Deployment

**Checklist de verificación:**
- [ ] ✅ MinIO está accesible desde internet
- [ ] ✅ Backend puede conectarse a MinIO
- [ ] ✅ Bucket se crea automáticamente al iniciar
- [ ] ✅ Política de bucket está configurada
- [ ] ✅ Subida de imágenes funciona
- [ ] ✅ Descarga/visualización de imágenes funciona
- [ ] ✅ URLs son accesibles públicamente
- [ ] ✅ Performance es aceptable (< 2s para upload)
- [ ] ✅ Logs no muestran errores de conexión
- [ ] ✅ CORS configurado correctamente (si aplica)

### 7.3 Monitoreo

**Métricas a monitorear:**
- Espacio usado en bucket
- Número de objetos almacenados
- Latencia de operaciones
- Errores de conexión
- Tasa de uploads/downloads

**Usar MinIO Console:**
```
https://your-minio-app.railway.app:9001
```

---

## ⚠️ Consideraciones Importantes

### Seguridad

#### ✅ Protección de Credenciales
- Nunca exponer `MINIO_ACCESS_KEY` y `MINIO_SECRET_KEY` en el frontend
- Usar variables de entorno en todos los ambientes
- No commitear archivos `.env` al repositorio

#### ✅ Validación de Archivos
Ya implementado en `src/files/helpers/fileFilter.helper.ts`:
```typescript
export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  }

  callback(null, false);
};
```

#### ✅ Límites de Archivo
Configurar en FileInterceptor:
```typescript
@UseInterceptors(
  FileInterceptor('file', {
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    storage: memoryStorage(),
  }),
)
```

#### ✅ Sanitización de Nombres
Ya implementado en `src/files/helpers/fileNamer.helper.ts`:
```typescript
import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;

  callback(null, fileName);
};
```

### Performance

#### ✅ Streaming para Archivos Grandes
```typescript
// En lugar de cargar todo en memoria
const stream = await minioClient.getObject(bucketName, fileName);
stream.pipe(res);
```

#### ✅ CDN (Opcional para Producción)
Considerar usar CloudFlare o similar frente a MinIO:
```
Usuario -> CloudFlare CDN -> MinIO
```

Ventajas:
- Caché global
- Menor latencia
- Protección DDoS
- Menor carga en MinIO

#### ✅ Compresión de Imágenes
Considerar integrar Sharp para optimizar imágenes antes de subir:
```typescript
import * as sharp from 'sharp';

const optimizedBuffer = await sharp(file.buffer)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Costos y Límites

#### Railway MinIO
- Verificar límites de almacenamiento del plan
- Monitorear uso de ancho de banda
- Considerar upgrade si es necesario

#### Alternativas si crece mucho:
- AWS S3
- CloudFlare R2 (sin costos de egreso)
- Backblaze B2

### Rollback Plan

#### En caso de problemas en producción:

**1. Mantener backup local**
```bash
# No eliminar ./static/products hasta confirmar estabilidad
# Hacer backup adicional
cp -r ./static/products ./static/products-backup-$(date +%Y%m%d)
```

**2. Script de rollback**
```typescript
// src/scripts/rollback-to-local-storage.ts
async function rollbackToLocalStorage() {
  // 1. Revertir URLs en base de datos
  // 2. Copiar archivos de MinIO a local (opcional)
  // 3. Cambiar configuración a usar diskStorage
}
```

**3. Variables de entorno para feature toggle**
```env
USE_MINIO=false  # Cambiar a false para usar almacenamiento local
```

**4. Código con fallback**
```typescript
if (this.configService.get('USE_MINIO') === 'true') {
  // Usar MinIO
} else {
  // Usar almacenamiento local
}
```

---

## 📝 Documentación a Actualizar

### CLAUDE.md
Agregar sección:

```markdown
## MinIO Storage

### Configuración Local

Para desarrollo local con MinIO usando Docker:

\`\`\`bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
\`\`\`

Variables de entorno necesarias:
\`\`\`env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=pet-shop-images
\`\`\`

### Estructura de Buckets

- `pet-shop-images`: Imágenes de productos y servicios

### Comandos Útiles

\`\`\`bash
# Ver archivos en bucket
mc ls minio/pet-shop-images

# Migrar imágenes existentes
npm run migrate:images

# Configurar política pública
mc anonymous set download minio/pet-shop-images
\`\`\`
```

### README.md
Agregar instrucciones:

```markdown
## File Storage with MinIO

This application uses MinIO for cloud object storage.

### Setup

1. Deploy MinIO to Railway (or run locally with Docker)
2. Configure environment variables in `.env`
3. Run the application - bucket will be created automatically

### Local Development

\`\`\`bash
# Start MinIO with Docker
docker-compose up -d minio

# Access MinIO Console
open http://localhost:9001
\`\`\`

### Migration

To migrate existing images from local storage to MinIO:

\`\`\`bash
npm run migrate:images
\`\`\`
```

---

## 🔧 Herramientas Útiles

### MinIO Client (mc)

**Instalación:**
```bash
# macOS
brew install minio/stable/mc

# Linux
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# Windows
# Descargar desde https://min.io/download
```

**Configuración:**
```bash
# Configurar alias para tu MinIO en Railway
mc alias set mypetshop https://your-minio.railway.app ACCESS_KEY SECRET_KEY

# Verificar conexión
mc admin info mypetshop
```

**Comandos útiles:**
```bash
# Listar buckets
mc ls mypetshop

# Crear bucket
mc mb mypetshop/pet-shop-images

# Listar objetos
mc ls mypetshop/pet-shop-images

# Subir archivo
mc cp local-image.jpg mypetshop/pet-shop-images/

# Descargar archivo
mc cp mypetshop/pet-shop-images/image.jpg ./

# Eliminar archivo
mc rm mypetshop/pet-shop-images/image.jpg

# Configurar política pública
mc anonymous set download mypetshop/pet-shop-images

# Ver política
mc anonymous get mypetshop/pet-shop-images

# Ver estadísticas
mc stat mypetshop/pet-shop-images/image.jpg

# Sincronizar directorio local con bucket
mc mirror ./static/products mypetshop/pet-shop-images
```

### Docker Compose para Desarrollo Local

**Crear: `docker-compose.yml`**
```yaml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    container_name: pet-shop-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio-data:
    driver: local
```

**Iniciar:**
```bash
docker-compose up -d minio

# Acceder a la consola
open http://localhost:9001
# Usuario: minioadmin
# Password: minioadmin
```

---

## 📊 Estructura Final del Proyecto

```
src/
├── minio-client/
│   ├── minio-client.module.ts
│   ├── minio-client.service.ts
│   ├── minio-client.service.spec.ts
│   └── interfaces/
│       └── minio-config.interface.ts
├── files/
│   ├── files.controller.ts (modificado)
│   ├── files.service.ts (modificado)
│   ├── files.module.ts (modificado)
│   └── helpers/
│       ├── fileFilter.helper.ts
│       └── fileNamer.helper.ts
├── scripts/
│   ├── migrate-images-to-minio.ts (nuevo)
│   └── rollback-to-local-storage.ts (nuevo)
└── products/
    └── entities/
        └── product-image.entity.ts (sin cambios)

test/
└── files-minio.e2e-spec.ts (nuevo)

.env.template (actualizado)
docker-compose.yml (nuevo)
implementacion_minio_photos.md (este archivo)
```

---

## ✅ Checklist de Implementación

### Configuración Inicial
- [ ] Desplegar MinIO en Railway
- [ ] Obtener credenciales (ACCESS_KEY, SECRET_KEY)
- [ ] Anotar endpoint y puerto
- [ ] Instalar dependencia `minio` y `@types/minio`
- [ ] Actualizar `.env.template` con variables MinIO

### Desarrollo
- [ ] Crear MinioClientModule
- [ ] Crear MinioClientService con todos los métodos
- [ ] Implementar inicialización de bucket en `onModuleInit`
- [ ] Implementar política de bucket pública
- [ ] Refactorizar FilesController (POST endpoint)
- [ ] Refactorizar FilesController (GET endpoint)
- [ ] Refactorizar FilesService
- [ ] Actualizar FilesModule con imports
- [ ] Eliminar helpers de diskStorage (opcional)

### Migración
- [ ] Crear script de migración
- [ ] Probar migración en desarrollo
- [ ] Hacer backup de `./static/products`
- [ ] Ejecutar migración en producción
- [ ] Verificar URLs en base de datos

### Testing
- [ ] Tests unitarios de MinioClientService
- [ ] Tests e2e de uploads
- [ ] Pruebas manuales con diferentes formatos
- [ ] Pruebas de validación
- [ ] Pruebas de performance

### Deployment
- [ ] Configurar variables de entorno en Railway
- [ ] Desplegar backend con cambios
- [ ] Verificar conectividad MinIO
- [ ] Verificar bucket se crea automáticamente
- [ ] Verificar uploads funcionan
- [ ] Verificar visualización de imágenes
- [ ] Monitorear logs

### Documentación
- [ ] Actualizar CLAUDE.md
- [ ] Actualizar README.md
- [ ] Documentar comandos útiles
- [ ] Crear guía de troubleshooting

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to MinIO"
**Solución:**
- Verificar que MINIO_ENDPOINT es correcto
- Verificar que puerto está abierto en Railway
- Verificar credenciales ACCESS_KEY y SECRET_KEY
- Revisar logs de MinIO en Railway

### Problema: "Bucket does not exist"
**Solución:**
- Verificar que `onModuleInit` se ejecuta
- Revisar logs para errores de creación de bucket
- Crear bucket manualmente con `mc mb`
- Verificar permisos de credenciales

### Problema: "Access Denied"
**Solución:**
- Verificar política de bucket
- Verificar credenciales tienen permisos de escritura
- Revisar configuración de SSL/TLS
- Usar `mc anonymous set download` para acceso público

### Problema: "Images not loading in frontend"
**Solución:**
- Verificar URL generada es accesible
- Verificar CORS configurado en MinIO
- Verificar política de bucket permite GET
- Revicar Network tab en DevTools del navegador

### Problema: "Slow upload times"
**Solución:**
- Verificar latencia de red a Railway
- Considerar compresión de imágenes antes de upload
- Verificar límites de bandwidth de Railway
- Considerar usar CDN

---

## 🎯 Próximos Pasos

1. **Comenzar con Fase 1**: Instalar dependencias y configurar variables de entorno
2. **Fase 2**: Implementar MinioClientModule y MinioClientService
3. **Fase 3**: Refactorizar FilesModule para usar MinIO
4. **Fase 4**: Configurar políticas de bucket
5. **Fase 5**: Crear y ejecutar script de migración
6. **Fase 6**: Tests completos
7. **Fase 7**: Deploy a producción

---

## 📚 Referencias

- [MinIO JavaScript Client SDK](https://github.com/minio/minio-js)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Railway MinIO Template](https://railway.app/template/minio)

---

**Autor:** Claude Code
**Fecha:** 2025-11-01
**Versión:** 1.0
