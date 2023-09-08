import { Body, Controller, Get, Inject, Post, Sse } from '@nestjs/common';
import { Observable, Subject, map } from 'rxjs';
import { IEvent, Invoice } from 'src/Invoice';
import { InvoiceService } from 'src/InvoiceService';
import { ICreateUserCmd } from 'src/domain';
@Controller('/invoices')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    @Inject('event$') private event$: Subject<IEvent<any>>, //
  ) {}

  @Sse('sse')
  sse(): Observable<string> {
    return this.event$.asObservable().pipe(
      // map((e) => {
      //   if (e.eventName === '') {
      //   }
      //   if (e.eventName === '') {
      //   }
      //   if (e.eventName === '') {
      //   }
      //   if (e.eventName === '') {
      //   }
      // }),

      // filter...
      map((e) => JSON.stringify(e)),
    );
  }

  @Post('/create')
  createUser(@Body() createCmd: ICreateUserCmd): Observable<Invoice> {
    const created = this.invoiceService.create(createCmd);
    return created;
  }

  @Post('/setCustomerDocument')
  getHello(
    @Body() cmd: { id: number; document: string },
  ): Observable<IEvent<any>> {
    const modified = this.invoiceService.setDocument(cmd);
    return modified;
  }
  // uuid
  @Post('/addProduct')
  addProduct(
    @Body() cmd: { id: number; productId: string; cantidad: number },
  ): Observable<IEvent<any>> {
    return this.invoiceService.addProduct(cmd).pipe();
  }

  @Get('/get')
  getAll() {
    return this.invoiceService.getAll();
  }

  // @Get('/modifyDate/:id')
  // async modifyDate(@Param('id') id: number): Promise<Activity> {
  //   console.log('IDDD', id);
  //   // const entity=  prisma.user.findOne({})
  //   //  entity.name=body.name
  //   //  entity.status=body.status

  //   // prisma.user.update(entity)

  //   // const id2 = Number.parseInt(id);
  //   // console.log('id2', id2);

  //   const modifyActivityDateCmd: IModifyActivityDateCmd = {
  //     id,
  //     date: 40,
  //   };
  //   const created = await this.activityService.handleModifyDate(
  //     modifyActivityDateCmd,
  //   );
  //   return created;
  // }
}
