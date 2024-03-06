import { Packages, joi } from "@Packages";

const { injectable, inject } = Packages.inversify;
import { CoreSymbols } from "@CoreSymbols";
import { container } from "../ioc/core.ioc";

import {
  AnyFunction,
  FnObject,
  IContextService,
  IFunctionalityAgent,
  ISchemaProvider,
  ITypeormProvider,
  NLocalizationService,
  NAbstractHttpAdapter,
  ISchemaAgent,
  IBaseOperationAgent,
  IIntegrationAgent,
  NSchemaService,
} from "@Core/Types";
import { Guards } from "@Guards";

@injectable()
export class SchemaProvider implements ISchemaProvider {
  constructor(
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public getAnotherMongoRepository<T>(name: string): T {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error("Service not found");
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error("Domain not found");
    }

    const mongoRepository = domain.mongoRepoHandlers;
    if (!mongoRepository) {
      throw new Error("Mongo repository not found");
    }

    class Repository {
      private readonly _handlers: Map<string, AnyFunction>;

      constructor(handlers: Map<string, AnyFunction>) {
        this._handlers = handlers;

        for (const [name] of this._handlers) {
          Object.defineProperty(this, name, {
            value: async (...args: any[]) => this._runMethod(name, ...args),
            writable: true,
            configurable: true,
          });
        }
      }

      private _runMethod(method: string, ...args: any[]): any {
        const handler = this._handlers.get(method);
        const mongoose = container.get<IFunctionalityAgent>(
          CoreSymbols.FunctionalityAgent
        ).mongoose;

        return handler ? handler(mongoose, ...args) : undefined;
      }
    }

    return new Repository(mongoRepository) as T;
  }

  public getMongoRepository<T extends FnObject = FnObject>(): T {
    return this.getAnotherMongoRepository<T>(this._contextService.store.domain);
  }

  public getAnotherValidator<
    T extends Record<string, NSchemaService.ValidateObject>
  >(name: string): NSchemaService.ValidateArgHandlers<T> {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error("Service not found");
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error("Domain not found");
    }

    const validators = domain.validators;
    if (!validators) {
      throw new Error("Validator not found");
    }

    class Validator {
      private readonly _handlers: Map<
        string,
        NSchemaService.ValidateResolverHandler
      >;

      constructor(
        handlers: Map<string, NSchemaService.ValidateResolverHandler>
      ) {
        this._handlers = handlers;

        for (const [name] of this._handlers) {
          Object.defineProperty(this, name, {
            value: (args: any) => this._runMethod(name, args),
            writable: true,
            configurable: true,
          });
        }
      }

      private _runMethod(name: string, args: any[]): any {
        const handler = this._handlers.get(name);

        const schemaAgent = container.get<ISchemaAgent>(
          CoreSymbols.SchemaAgent
        );

        const localization = {
          getResource: schemaAgent.getResource,
          getAnotherResource: schemaAgent.getAnotherResource,
        };

        return handler ? handler(joi, localization, args) : undefined;
      }
    }

    return new Validator(
      validators
    ) as unknown as NSchemaService.ValidateArgHandlers<T>;
  }

  public getValidator<
    T extends Record<string, NSchemaService.ValidateObject>
  >(): NSchemaService.ValidateArgHandlers<T> {
    return this.getAnotherValidator<T>(this._contextService.store.domain);
  }

  public getAnotherTypeormRepository<T>(name: string): T {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error("Service not found");
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error("Domain not found");
    }

    const handlers = domain.typeormRepoHandlers;
    if (!handlers) {
      throw new Error("Typeorm repository handlers not found");
    }

    class Repository<T> {
      private readonly _handlers: Map<string, AnyFunction>;

      constructor(handlers: Map<string, AnyFunction>) {
        this._handlers = handlers;

        for (const [name] of this._handlers) {
          Object.defineProperty(this, name, {
            value: (...args: any[]) => this._runMethod(name, ...args),
            writable: true,
            configurable: true,
          });
        }
      }

      private _runMethod(method: string, ...args: any[]): any {
        const handler = this._handlers.get(method);
        if (handler && domain && domain.typeormModel) {
          const agents: NAbstractHttpAdapter.Agents = {
            functionalityAgent: container.get<IFunctionalityAgent>(
              CoreSymbols.FunctionalityAgent
            ),
            schemaAgent: container.get<ISchemaAgent>(CoreSymbols.SchemaAgent),
            baseAgent: container.get<IBaseOperationAgent>(
              CoreSymbols.BaseOperationAgent
            ),
            integrationAgent: container.get<IIntegrationAgent>(
              CoreSymbols.IntegrationAgent
            ),
          };

          const validator = container
            .get<ITypeormProvider>(CoreSymbols.TypeormProvider)
            .getRepository(domain.typeormModel);
          return handler(validator, agents, ...args);
        }
      }
    }

    return new Repository<T>(handlers) as T;
  }

  public getTypeormRepository<T>(): T {
    return this.getAnotherTypeormRepository<T>(
      this._contextService.store.domain
    );
  }

  public getAnotherResource(
    name: string,
    resource: string,
    substitutions?: Record<string, string>,
    language?: string
  ): string {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error(`Service "${service}" not found`);
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error(`Domain "${domain}" not found`);
    }

    const dictionaries = domain.dictionaries;
    if (!dictionaries) {
      throw new Error(`Dictionaries not found`);
    }

    let dictionary: NLocalizationService.Dictionary;
    if (language) {
      dictionary = dictionaries.get(language);
    } else {
      dictionary = dictionaries.get(store.language);
    }

    const resources = resource.split(":");
    let record: NLocalizationService.DictionaryRecord = dictionary;

    if (resources.length > 1) {
      for (const key of resources) {
        if (!Guards.isString(record)) {
          record = record[key];

          if (typeof record === "undefined") {
            // TODO: implement localization error
            throw new Error("Resource not found");
          }
        } else {
          return record;
        }
      }
      if (substitutions) {
        for (const substitution in substitutions) {
          record = record.replace(
            "{{" + substitution + "}}",
            substitutions[substitution]
          );
        }
      }
    } else {
      return record;
    }

    return record;
  }

  public getResource(
    resource: string,
    substitutions?: Record<string, string>,
    language?: string
  ): string {
    const store = this._contextService.store;

    return this.getAnotherResource(
      store.domain,
      resource,
      substitutions,
      language
    );
  }
}
