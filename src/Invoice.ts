import { IEntityId } from './common/genericDao';

interface IInvoiceForm {
  clientDocument: string;
  invoiceType: 'BOLETA' | 'FACTURA';
  date: Date;
  lineas: {
    [key: string]: {
      productId: string;
      amount: number;
    };
  };
}

type AsyncStatus = 'P' | 'S' | 'F';

interface IAsyncState<P, D> {
  status: AsyncStatus;
  data: D;
  params: P;
  error: any;
}

export interface IAsyncCmd<P, D> {
  id: number;
  status: AsyncStatus;
  data: D;
  params: P;
  error: any;
}

export interface IInvoiceClient {
  id: string;
  name: string;
  address: string;
  email: string;
  edad: number;
}

export interface IInvoiceProduct {
  id: string;
  name: string;
  price: number;
}

interface IInvoice extends IEntityId {
  form: IInvoiceForm; // {clientDocument:'ddd'}
  client: IAsyncState<string, IInvoiceClient>; // si cliento >18
  // clientApto: boolean;
  lines: {
    [key: string]: {
      product: IAsyncState<string, IInvoiceProduct>;
    };
  };
  milestones: string[]; // CustomerDocumentSetted, CLientAsyn_S  =
}

export interface IEvent<D> {
  id: number;
  timestamp: Date;
  eventName: string;
  data: D;
  milestones: string[];
}

export interface IAsyncEvent<P, D> extends IEvent<D> {
  status: AsyncStatus;
  params: P;
  error: any;
}

export interface AddProductCmd {
  id: number;
  productId: string;
  cantidad: number;
}

export interface ProductAddedEventData extends AddProductCmd {
  lineId: string;
}

export class Invoice implements IInvoice {
  id: number;
  form: IInvoiceForm;
  client: IAsyncState<string, IInvoiceClient>;
  lines: { [key: string]: { product: IAsyncState<string, IInvoiceProduct> } };
  milestones: string[];

  handleCreate(cmd: any): IEvent<void> {
    this.form = {
      clientDocument: '',
      date: null,
      invoiceType: 'BOLETA',
      lineas: {},
    };
    this.client = {
      data: null,
      error: null,
      params: null,
      status: null,
    };
    this.lines = {};
    const eventName = 'INVOICE_CREATED';
    this.milestones = [eventName];
    return {
      eventName,
      data: null,
      id: null,
      milestones: this.milestones,
      timestamp: new Date(),
    };
  }

  // regresarPrimerPantalla(){
  //  ya pago?
  //  if(yaPago){
  //  throw {...}
  // }
  // }
  //  SetCustomerDocumentCmd
  //   CustomerDocumentSettedEvent
  handleSetCustomerDocument(cmd: any): IEvent<string> {
    console.log('AAAA');

    if (!this.milestones.includes('INVOICE_CREATED')) {
      throw { code: 'IllegalState', entity: '' };
    }
    console.log('bbb');
    this.form.clientDocument = cmd.clientDocument;
    const eventName = 'CustomerDocumentSettedEvent';

    this.milestones = [...this.milestones, eventName];

    return {
      id: cmd.id,
      data: cmd.clientDocument, // { docyment:cmd.docyment, addirional: this.form.... }
      eventName,
      milestones: this.milestones,
      timestamp: new Date(),
    };
  }

  // -------------INIT CustomerAsync------------------------------
  // handleRetrieveCustomerProcessing(cmd: { data: string }) {
  //   if (!this.milestones.includes('CREATED')) {
  //     throw { code: 'IllegalState', entity: '' };
  //   }
  //   this.client.status = 'P';
  //   this.client.params = cmd.data;
  //   return this;
  // }

  // handleRetrieveCustomerSucceed(cmd: { data: IInvoiceClient }) {
  //   if (!this.milestones.includes('CREATED')) {
  //     throw { code: 'IllegalState', entity: '' };
  //   }
  //   this.client.status = 'S';
  //   this.client.data = cmd.data;
  //   return this;
  // }

