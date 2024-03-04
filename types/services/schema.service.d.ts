import { Joi } from "@Core/Types";

import { IAbstractService } from "./abstract.service";
import { NSchemaLoader, NSpecificationLoader } from "../loaders";
import { AnyObject, HttpMethod, ModeObject, StringObject } from "../utility";
import { NAbstractHttpAdapter } from "../adapters";
import joi from "joi";

export interface ISchemaService extends IAbstractService {
  readonly schema: NSchemaLoader.Services;
  readonly wsListeners: NSchemaLoader.Services;
  readonly specifications: NSpecificationLoader.Services;
  readonly typeormSchemas: NSchemaLoader.TypeormEntities;

  on(event: NSchemaService.Events, listener: () => void): void;
}

export namespace NSchemaService {
  export type ServiceName = "SchemaService";

  export type Config = {
    specificationEnable: boolean;
  };

  export type Events =
    | `services:${ServiceName}:schemas-init`
    | `services:${ServiceName}:schemas-load`
    | `services:${ServiceName}:schemas-error`;

  export type AuthScope =
    | "public:route"
    | "private:user"
    | "private:organization";

  export type RouterSimple<E extends string> = {
    [key in E]: {
      [key in HttpMethod]?: HttpController;
    };
  };

  export type RouteModify<
    E extends Record<string, NAbstractHttpAdapter.Handler>
  > = {
    [key in keyof E]: {
      [M in HttpMethod]?: {
        scope: AuthScope;
        params: string[];
        handler: E[key];
      };
    };
  };

  export type RouterAdvanced = {
    [key: string]: {
      [M in HttpMethod]?: NAbstractHttpAdapter.Handler;
    };
  };

  export type Router<
    R extends
      | string
      | Record<string, NAbstractHttpAdapter.Handler>
      | RouterAdvanced
  > = R extends string
    ? RouterSimple<R>
    : R extends Record<string, NAbstractHttpAdapter.Handler>
    ? RouteModify<R>
    : never;

  export type HttpController<
    REQ_BODY = any,
    REQ_PARAMS extends StringObject | void = void,
    REQ_HEADERS extends StringObject | void = void,
    REQ_QUERIES extends ModeObject | void = void,
    RES_BODY extends AnyObject | void = void,
    RES_HEADERS extends StringObject | void = void,
    USER_SESSION_INFO extends AnyObject | void = void,
    ORG_SESSION_INFO extends AnyObject | void = void,
    AUTH_SCOPE extends AuthScope = AuthScope
  > = {
    scope: AUTH_SCOPE;
    params?: string[];
    handler: NAbstractHttpAdapter.Handler<
      REQ_BODY,
      REQ_PARAMS,
      REQ_HEADERS,
      REQ_QUERIES,
      RES_BODY,
      RES_HEADERS,
      USER_SESSION_INFO,
      ORG_SESSION_INFO,
      AUTH_SCOPE
    >;
  };

  export type ValidateErrors = Array<{
    message: string;
    key?: string;
    value?: string;
  }>;

  export type ValidateHandler = <ARGS>(
    provider: Joi.Joi,
    args: ARGS
  ) => ValidateErrors | void;
  export type ValidateObject<IN = any, OUT = any> = {
    in: IN;
    out: OUT;
  };

  export type ValidateStructureResolver<
    T extends Record<string, ValidateObject>
  > = {
    [K in keyof T]: T[K] extends { in: infer I; out: infer O }
      ? {
          in?: (provider: Joi.Joi, data: I) => ValidateErrors | void;
          out?: (provider: Joi.Joi, data: O) => ValidateErrors | void;
        }
      : T[K];
  };

  export type ValidatorStructure<
    T extends string | Record<string, ValidateObject> =
      | string
      | Record<string, ValidateObject>
  > = T extends string
    ? {
        [key in T]: {
          in?: ValidateHandler;
          out?: ValidateHandler;
        };
      }
    : T extends Record<string, ValidateObject>
    ? ValidateStructureResolver<T>
    : never;
}
