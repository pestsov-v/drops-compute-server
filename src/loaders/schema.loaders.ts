import { Packages } from "@Packages";
const { injectable } = Packages.inversify;
const { EntitySchema } = Packages.typeorm;

import {
  Typeorm,
  AnyFunction,
  HttpMethod,
  UnknownObject,
  ControllerStructure,
  RouterStructure,
  IBaseOperationAgent,
  IFunctionalityAgent,
  IIntegrationAgent,
  ISchemaAgent,
  ISchemaLoader,
  NAbstractHttpAdapter,
  NMongodbProvider,
  NSchemaLoader,
  NTypeormProvider,
  AnyObject,
  ServiceStructure,
  WsListenerStructure,
  EmitterStructure,
  DictionaryStructure,
  ExtendedRecordObject,
  NLocalizationService,
  NSchemaService,
} from "@Core/Types";
import { container } from "../ioc/core.ioc";
import { CoreSymbols } from "@CoreSymbols";

@injectable()
export class SchemaLoader implements ISchemaLoader {
  private _SERVICES: Map<string, NSchemaLoader.Domains> | undefined;
  private _DOMAINS: NSchemaLoader.Domains | undefined;

  public async init(): Promise<void> {
    this._DOMAINS = new Map<string, NSchemaLoader.DomainStorage>();
    this._SERVICES = new Map<string, NSchemaLoader.Domains>();
  }

  private get _domains(): NSchemaLoader.Domains {
    if (!this._DOMAINS) {
      throw new Error("Domains map not initialize");
    }

    return this._DOMAINS;
  }

  public setBusinessLogic(services: ServiceStructure[]): void {
    services.forEach((service) => {
      service.domains.forEach((domain) => {
        const name = domain.domain;
        const { documents } = domain;

        this._setDomain(name);
        if (documents.router) {
          this._setRoute(name, documents.router);
        }
        if (documents.dictionaries) {
          this._setDictionaries(name, documents.dictionaries);
        }
        if (documents.emitter) {
          this._setEmitter(name, documents.emitter);
        }
        if (documents.wsListener) {
          this._setWsListener(name, documents.wsListener);
        }
        if (documents.typeormSchema) {
          this._setTypeormSchema(name, documents.typeormSchema);
        }
        if (documents.typeormRepo && documents.typeormSchema) {
          this._setTypeormRepository(
            name,
            documents.typeormSchema.model,
            documents.typeormRepo
          );
        }

        if (documents.validators) {
          this._setValidator(name, documents.validators);
        }

        this._applyDomainToService(service.service, domain.domain);
      });
    });
  }

  public get services(): NSchemaLoader.Services {
    if (!this._SERVICES) {
      throw new Error("Services map not initialize");
    }

    return this._SERVICES;
  }

  public async destroy(): Promise<void> {
    this._DOMAINS = undefined;
    this._SERVICES = undefined;
  }

  public get typeormSchemas(): NSchemaLoader.TypeormEntities {
    const entities: NSchemaLoader.TypeormEntities = new Map<
      string,
      Typeorm.EntitySchema<unknown>
    >();
    this.services.forEach((domains) => {
      domains.forEach((storage, domain) => {
        if (storage.typeormSchema && storage.typeormModel) {
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

          const entity = new EntitySchema<unknown>(
            storage.typeormSchema(agents)
          );
          entities.set(storage.typeormModel, entity);
        }
      });
    });

    return entities;
  }

  private _applyDomainToService(service: string, domain: string): void {
    const sStorage = this.services.get(service);
    if (!sStorage) {
      this.services.set(
        service,
        new Map<string, NSchemaLoader.DomainStorage>()
      );
      this._applyDomainToService(service, domain);
      return;
    }

    const dStorage = this._domains.get(domain);
    if (!dStorage) {
      throw new Error(`Domain ${domain} not found`);
    }

    sStorage.set(domain, dStorage);
  }

