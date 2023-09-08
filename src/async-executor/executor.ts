import {
  Observable,
  Subject,
  catchError,
  map,
  merge,
  mergeMap,
  of,
  share,
  tap,
} from 'rxjs';
import { AsyncExecution } from './execution';

type ExecuteFn<P, D> = (params: P) => Observable<D>;
interface AsyncExecutorConfig {
  concurrency: number;
}
export class AsyncExecutor<P, D> {
  private executions$ = new Subject<AsyncExecution<P, D>>();

  constructor(
    private executeFn: ExecuteFn<P, D>,
    private config: AsyncExecutorConfig,
  ) {
    const state$ = this.initialize().subscribe();
    // state$.subscribe();
  }

  execute(params: P): AsyncExecution<P, D> {
    const execution = new AsyncExecution<P, D>(params);
    this.executions$.next(execution);
    return execution;
  }

  initialize() {
    console.log('this.config.concurrency::: ', this.config.concurrency);

    const state$ = this.executions$.pipe(
      tap((state) => {
        console.log('state', JSON.stringify(state));
      }),
      mergeMap((execution) => {
        const data$ = this.executeFn(execution.params);
        return merge(
          of(execution.setOnProcessing()),
          data$.pipe(
            map((data) => {
              return execution.setOnSucceed(data);
            }),
            catchError((e) => {
              const state = execution.setOnFailed(e);
              return of(state);
            }),
          ),
        );
      }, this.config.concurrency),
    );
    return state$;
  }
}

// =======pa1================pa2==================pa3=================pa4=========================>
// =======pr1==s1f1==========pr2==s2f2============pr3===s3f3==========pr4===s4f4======================>

// =======pa1================pa2=============pa3=================pa4=========================> params$
// =======pr1======================================s1f1================================>execution1
// ==========================pr2===========================s2f2================================>execution2
// ===========================================d======pr3===========================s3f3================>execution3

// ======e1=e==e=e=e=e=e=e=e==============e1(P)========================e1(S)=================================>

//

//  const createExecutor= new AsyncExecutor(

//         (params:string)=>{

//             this.http.get('.....')  :nuber

//         },
//         {
//             concurrency:10
//         }

//  );
//        class EntityDao{
//          create(params):Promise<User>{
//              const execution=  createExecutor.execute(params)

//              return execution.toPromise();

//          }

//         }
