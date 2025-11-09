import { existsSync } from 'fs';
import { join } from 'path';

import { Injectable, BadRequestException, Logger } from '@nestjs/common';

/**
 * Servicio para manejo de archivos estáticos
 * Gestiona la recuperación de imágenes de productos y mascotas
 */
@Injectable()
export class FilesService {
    // Logger para tracking de operaciones de archivos
    private readonly logger = new Logger('FilesService');

    /**
     * Obtiene la ruta de una imagen de producto
     * @param imageName - Nombre del archivo de imagen
     * @returns Ruta absoluta del archivo
     */
    getStaticProductImage( imageName: string ) {
        const path = join( __dirname, '../../static/products', imageName );

        if ( !existsSync(path) ) {
            this.logger.warn(`Imagen de producto no encontrada: ${imageName}`);
            throw new BadRequestException(`No se encontró la imagen del producto: ${imageName}`);
        }

        this.logger.debug(`Imagen de producto recuperada: ${imageName}`);
        return path;
    }

    /**
     * Obtiene la ruta de una imagen de mascota
     * @param imageName - Nombre del archivo de imagen
     * @returns Ruta absoluta del archivo
     */
    getStaticPetImage( imageName: string ) {
        const path = join( __dirname, '../../static/pets', imageName );

        if ( !existsSync(path) ) {
            this.logger.warn(`Imagen de mascota no encontrada: ${imageName}`);
            throw new BadRequestException(`No se encontró la imagen de la mascota: ${imageName}`);
        }

        this.logger.debug(`Imagen de mascota recuperada: ${imageName}`);
        return path;
    }
}
