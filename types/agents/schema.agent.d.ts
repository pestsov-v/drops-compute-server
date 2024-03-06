import { FnObject, KeyStringLiteralBuilder, UnknownObject } from "../utility";
import { NSchemaLoader } from "../loaders";
import { NSchemaService } from "../services";

export interface ISchemaAgent {
  getAnotherMongoRepository<D extends string, T extends FnObject = FnObject>(
    domain: D
  ): T;
  getMongoRepository<T extends FnObject = FnObject>(): T;
  getValidator<
    T extends Record<string, NSchemaService.ValidateObject>
  >(): NSchemaService.ValidateArgHandlers<T>;
  getAnotherValidator<
    D extends string,
    T extends Record<string, NSchemaService.ValidateObject>
  >(
    domain: D
  ): NSchemaService.ValidateArgHandlers<T>;
  getTypeormRepository<T extends FnObject = FnObject>(): T;
  getAnotherTypeormRepository<D extends string, T extends FnObject = FnObject>(
    domain: D
  ): T;
  getAnotherResource<
    D extends string,
    DICT extends Record<string, unknown>,
    SUBS extends Record<string, string> | undefined | null =
      | Record<string, string>
      | undefined
      | null,
    L extends string = string
  >(
    domain: D,
    resource: KeyStringLiteralBuilder<DICT>,
    substitutions?: SUBS,
    language?: L
  ): string;
  getResource<
    D extends Record<string, unknown>,
    SUBS extends Record<string, string> | undefined | null =
      | Record<string, string>
      | undefined
      | null,
    L extends string = string
  >(
    resource: KeyStringLiteralBuilder<D>,
    substitutions?: SUBS,
    language?: L
  ): string;
}

export namespace NSchemaAgent {}
