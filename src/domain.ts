import { User } from 'prisma/prisma-client';

export interface ICreateUserCmd extends Pick<User, 'name' | 'email'> {}

export interface IUpdateUserCmd extends Pick<User, 'id' | 'name'> {}

export module UserDDD {
  export const value = '';
  export function test(a: string) {}

  export const handleCreate = (self: User, cmd: ICreateUserCmd): User => {
    self.name = cmd.name;
    self.email = cmd.email;
    self.status = 'CREATED';
    return self;
  };

  export const handleUpdate = (self: User, cmd: IUpdateUserCmd): User => {
    if (self.status !== 'CREATED') {
      throw { code: 'illegalState', status: 'CREATED' };
    }
    self.name = cmd.name;
    return self;
  };
}
