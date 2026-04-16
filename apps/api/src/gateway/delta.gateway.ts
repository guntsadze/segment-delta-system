import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // დეველოპმენტისთვის ყველას ვუშვებთ
  },
})
export class DeltaGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger(DeltaGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // როცა ფრონტენდიდან მოვა მოთხოვნა კონკრეტულ სეგმენტზე
  @SubscribeMessage('join-segment')
  handleJoinSegment(client: Socket, segmentId: string) {
    client.join(`segment:${segmentId}`);
    this.logger.log(`Client ${client.id} joined room: segment:${segmentId}`);
  }

  @SubscribeMessage('leave-segment')
  handleLeaveSegment(client: Socket, segmentId: string) {
    client.leave(`segment:${segmentId}`);
  }

  /**
   * მეთოდი, რომელსაც სერვისები გამოიძახებენ დელტას გასაგზავნად
   */
  sendDeltaUpdate(segmentId: string, delta: any) {
    // console.log('🚀 ~ DeltaGateway ~ sendDeltaUpdate ~ delta:', delta);
    // console.log('🚀 ~ DeltaGateway ~ sendDeltaUpdate ~ segmentId:', segmentId);
    this.server.to(`segment:${segmentId}`).emit('segment:delta', delta);
    // ასევე ვასხივებთ ზოგად ივენთს მთავარი გვერდისთვის (მხოლოდ რაოდენობების განსაახლებლად)
    this.server.emit('segment:counts_update', { segmentId, delta });
  }
}
