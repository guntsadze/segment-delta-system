import { Module } from '@nestjs/common';
import { CustomerRepository } from 'src/customers/repositories/customer.repository';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  providers: [
    CustomersService,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
