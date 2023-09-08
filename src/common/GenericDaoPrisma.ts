import { Observable, from } from 'rxjs';
import { PrismaService } from './PrismaService';
import { IEntityId, IGenericDao } from './genericDao';

export class GenericDaoPrima<T extends IEntityId> implements IGenericDao<T> {
  constructor(
    private entityName: string,
    private prismaService: PrismaService,
  ) {}

  create(entity: T): Observable<T> {
    const created = this.prismaService[this.entityName].create({
      data: entity,
    });
    return from(created) as any;
  }

  getOne(id: number): Observable<T> {
    const entity = this.prismaService[this.entityName].findFirst({
      where: {
        id,
      },
    });
    return from(entity) as any;
  }

  update(entity: T): Observable<T> {
    const e = this.prismaService[this.entityName].update({
      data: entity,
      where: {
        id: entity.id,
      },
    });
    return from(e) as any;
  }

  getAll(): Observable<T[]> {
    const entities = this.prismaService[this.entityName].findMany();
    return from(entities) as any;
  }

  delete(id: number): Observable<void> {
    throw new Error('Method not implemented.');
  }
}
