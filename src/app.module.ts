import { Module, Provider } from '@nestjs/common';
import { UserService } from './UserService';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenericDaoPrima } from './common/GenericDaoPrisma';
import { PrismaService } from './common/PrismaService';
import { UserController } from './controllers/userController';
import { daoMemoryFactory } from './common/genericDaoMemory';
import { IEvent, Invoice } from './Invoice';
import { InvoiceService } from './InvoiceService';
import { InvoiceController } from './controllers/invoiceController';
import { Subject } from 'rxjs';

const dbFactory = (entityName: string): Provider => {
  return {
    provide: `${entityName}DaoPrisma`,
    useFactory: (prismaService: PrismaService) => {
      return new GenericDaoPrima(entityName, prismaService);
    },
    inject: [PrismaService],
  };
};

@Module({
  imports: [],
  controllers: [AppController, UserController, InvoiceController],
  providers: [
    AppService,
    PrismaService,
    dbFactory('user'),
    daoMemoryFactory(Invoice),
    // {
    //   provide: 'userDaoPrima',
    //   useFactory: (prismaService: PrismaService) => {
    //     return new GenericDaoPrima('user', prismaService);
    //   },
    //   inject: [PrismaService],
    // },
    UserService,
    InvoiceService,
    {
      provide: 'event$',
      useFactory: () => {
        return new Subject<IEvent<any>>();
      },
    },
  ],
})
export class AppModule {}