  // handleRetrieveCustomerFailed(cmd: { error: any }) {
  //   if (!this.milestones.includes('CREATED')) {
  //     throw { code: 'IllegalState', entity: '' };
  //   }
  //   this.client.status = 'F';
  //   this.client.error = cmd.error;
  //   return this;
  // }

  handleClientAsync(
    cmd: IAsyncCmd<string, IInvoiceClient>,
  ): IAsyncEvent<string, IInvoiceClient> {
    if (!this.milestones.includes('INVOICE_CREATED')) {
      throw { code: 'IllegalState', entity: '' };
    }
    const eventName = `ClientAsync_${cmd.status}`;
    this.milestones = [...this.milestones, eventName];
    this.client.data = cmd.data;
    this.client.params = cmd.params;
    this.client.status = cmd.status;
    this.client.error = cmd.error;
    return {
      id: cmd.id,
      data: cmd.data,
      error: cmd.error,
      eventName,
      milestones: this.milestones,
      params: cmd.params,
      status: cmd.status,
      timestamp: new Date(),
    };
  }

  handlAddProduct(cmd: AddProductCmd): IEvent<ProductAddedEventData> {
    if (!this.milestones.includes('INVOICE_CREATED')) {
      throw { code: 'IllegalState', entity: '' };
    }
    if (this.milestones.includes('InvoiceQuotedEvent')) {
      throw { code: 'IllegalState', entity: '' };
    }
    // TODO:
    // if (!this.milestones.includes('CREATED')) { // qe en la primera pantall. No se haya pagado
    //   throw { code: 'IllegalState', entity: '' };
    //   InvoicePagadoEvent
    // }
    // uuid;
    const randomLineId = Math.floor(Math.random() * 1000).toString();
    console.log('randomLineId :::::: ', randomLineId);

    this.form.lineas[randomLineId] = {
      amount: cmd.cantidad,
      productId: cmd.productId,
    };

    this.lines[randomLineId] = {
      product: { data: null, error: null, params: null, status: null },
    };

    const eventName = `InvoiceProductAdded-${randomLineId}`;
    this.milestones = [...this.milestones, eventName];

    return {
      data: {
        cantidad: cmd.cantidad,
        id: cmd.id,
        lineId: randomLineId,
        productId: cmd.productId,
      },
      eventName,
      id: cmd.id,
      milestones: this.milestones,
      timestamp: new Date(),
    };
  }

  handleProducAsync(
    cmd: IAsyncCmd<{ lineId: string; params: string }, IInvoiceProduct>,
  ): IEvent<any> {
    if (
      !this.milestones.includes('INVOICE_CREATED') /*&& cmd.status === 'P'*/
    ) {
      throw { code: 'IllegalState', entity: '' };
    }
    if (this.milestones.includes('InvoiceQuotedEvent')) {
      throw { code: 'IllegalState', entity: '' };
    }
    const { params } = cmd;
    const { lineId } = params;
    console.log('randomLineId |lineId ', lineId);

    // ProductAsync-???-P
    // ProductAsync-P-???

    const eventName = `ProductAsync-${cmd.status}-${lineId}`;
    this.milestones = [...this.milestones, eventName];

    this.lines[lineId].product = {
      data: cmd.data,
      params: cmd.params.params,
      status: cmd.status,
      error: cmd.error,
    };
    this.lines[lineId].product.data = cmd.data;
    this.lines[lineId].product.params = cmd.params.params;
    this.lines[lineId].product.status = cmd.status;
    this.lines[lineId].product.error = cmd.error;

    return {
      data: cmd.data,
      eventName,
      id: cmd.id,
      milestones: this.milestones,
      timestamp: new Date(),
    };
  }

  // --------------END customerAsync-------------------------------

  //

