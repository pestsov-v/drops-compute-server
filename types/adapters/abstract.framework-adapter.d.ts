import {
  IBaseOperationAgent,
  IFunctionalityAgent,
  IIntegrationAgent,
  ISchemaAgent,
} from "../agents";
import { NContextService, NScramblerService } from "../services";

import { Express, Fastify } from "../packages/packages";
import { StringObject, UnknownObject, Voidable } from "../";
import { NSchemaLoader } from "../loaders";
import { Helpers } from "../providers/schema.provider";

export interface IAbstractFrameworkAdapter {
  start(schema: NSchemaLoader.Services): Promise<void>;
  stop(): Promise<void>;
}

export namespace NAbstractHttpAdapter {
  export type FrameworkKind = "express" | "fastify";
  export type Config = {
    serverTag: string;
    protocol: string;
    host: string;
    port: number;
    urls: {
      api: string;
    };
  };

  export type Request<K extends FrameworkKind> = K extends "express"
    ? Express.Request
    : K extends "fastify"
    ? Fastify.Request
    : never;

  export type Agents = {
    functionalityAgent: IFunctionalityAgent;
    schemaAgent: ISchemaAgent;
    baseAgent: IBaseOperationAgent;
    integrationAgent: IIntegrationAgent;
  };
  export type storage = {
    store: NContextService.Store;
  };

  export type Schema = {
    getHelpers: <D extends string>(domain: D) => Helpers;
    getHelper: <D extends string, H extends string>(
      domain: D,
      helper: H
    ) => NSchemaLoader.HelperHandler;
    getMongoRepository: <T>() => T;
  };

  export type Packages = Record<string, unknown>;

  export type Response<K extends FrameworkKind> = K extends "express"
    ? Express.Response
    : K extends "fastify"
    ? Fastify.Response
    : never;

  export type Instance<K extends FrameworkKind> = K extends "express"
    ? Express.Instance
    : K extends "fastify"
    ? Fastify.Instance
    : never;

  export interface BaseSessionInfo {
    auth: boolean;
  }

  export interface NonAuthSessionInfo extends BaseSessionInfo {
    auth: false;
  }

  export interface AuthSessionInfo<T> extends BaseSessionInfo {
    auth: true;
    info: T & NScramblerService.SessionIdentifiers;
  }

  export type SessionInfo<T = void> = AuthSessionInfo<T> | NonAuthSessionInfo;

  export type Context<T> = {
    storage: storage;
    packages: Packages;
    sessionInfo: SessionInfo<T>;
  };

  export type SchemaRequest<
    BODY = UnknownObject,
    PARAMS extends StringObject = StringObject,
    HEADERS extends StringObject = StringObject,
    K extends FrameworkKind = FrameworkKind
  > = K extends "express"
    ? any
    : K extends "fastify"
    ? Fastify.SchemaRequest<BODY, PARAMS, HEADERS>
    : never;

  export type ResponseFormat = "json" | "redirect" | "status";

  export interface BaseResponsePayload {
    format: ResponseFormat;
    responseType?: string;
    headers?: Record<string, string>;
  }

  export interface RedirectResponsePayload extends BaseResponsePayload {
    format: "redirect";
    type?: "redirect";
    StatusCode?: number;
    url: string;
  }
  export interface StatusResponsePayload extends BaseResponsePayload {
    format: "status";
    statusCode?: number;
  }
  export interface JSONResponsePayload extends BaseResponsePayload {
    format: "json";
    type?: "OK";
    statusCode?: number;
    data?: UnknownObject;
  }

  export type SchemaResponse =
    | RedirectResponsePayload
    | StatusResponsePayload
    | JSONResponsePayload;

  export type Handler = <
    BODY = UnknownObject,
    PARAMS extends StringObject = StringObject,
    HEADERS extends StringObject = StringObject,
    K extends FrameworkKind
  >(
    request: SchemaRequest<BODY, PARAMS, HEADERS, K>,
    agents: Agents,
    context: Context
  ) => Promise<Voidable<SchemaResponse>>;

  export type FailSchemaParameter = "service" | "domain" | "action";

  interface BaseSchemaPayload {
    ok: boolean;
  }
  interface SchemaPayloadFail extends BaseSchemaPayload {
    ok: false;
    message: string;
  }
  interface SchemaPayloadOK extends BaseSchemaPayload {
    ok: true;
    service: string;
    domain: string;
    action: string;
  }

  export type SchemaPayload = SchemaPayloadOK | SchemaPayloadFail;
}
