import { IEntityId, IGenericDao } from './genericDao';
import { Provider } from '@nestjs/common';
import { Observable, of } from 'rxjs';

export class GenericDaoMemory<T extends IEntityId> implements IGenericDao<T> {
  private entities: T[] = [];
  create(entity: T): Observable<T> {
    entity.id = Math.floor(Math.random() * 1000);
    this.entities.push(entity);
    return of(entity);
  }

  getOne(id: number): Observable<T> {
    console.log('IDDD ', id);
    console.log('this.entities  ', this.entities.length);

    const found = this.entities.find((p) => p.id == id);
    if (!found) {
      throw { code: 'ENTITY_FOUND' };
    }

    console.log('FOUND ' + found);

    return of(found);
  }

  update(entity: T): Observable<T> {
    const foundIndex = this.entities.findIndex((p) => p.id === entity.id);
    if (foundIndex >= 0) {
      this.entities[foundIndex] = entity;
    }
    return of(entity);
  }

  getAll(): Observable<T[]> {
    return of(this.entities);
  }

  delete(id: number): Observable<void> {
    this.entities.filter((p) => p.id !== id);
    return of(null);
  }
}

export const daoMemoryFactory = (klass: any) => {
  console.log('klass.name:::  ' + klass.name);

  const activityDaoProvider: Provider = {
    provide: `${klass.name}MemoryDao`,
    // useClass: ActivityMemoryDao,
    useFactory: () => {
      // env.prod? new ActivityPrismaDao() :new ActivityMemoryDao();

      // primsa.user.
      //       prsima[klass.name].
      // return new ActivityMemoryDao();
      return new GenericDaoMemory<any>();
    },
    inject: [],
  };
  return activityDaoProvider;
};
