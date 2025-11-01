import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';
import { CartModule } from './cart/cart.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';

/**
 * Módulo raíz de la aplicación Pet Shop API
 *
 * Módulos principales:
 * - ProductsModule: Gestión de productos para mascotas (gatos y perros)
 * - ServicesModule: Gestión de servicios de peluquería y veterinaria
 * - AppointmentsModule: Sistema de agendamiento de citas para servicios
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

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

    MessagesWsModule,

    CartModule,

    ServicesModule,

    AppointmentsModule,

  ],
})
export class AppModule {}
