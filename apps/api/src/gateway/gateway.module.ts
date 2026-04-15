import { Module, Global } from '@nestjs/common';
import { DeltaGateway } from './delta.gateway';

@Global() // გლობალური ვხდით, რომ ყველგან შეგვეძლოს მისი გამოყენება
@Module({
  providers: [DeltaGateway],
  exports: [DeltaGateway],
})
export class GatewayModule {}