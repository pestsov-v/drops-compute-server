import { FnObject, UnknownObject } from '../utility';

export interface ISchemaAgent {
  getAnotherMongoRepository<T extends FnObject = FnObject>(name: string): T;
  getMongoRepository<T extends FnObject = FnObject>(): T;
  getValidator<T extends UnknownObject>(): T;
  getAnotherValidator<T>(name: string): T;
  getTypeormRepository<T extends FnObject = FnObject>(): T;
  getAnotherTypeormRepository<T extends FnObject = FnObject>(name: string): T;
  getAnotherResource(
    domain: string,
    resource: string,
    substitutions?: Record<string, string>,
    language?: string
  ): string;
  getResource(resource: string, substitutions?: Record<string, string>, language?: string): string;
}

export namespace NSchemaAgent {}
