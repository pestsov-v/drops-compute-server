import { Packages } from '@Packages';
const { injectable } = Packages.inversify;
import { CoreSymbols } from '@CoreSymbols';
import { container } from '../ioc/core.ioc';

import { FnObject, UnknownObject, ISchemaAgent, ISchemaProvider } from '@Core/Types';

@injectable()
export class SchemaAgent implements ISchemaAgent {
  constructor() {}

  public getAnotherMongoRepository<T extends FnObject = FnObject>(name: string): T {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getAnotherMongoRepository<T>(name);
  }

  public getMongoRepository<T extends FnObject = FnObject>(): T {
    return container.get<ISchemaProvider>(CoreSymbols.SchemaProvider).getMongoRepository<T>();
  }

  public getAnotherValidator<T>(name: string): T {
    return container.get<ISchemaProvider>(CoreSymbols.SchemaProvider).getAnotherValidator<T>(name);
  }

  public getValidator<T extends UnknownObject>(): T {
    return container.get<ISchemaProvider>(CoreSymbols.SchemaProvider).getValidator<T>();
  }

  public getAnotherTypeormRepository<T extends FnObject = FnObject>(name: string): T {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getAnotherTypeormRepository(name);
  }

  public getTypeormRepository<T extends FnObject = FnObject>(): T {
    return container.get<ISchemaProvider>(CoreSymbols.SchemaProvider).getTypeormRepository<T>();
  }

  public getAnotherResource(
    domain: string,
    resource: string,
    substitutions?: Record<string, string>,
    language?: string
  ): string {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getAnotherResource(domain, resource, substitutions, language);
  }

  public getResource(
    resource: string,
    substitutions?: Record<string, string>,
    language?: string
  ): string {
    return container
      .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .getResource(resource, substitutions, language);
  }
}
