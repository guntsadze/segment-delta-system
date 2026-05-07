import { Module } from '@nestjs/common';
import { PrismaCustomerRepository } from 'src/customers/repositories/prisma-customer.repository';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  providers: [
    CustomersService,
    {
      provide: 'ICustomerRepository',
      useClass: PrismaCustomerRepository,
    },
  ],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
