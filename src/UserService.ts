import { Inject, Injectable } from '@nestjs/common';
import { User } from 'prisma/prisma-client';
import { IGenericDao } from './common/genericDao';
import { ICreateUserCmd, IUpdateUserCmd, UserDDD } from './domain';
import { map, mergeMap } from 'rxjs';

@Injectable()
export class UserService {
  constructor(@Inject('userDaoPrisma') private userDao: IGenericDao<User>) {}

  create(cmd: ICreateUserCmd) {
    const user: User = {} as any;
    UserDDD.handleCreate(user, cmd);
    return this.userDao.create(user);
  }

  update(cmd: IUpdateUserCmd) {
    const user$ = this.userDao.getOne(cmd.id).pipe(
      map((user) => UserDDD.handleUpdate(user, cmd)),
      mergeMap((user) => {
        return this.userDao.update(user);
      }),
    );
    return user$;
    // throw entityNotFound
  }

  async getAll() {
    return this.userDao.getAll();
  }
}
