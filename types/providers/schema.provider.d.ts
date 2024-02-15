import { NSchemaLoader } from "../loaders";
import { FnObject, UnknownObject } from "../utility";

export interface ISchemaProvider {
  getMongoRepository<T extends FnObject = FnObject>(): T;
  getAnotherMongoRepository<T extends FnObject = FnObject>(name: string): T;
  getValidator<T extends UnknownObject>(): T;
  getAnotherValidator<T>(name: string): T;
  getTypeormRepository<T>(): T;
  getAnotherTypeormRepository<T>(name: string): T;
  getResource(
    resource: string,
    substitutions?: Record<string, string> | undefined | null,
    language?: string
  ): string;
  getAnotherResource(
    name: string,
    resource: string,
    substitutions?: Record<string, string> | undefined | null,
    language?: string
  ): string;
}

export namespace NSchemaProvider {
  export type Helpers = Map<string, NSchemaLoader.HelperHandler>;
}
