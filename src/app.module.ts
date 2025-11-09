import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';
import { CartModule } from './cart/cart.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PetsModule } from './pets/pets.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { GroomingRecordsModule } from './grooming-records/grooming-records.module';

/**
 * Módulo raíz de la aplicación Pet Shop API
 *
 * Módulos principales:
 * - ProductsModule: Gestión de productos para mascotas (gatos y perros)
 * - ServicesModule: Gestión de servicios de peluquería y veterinaria
 * - AppointmentsModule: Sistema de agendamiento de citas para servicios
 * - PetsModule: Gestión de perfiles de mascotas
 * - MedicalRecordsModule: Historial médico y vacunaciones
 * - GroomingRecordsModule: Historial de sesiones de peluquería
 * - AuthModule: Autenticación y autorización de usuarios
 * - CartModule: Carrito de compras
 * - FilesModule: Manejo de archivos e imágenes
 * - MessagesWsModule: WebSocket para mensajería en tiempo real
 * - SeedModule: Población de base de datos con datos de ejemplo
 * - CommonModule: Utilidades y recursos compartidos
 */
@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
              ? { rejectUnauthorized: false }
              : null,
      },
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),

    // Rate Limiting: Protección contra ataques de fuerza bruta y abuso de endpoints
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,  // 60 segundos (1 minuto)
      limit: 100,  // Máximo 100 requests por minuto por IP
    }]),

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

    MessagesWsModule,

    CartModule,

    ServicesModule,

    AppointmentsModule,

    PetsModule,

    MedicalRecordsModule,

    GroomingRecordsModule,

  ],
  providers: [
    // Aplicar ThrottlerGuard globalmente a todos los endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
