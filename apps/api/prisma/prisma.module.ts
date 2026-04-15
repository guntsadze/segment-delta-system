import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // გლობალურია, რომ ყველგან გამოვიყენოთ იმპორტის გარეშე
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}