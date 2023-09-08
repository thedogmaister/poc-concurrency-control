import { Observable, Subject } from 'rxjs';

type AsyncExecutionStatus = 'PROCESSING' | 'SUCCEED' | 'FAILED';

type AsyncExecutionState<P, D> = {
  params: P;
  data: D;
  status: AsyncExecutionStatus;
  error: any;
};

export class AsyncExecution<P, D> {
  private state$ = new Subject<AsyncExecutionState<P, D>>();

  constructor(public params: P) {}

  setOnProcessing(): AsyncExecutionState<P, D> {
    const state: AsyncExecutionState<P, D> = {
      data: null,
      error: null,
      params: this.params,
      status: 'PROCESSING',
    };
    console.log('setOnProcessing: ', JSON.stringify(state));

    this.state$.next(state);
    return state;
  }

  setOnSucceed(data: D): AsyncExecutionState<P, D> {
    const state: AsyncExecutionState<P, D> = {
      data,
      error: null,
      params: null,
      status: 'SUCCEED',
    };
    console.log('setOnSucceed: ', JSON.stringify(state));
    console.log('7');

    this.state$.next(state);
    this.state$.complete();

    return state;
  }

  setOnFailed(error: any): AsyncExecutionState<P, D> {
    const state: AsyncExecutionState<P, D> = {
      data: null,
      error,
      params: null,
      status: 'FAILED',
    };
    this.state$.next(state);
    this.state$.complete();

    console.log('setOnFailed: ', JSON.stringify(state));

    return state;
  }

  setOnRetry() {}

  toPromise(): Promise<D> {
    return new Promise((resolve, reject) => {
      this.state$.subscribe((state) => {
        console.log('state', JSON.stringify(state));

        if (state.status == 'SUCCEED') {
          resolve(state.data);
        }
        if (state.status == 'FAILED') {
          reject(state.error);
        }
      });
    });
  }

  toObs(): Observable<D> {
    return new Observable((observer) => {
      this.state$.subscribe((state) => {
        console.log('state', JSON.stringify(state));

        if (state.status == 'SUCCEED') {
          observer.next(state.data);
          observer.complete();
        }
        if (state.status == 'FAILED') {
          observer.error(state.error);
          observer.complete;
        }
      });
    });
  }

  // =========p=====r==r===r=====sf|===================================>state$
  // ===========================sf|===================================>promise
}
