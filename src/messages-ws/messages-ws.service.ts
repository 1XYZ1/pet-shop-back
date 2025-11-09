import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}

/**
 * Servicio para manejo de conexiones WebSocket
 * Gestiona usuarios conectados y autenticación en tiempo real
 */
@Injectable()
export class MessagesWsService {
    // Logger para tracking de conexiones WebSocket
    private readonly logger = new Logger('MessagesWsService');

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}


    /**
     * Registra un nuevo cliente WebSocket
     * @param client - Socket del cliente
     * @param userId - ID del usuario autenticado
     */
    async registerClient( client: Socket, userId: string ) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if ( !user ) {
            this.logger.warn(`Intento de conexión con usuario inexistente: ${userId}`);
            throw new Error('Usuario no encontrado');
        }

        if ( !user.isActive ) {
            this.logger.warn(`Intento de conexión con usuario inactivo: ${user.email}`);
            throw new Error('Usuario no activo');
        }

        // Desconecta sesión anterior si existe
        this.checkUserConnection( user );

        this.connectedClients[client.id] = {
            socket: client,
            user: user,
        };

        this.logger.log(`Cliente conectado: ${user.fullName} (${user.email}) - Socket: ${client.id}`);
    }

    /**
     * Remueve un cliente de la lista de conectados
     * @param clientId - ID del socket a remover
     */
    removeClient( clientId: string ) {
        const client = this.connectedClients[clientId];
        if (client) {
            this.logger.log(`Cliente desconectado: ${client.user.fullName} - Socket: ${clientId}`);
        }
        delete this.connectedClients[clientId];
    }


    getConnectedClients(): string[] {
        return Object.keys( this.connectedClients );
    }


    getUserFullName( socketId: string ) {
        return this.connectedClients[socketId].user.fullName;
    }


    /**
     * Verifica si el usuario ya tiene una conexión activa y la desconecta
     * Implementa política de sesión única por usuario
     * @param user - Usuario a verificar
     * @private
     */
    private checkUserConnection( user: User ) {
        for (const clientId of Object.keys( this.connectedClients ) ) {
            const connectedClient = this.connectedClients[clientId];

            if ( connectedClient.user.id === user.id ){
                this.logger.warn(`Desconectando sesión anterior de ${user.fullName}`);
                connectedClient.socket.disconnect();
                break;
            }
        }
    }

}
