import { NAbstractHttpAdapter } from "../adapters";

import { AnyFunction, AnyObject, HttpMethod, UnknownObject } from "../utility";
import {
  NMongodbProvider,
  NTypeormProvider,
  NValidatorProvider,
} from "../providers";
import {
  ControllerStructure,
  RouterStructure,
  type ServiceStructure,
  TypeormRepoStructure,
} from "../vendor";
import { Typeorm } from "../packages/packages";
import { NLocalizationService, NSchemaService } from "../services";
import { HandlerAlias } from "../adapters/abstract.framework-adapter";

export interface ISchemaLoader {
  readonly services: NSchemaLoader.Services;
  readonly typeormSchemas: NSchemaLoader.TypeormEntities;

  readonly init(): void;
  readonly destroy(): void;
  readonly setBusinessLogic(services: ServiceStructure[]): void;
}

export namespace NSchemaLoader {
  export type Route = {
    path: string;
    method: HttpMethod;
    handler: NAbstractHttpAdapter.HandlerAlias;
    scope: NSchemaService.AuthScope;
    params?: string[];
  };

  export type Emitter<T extends string = string> = {
    service: string;
    domain: string;
    event: string;
    isPrivateUser?: boolean;
    isPrivateOrganization?: boolean;
  };

  export type MongoRepoHandler<
    T extends string = string,
    H extends string = string,
    A extends UnknownObject,
    R = void
  > = {
    name: T;
    handler: NMongodbProvider.MongooseHandlers<H, A, R>;
  };

  export type HelperHandler<T> = T;
  export type Helper<T extends string = string, H = never> = {
    name: T;
    handler: HelperHandler<H>;
  };

  export type TypeormEntities = Map<string, Typeorm.EntitySchema<unknown>>;

  export type DomainStorage = {
    routes: Map<string, NSchemaLoader.Route>;
    helpers: Map<string, HelperHandler>;
    mongoModel?: string;
    mongoSchema?: NMongodbProvider.SchemaFn<unknown>;
    mongoRepoHandlers: Map<string, AnyFunction>;
    typeormModel?: string;
    typeormSchema?: NTypeormProvider.SchemaFn<unknown>;
    typeormRepoHandlers: Map<string, AnyFunction>;
    validators: Map<string, NSchemaLoader.Validator>;
    dictionaries: Map<string, NLocalizationService.Dictionary>;
    emitter: Map<string, NSchemaLoader.Emitter>;
    wsListeners: Map<string, AnyFunction>;
  };
  export type Domains = Map<string, DomainStorage>;
  export type Services = Map<string, Domains>;
}
