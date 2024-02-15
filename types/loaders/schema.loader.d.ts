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
import { NLocalizationService } from "../services";

export interface ISchemaLoader {
  readonly services: NSchemaLoader.Services;
  readonly typeormSchemas: NSchemaLoader.TypeormEntities;

  readonly init(): void;
  readonly destroy(): void;
  readonly setBusinessLogic(services: ServiceStructure[]): void;
}

export namespace NSchemaLoader {
  export type Route<T extends string = string> = {
    path: string;
    method: HttpMethod;
    handler: T;
    isPrivateUser?: boolean;
    isPrivateOrganization?: boolean;
    params?: string[];
  };

  export type Emitter<T extends string = string> = {
    service: string;
    domain: string;
    event: string;
    isPrivateUser?: boolean;
    isPrivateOrganization?: boolean;
  };

  export type Validator<T = AnyObject> = {
    name: handler;
    handler: NValidatorProvider.ValidateHandler<T>;
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

  export type RouteDocumentationStructure = {
    [key: string]: {
      [key in HttpMethod]: {
        release: string;
        lns: {
          [key: string]: {
            summary?: string;
            description?: string;
          };
        };
      };
    };
  };

  export type RouteLanguageDocumentationStructure = {
    summary?: string;
    description?: string;
  };

  export type RoutesCollectionPayload = {
    release: string;
    languages: Map<string, RouteLanguageDocumentationStructure>;
  };
  export type RoutesCollection = Map<string, RoutesCollectionPayload>;

  export type DocumentationStructure = {
    common?: {
      routes?: RouteDocumentationStructure;
    };
  };

  export type DomainStorage = {
    routes: Map<string, NSchemaLoader.Route>;
    controllers: Map<string, NAbstractHttpAdapter.Handler>;
    helpers: Map<string, HelperHandler>;
    mongoModel?: string;
    mongoSchema?: NMongodbProvider.SchemaFn<unknown>;
    mongoRepoHandlers: Map<string, AnyFunction>;
    typeormModel?: string;
    typeormSchema?: NTypeormProvider.SchemaFn<unknown>;
    typeormRepoHandlers: Map<string, AnyFunction>;
    validators: Map<string, NValidatorProvider.ValidateHandler>;
    dictionaries: Map<string, NLocalizationService.Dictionary>;
    emitter: Map<string, NSchemaLoader.Emitter>;
    wsListeners: Map<string, AnyFunction>;
  };
  export type Domains = Map<string, DomainStorage>;
  export type Services = Map<string, Domains>;
}