  private _setEmitter(domain: string, emitter: EmitterStructure<string>): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setEmitter(domain, emitter);
      return;
    }

    for (const event in emitter) {
      const description = emitter[event];
      storage.emitter.set(event, {
        domain: description.domain,
        event: event,
        service: description.service,
        isPrivateUser: description.isPrivateUser,
        isPrivateOrganization: description.isPrivateOrganization,
      });
    }
  }

  private _setWsListener(
    domain: string,
    structure: WsListenerStructure<string>
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setWsListener(domain, structure);
      return;
    }

    for (const listener in structure) {
      storage.wsListeners.set(listener, structure[listener]);
    }
  }

  private _setHelper(domain: string, details: NSchemaLoader.Helper): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setHelper(domain, details);
      return;
    }

    storage.helpers.set(details.name, details.handler);
  }

  private _setDictionaries(
    domain: string,
    dictionaries:
      | DictionaryStructure<string, ExtendedRecordObject>
      | DictionaryStructure<string, ExtendedRecordObject>[]
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setDictionaries(domain, dictionaries);
      return;
    }

    if (Array.isArray(dictionaries)) {
      dictionaries.forEach((dict) => {
        storage.dictionaries.set(dict.language, dict.dictionary);
      });
    } else {
      storage.dictionaries.set(dictionaries.language, dictionaries.dictionary);
    }
  }

  private _setValidator(
    domain: string,
    structure: NSchemaService.ValidatorStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setValidator(domain, structure);
      return;
    }

    for (const handler in structure) {
      const validator = structure[handler];
      if (validator.in) {
        const name = handler + "{{" + "in" + "}}";
        if (storage.validators.has(name)) {
          throw new Error(
            `Validator handler "${handler}" for input params has been exists in domain "${domain}".`
          );
        }
        storage.validators.set(name, {
          scope: "in",
          handler: validator.in,
        });
      }

      if (validator.out) {
        const name = handler + "{{" + "out" + "}}";
        if (storage.validators.has(name)) {
          throw new Error(
            `Validator handler "${handler}" for output params has been exists in domain "${domain}".`
          );
        }
        storage.validators.set(name, {
          scope: "out",
          handler: validator.out,
        });
      }
    }
  }

  private _setMongoRepository<
    T extends string = string,
    H extends string = string,
    A extends UnknownObject = UnknownObject,
    R = void
  >(
    domain: string,
    model: string,
    details: NSchemaLoader.MongoRepoHandler<T, H, A, R>
  ) {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setMongoRepository<T>(domain, model, details);
      return;
    }
    if (!storage.mongoRepoHandlers) {
      storage.mongoRepoHandlers = new Map<string, any>();
    }

    storage.mongoRepoHandlers.set(details.name, details.handler);
  }

  private _setRoute(domain: string, structure: RouterStructure): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setRoute(domain, structure);
      return;
    }

    for (const str in structure) {
      const routes = structure[str];
      for (const method in routes) {
        const description = routes[method as HttpMethod];
        if (description) {
          const name = str + "{{" + method.toUpperCase() + "}}";

          const route = storage.routes.has(name);
          if (route) {
            throw new Error(
              `Route "${str}" with http method "${method}" has been exists in domain "${domain}"`
            );
          }

          storage.routes.set(name, {
            path: str,
            method: method as HttpMethod,
            handler: description.handler,
            scope: description.scope,
            params: description.params,
          });
        }
      }
    }
  }

  private _setMongoSchema<T>(
    domain: string,
    details: NMongodbProvider.SchemaInfo<T>
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setMongoSchema<T>(domain, details);
      return;
    }

    if (!storage.mongoSchema) {
      storage.mongoSchema = details.getSchema;
      storage.mongoModel = details.model;
    } else {
      throw new Error(`Mongo schema for domain ${domain} already exists`);
    }
  }

  private _setTypeormSchema<T>(
    domain: string,
    details: NTypeormProvider.SchemaInfo<T>
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setTypeormSchema<T>(domain, details);
      return;
    }

    if (!storage.mongoSchema) {
      storage.typeormSchema = details.getSchema;
      storage.typeormModel = details.model;
    } else {
      throw new Error(`Mongo schema for domain ${domain} already exists`);
    }
  }

  private _setTypeormRepository<T extends string = string>(
    domain: string,
    model: string,
    details: AnyObject
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setTypeormRepository<T>(domain, model, details);
      return;
    }
    if (!storage.typeormRepoHandlers) {
      storage.typeormRepoHandlers = new Map<string, AnyFunction>();
    }

    for (const name in details) {
      const handler = details[name];
      storage.typeormRepoHandlers.set(name, handler);
    }
  }

  private _setDomain(domain: string): void {
    this._domains.set(domain, {
      routes: new Map<string, NSchemaLoader.Route>(),
      helpers: new Map<string, AnyFunction>(),
      mongoRepoHandlers: new Map<string, AnyFunction>(),
      validators: new Map<string, NSchemaLoader.Validator>(),
      typeormRepoHandlers: new Map<string, AnyFunction>(),
      dictionaries: new Map<string, NLocalizationService.Dictionary>(),
      emitter: new Map<string, NSchemaLoader.Emitter>(),
      wsListeners: new Map<string, AnyFunction>(),
    });
  }
}
