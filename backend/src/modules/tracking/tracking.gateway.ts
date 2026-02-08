import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  // TODO M3-BE-05: Implement WebSocket tracking
  // 1. Handle driver:location event
  // 2. Broadcast to room order:{orderId}
  // 3. Handle tracking:subscribe event (join room)
  // 4. Use query param token for auth

  @SubscribeMessage('tracking:subscribe')
  handleSubscribe(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `order:${data.orderId}`;
    client.join(room);
    console.log(`[Tracking] Client ${client.id} subscribed to ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('driver:location')
  handleDriverLocation(
    @MessageBody() data: { orderId: string; lat: number; lng: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `order:${data.orderId}`;
    this.server.to(room).emit('location:update', {
      orderId: data.orderId,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });
    console.log(`[Tracking] Location update broadcast to ${room}: ${data.lat}, ${data.lng}`);
  }
}
