import { Body, Controller, Get, Post, Sse } from '@nestjs/common';
import { User } from '@prisma/client';
import { Subject, delay, from, of, tap, Observable } from 'rxjs';
import { UserService } from 'src/UserService';
import { AsyncExecutor } from 'src/async-executor/executor';
import { ICreateUserCmd, IUpdateUserCmd } from 'src/domain';

@Controller('/users')
export class UserController {
  subject = new Subject<string>();

  constructor(private userService: UserService) {}

  getPokeApiExecutor = new AsyncExecutor(
    (name: string) => {
      console.log('INIT: ' + name + ' ::: ' + new Date());
      return of({ name }).pipe(
        delay(10000),
        tap(() => {
          console.log('END: ' + name + ' ::: ' + new Date());
        }),
      );
    },
    { concurrency: 2 },
  );

  @Get('/test33')
  test2() {
    const name = Math.floor(Math.random() * 1000).toString();
    return this.getPokeApiExecutor.execute(name).toObs();
    // const pokemon = await execution.toPromise();
    // const end = new Date();
    // console.error('END ' + end + ':: ' + name);
    // console.log(
    //   'transcurrido:  ' +
    //     'name: ' +
    //     name +
    //     (end.getTime() - init.getTime()) / 1000,
    // );
    // return pokemon;
  }

  @Post('/create')
  createUser(@Body() createCmd: ICreateUserCmd): Observable<User> {
    const created = this.userService.create(createCmd);
    return created;
  }

  @Get('/pruebaObs')
  test() {
    this.subject.next('cc');
    console.log('TEST');
    const p = of('TEST').pipe(delay(5000)).toPromise();
    const o = from(p);
    return of('TEST').pipe(delay(5000));
  }

  @Sse()
  sse() {
    return this.subject.asObservable();
  }

  @Post('/update')
  getHello(@Body() cmd: IUpdateUserCmd): Observable<User> {
    const modified = this.userService.update(cmd);
    return modified;
  }

  @Get('/get')
  async getAll() {
    const entities = await this.userService.getAll();
    return entities;
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