  handlModifyProduct(cmd: {
    id: number;
    lineId: string;
    productId: string;
    amount: number;
  }): IEvent<any> {
    if (!this.milestones.includes('INVOICE_CREATED')) {
      throw { code: 'IllegalState', entity: '' };
    }
    if (this.milestones.includes('InvoiceQuotedEvent')) {
      throw { code: 'IllegalState', entity: '' };
    }
    const eventName = 'ProductModifiedEvent';

    this.milestones = [...this.milestones, eventName];
    return {
      data: {
        lineId: cmd.lineId,
        productId: cmd.productId,
        amount: cmd.amount,
      },
      eventName,
      milestones: this.milestones,
      id: cmd.id,
      timestamp: new Date(),
    };

    // TODO:
    // if (!this.milestones.includes('CREATED')) { // qe en la primera pantall. No se haya pagado
    //   throw { code: 'IllegalState', entity: '' };
    //   InvoicePagadoEvent
    // }
  }
  handlRemoveProduct(cmd: any) {
    if (!this.milestones.includes('INVOICE_CREATED')) {
      throw { code: 'IllegalState', entity: '' };
    }
    if (this.milestones.includes('InvoiceQuotedEvent')) {
      throw { code: 'IllegalState', entity: '' };
    }
    // TODO:
    // if (!this.milestones.includes('CREATED')) { // qe en la primera pantall. No se haya pagado
    //   throw { code: 'IllegalState', entity: '' };
    //   InvoicePagadoEvent
    // }
  }

  handleCompleteCustomerInfo(cmd: {
    id: number;
    birthdDate: string;
    ubigeo: string;
  }): IEvent<any> {
    if (!this.milestones.includes('INVOICE_CREATED')) {
      throw { code: 'IllegalState', entity: '' };
    }
    if (this.milestones.includes('InvoiceQuotedEvent')) {
      throw { code: 'IllegalState', entity: '' };
    }

    if (
      this.milestones.includes('ClientAsync_S') &&
      this.client.data.edad != null
    ) {
      if (cmd.birthdDate != null) {
        throw { code: 'DataNoRequiredException' };
      }
    }
    const eventName = 'CustomerInfoCompletedEvent';
    const milestones = [...this.milestones, eventName];
    return {
      data: { birthData: cmd.birthdDate, ubigeo: cmd.ubigeo },
      eventName,
      milestones,
      id: cmd.id,
      timestamp: new Date(),
    };
  }

  // InvoiceQuotedEvent
  handleQuoteInvoice(cmd: { id: number }): IEvent<any> {
    // CREATED

    if (!this.milestones.includes('ClientAsync_S')) {
      throw { code: 'HasNotOcurredYet', name: 'ClientAsync_S' };
    }
    if (!this.milestones.some((m) => m.startsWith('ProductAsync-S'))) {
      throw { code: 'HasNotOcurredYet', name: 'ProductAsync' };
    }
    const eventName = 'InvoiceQuotedEvent';
    this.milestones = [...this.milestones, eventName];

    return {
      data: { products: this.lines }, // ==> 2pipe... frontend
      eventName,
      id: cmd.id,
      milestones: this.milestones,
      timestamp: new Date(),
    };
  }

  handleRetornarCotizar(cmd: any) {
    if (!this.milestones.includes('InvoiceQuotedEvent')) {
      throw {};
    }
    if (this.milestones.includes('InvoicePagadoEvent')) {
      throw {};
    }
    const eventName = 'QuoteReturnedEvent';

    this.milestones = [...this.milestones, eventName].filter(
      (m) => m === 'InvoiceQuotedEvent',
    );
  }

  handlePagarInvoice() {}
}

//       AddInvoiceProductCmd   {  id:  , productId , cantidad            }
//       ModifyInvoiceProductCmd   {  id: , idLine , productId , cantidad       }
//       RemoveInvoiceProductCmd    {  id }

// class MilestonesUtils{

//   addMiletone(hito:){

//   }

// }

const invoice = {
  form: {
    lines: {
      fff: {
        productId: '',
        quantity: 3,
      },
    },
  },
  clientAsync: {
    status: '',
    data: {},
    error: {},
    params: {},
  },
  milestones: [''],

  lines: {
    fff: {
      productoAsync: {
        status: '',
        data: {},
        error: {},
        params: {},
      },
    },
  },
};

//  no puede cambiar productos, ni cliente si ya pago
//  un menor no puede comprar
//  las boletas no pueden pasar de 700 soles
