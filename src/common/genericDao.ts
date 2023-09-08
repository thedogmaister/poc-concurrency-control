import { Observable } from 'rxjs';

export interface IEntityId {
  id: number;
}

export interface IGenericDao<T> {
  create(entity: T): Observable<T>;
  getOne(id: number): Observable<T>;
  update(entity: T): Observable<T>;
  getAll(): Observable<T[]>;
  delete(id: number): Observable<void>;
}

// ====i=====f===================>Promise
// ====i=====f|==================>Observable
