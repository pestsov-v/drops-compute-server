import { Packages } from "@Packages";
const { injectable } = Packages.inversify;
import { CoreSymbols } from "@CoreSymbols";
import { container } from "../ioc/core.ioc";

import {
  FnObject,
  UnknownObject,
  ISchemaAgent,
  ISchemaProvider,
  KeyStringLiteralBuilder,
  NSchemaLoader,
  NSchemaService,
} from "@Core/Types";

@injectable()
export class SchemaAgent implements ISchemaAgent {
  public getAnotherMongoRepository<T extends FnObject = FnObject>(
    name: string
  ): T {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getAnotherMongoRepository<T>(name);
  }

  public getMongoRepository<T extends FnObject = FnObject>(): T {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getMongoRepository<T>();
  }

  public getAnotherValidator<
    T extends Record<string, NSchemaService.ValidateObject>
  >(name: string): NSchemaService.ValidateArgHandlers<T> {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getAnotherValidator<T>(name);
  }

  public getValidator<
    T extends Record<string, NSchemaService.ValidateObject>
  >(): NSchemaService.ValidateArgHandlers<T> {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getValidator<T>();
  }

  public getAnotherTypeormRepository<T extends FnObject = FnObject>(
    name: string
  ): T {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getAnotherTypeormRepository(name);
  }

  public getTypeormRepository<T extends FnObject = FnObject>(): T {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getTypeormRepository<T>();
  }

  public getAnotherResource<
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
  ): string {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getAnotherResource(domain, resource, substitutions, language);
  }

  public getResource<
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
  ): string {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getResource(resource, substitutions, language);
  }
}
