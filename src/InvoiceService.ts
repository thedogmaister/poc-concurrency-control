import { Inject, Injectable } from '@nestjs/common';
import { Subject, delay, map, mergeMap, of, tap } from 'rxjs';
import {
  IAsyncCmd,
  IAsyncEvent,
  IEvent,
  IInvoiceClient,
  IInvoiceProduct,
  Invoice,
} from './Invoice';
import { IGenericDao } from './common/genericDao';

//  POST /completePendingInfo => { birthdate, ubigeo}
export module ObfuscateEvent {
  export const convertCustomer = (data: any) => {
    const { address, email, id, name, edad } = data;

    console.log('FFFFFFFFFFF  ', data);

    // {"address":"ddd","email":"ddd","id":"dsd","name":"dddddd","edad":15}
    // const ubigeoRequired = data.ubigeo === null;
    // const birthdateRequired = data.fechaNacimiento === null;

    // const newData2 = { ubigeoRequired, birthdateRequired };

    return {
      address: '****',
      email: '***',
      name,
      requireBirthdate: edad == null,
    };
  };
}

const transformEvent = (event: IEvent<any>): IEvent<any> => {
  switch (event.eventName) {
    case 'CustomerDocumentSettedEvent':
      // "er9t0e9rte"=>"*********"
      const newData = 'event.data******';
      console.log('DDDDDD' + event.data);

      const obfuscatedEvent: IEvent<any> = { ...event, data: newData };
      return obfuscatedEvent;

    case 'ClientAsync_P': // =>params {}
      const asyncEvent = event as IAsyncEvent<any, any>;
      const newParams = asyncEvent.params;
      const obfuscatedEvent2: IAsyncEvent<any, any> = {
        ...asyncEvent,
        params: newParams,
      };
      return obfuscatedEvent2;

    case 'ClientAsync_S': // =>params {}
      const asyncEvent2 = event as IAsyncEvent<any, any>;
      const newData2 = ObfuscateEvent.convertCustomer(asyncEvent2.data);
      const obfuscatedEvent4: IAsyncEvent<any, any> = {
        ...asyncEvent2,
        data: newData2,
      };
      return obfuscatedEvent4;
  }

  // ProductAsync-P...
  if (event.eventName.startsWith('ProductAsync-P')) {
  }

  if (event.eventName.startsWith('ProductAsync-S')) {
  }

  return event;
};

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('InvoiceMemoryDao') private invoiceDao: IGenericDao<Invoice>,
    @Inject('event$') private event$: Subject<IEvent<any>>, //
  ) {}

  create(cmd: any) {
    const invoice = new Invoice();
    invoice.handleCreate(cmd);
    return this.invoiceDao.create(invoice);
  }

  setDocument(cmd: { id: number; document: string }) {
    return this.invoiceDao
      .getOne(cmd.id)
      .pipe(
        map((entity) => ({
          entity,
          event: entity.handleSetCustomerDocument(cmd),
        })),
        mergeMap(({ entity, event }) =>
          this.invoiceDao
            .update(entity)
            .pipe(map((entity) => ({ entity, event }))),
        ),
        map(({ event }) => ({ event, obfuscatedEvent: transformEvent(event) })),
        tap(({ obfuscatedEvent }) => this.event$.next(obfuscatedEvent)),
      )
      .pipe(
        tap(({ event }) => {
          const { id } = event;
          this.setClientAsync({
            id,
            data: null,
            error: null,
            params: cmd.document,
            status: 'P',
          }).subscribe();

          of({})
            .pipe(
              delay(10000),
              tap(() => {
                this.setClientAsync({
                  id,
                  data: {
                    address: 'ddd',
                    email: 'ddd',
                    id: 'dsd',
                    name: 'dddddd',
                    edad: 15,
                  },
                  error: null,
                  params: cmd.document,
                  status: 'S',
                }).subscribe(() => {});
              }),
            )
            .subscribe();
        }),
      )
      .pipe(map(({ obfuscatedEvent }) => obfuscatedEvent));
  }

  addProduct(cmd: { id: number; productId: string; cantidad: number }) {
    return this.invoiceDao
      .getOne(cmd.id)
      .pipe(
        map((entity) => ({ entity, event: entity.handlAddProduct(cmd) })),
        mergeMap(({ entity, event }) =>
          this.invoiceDao
            .update(entity)
            .pipe(map((entity) => ({ entity, event }))),
        ),
        map(({ event }) => ({ event, obfuscatedEvent: transformEvent(event) })),
        tap(({ obfuscatedEvent }) => this.event$.next(obfuscatedEvent)),
      )
      .pipe(
        tap(async ({ event }) => {
          const { data } = event;
          const { lineId } = data;
          this.setProducAsync({
            data: null,
            error: null,
            id: cmd.id,
            params: {
              lineId,
              params: cmd.productId,
            },
            status: 'P',
          }).subscribe();

          const product = await of({
            id: '1',
            name: 'ddddd',
            price: 4,
          } as IInvoiceProduct)
            .pipe(delay(4000))
            .toPromise();

          this.setProducAsync({
            data: product,
            error: null,
            id: cmd.id,
            params: {
              lineId,
              params: '',
            },
            status: 'S',
          }).subscribe();
        }),
      )
      .pipe(map(({ obfuscatedEvent }) => obfuscatedEvent));
  }

  setProducAsync(
    cmd: IAsyncCmd<{ lineId: string; params: string }, IInvoiceProduct>,
  ) {
    return this.invoiceDao
      .getOne(cmd.id)
      .pipe(
        map((entity) => ({ entity, event: entity.handleProducAsync(cmd) })),
        mergeMap(({ entity, event }) =>
          this.invoiceDao
            .update(entity)
            .pipe(map((entity) => ({ entity, event }))),
        ),
        tap(({ event }) => this.event$.next(event)),
        map(({ event }) => event),
      )
      .pipe(tap((event) => {}));
  }

  setClientAsync(cmd: IAsyncCmd<string, IInvoiceClient>) {
    return this.invoiceDao
      .getOne(cmd.id)
      .pipe(
        map((entity) => ({ entity, event: entity.handleClientAsync(cmd) })),
        mergeMap(({ entity, event }) =>
          this.invoiceDao
            .update(entity)
            .pipe(map((entity) => ({ entity, event }))),
        ),
        map(({ event }) => ({ event, obfuscatedEvent: transformEvent(event) })),
        tap(({ obfuscatedEvent }) => this.event$.next(obfuscatedEvent)),
      )
      .pipe(tap(({ event }) => {}))
      .pipe(map(({ event }) => event));
  }

  getAll() {
    return this.invoiceDao.getAll();
  }
}
