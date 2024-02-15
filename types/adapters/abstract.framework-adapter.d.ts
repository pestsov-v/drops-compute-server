import {
  IBaseOperationAgent,
  IFunctionalityAgent,
  IIntegrationAgent,
  ISchemaAgent,
} from "../agents";
import { NContextService, NScramblerService } from "../services";

import { Express, Fastify } from "../packages/packages";
import {
  AnyObject,
  HttpMethod,
  ModeObject,
  StringObject,
  UnknownObject,
  Voidable,
} from "../";
import { NSchemaLoader } from "../loaders";
import { Helpers } from "../providers/schema.provider";
import { ResponseFormat } from "../../src/.test_schema/domains/test.controller";

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
    QUERIES extends ModeObject | void = ModeObject | void
  > = {
    url: string;
    headers: HEADERS extends StringObject ? HEADERS : void;
    method: HttpMethod;
    path: string;
    params: PARAMS extends StringObject ? PARAMS : void;
    body: BODY;
    query: QUERIES;
  };

  export type ResponseFormat = "json" | "redirect" | "status";

  export type RedirectFormatResponse<
    HEADERS extends Voidable<StringObject> = void
  > = {
    headers?: HEADERS;
    statusCode?: number;
    url: string;
  };
  export type StatusFormatResponse<
    HEADERS extends Voidable<StringObject> = void
  > = {
    headers?: HEADERS;
    statusCode?: number;
  };

  export type JsonFormatType = "OK" | "ERROR" | "EXCEPTION" | "VALIDATION";

  export type JsonFormatResponse<
    BODY = AnyObject,
    HEADERS extends Voidable<StringObject> = void
  > = {
    headers?: HEADERS;
    statusCode?: number;
    type: JsonFormatType;
    data: BODY;
  };

  export type SchemaResponse<
    BODY extends AnyObject | void = void,
    HEADERS extends Voidable<StringObject> = void,
    T extends ResponseFormat = ResponseFormat
  > = {
    format: T;
    payload: ResponsePayload<BODY, HEADERS, T>;
  };
  export type ResponsePayload<
    RESULT extends AnyObject | void = void,
    HEADERS extends Voidable<StringObject> = void,
    T extends ResponseFormat = ResponseFormat
  > = T extends "redirect"
    ? RedirectFormatResponse<HEADERS>
    : T extends "status"
    ? StatusFormatResponse<HEADERS>
    : T extends "json"
    ? JsonFormatResponse<RESULT, HEADERS>
    : never;

  export type Handler<
    REQ_BODY extends UnknownObject | void = UnknownObject | void,
    REQ_PARAMS extends Voidable<StringObject> = Voidable<StringObject> | void,
    REQ_HEADERS extends Voidable<StringObject> = Voidable<StringObject> | void,
    REQ_QUERIES extends Voidable<ModeObject> = Voidable<ModeObject> | void,
    RES_BODY extends Voidable<AnyObject> = Voidable<AnyObject> | void,
    RES_HEADERS extends Voidable<StringObject> = Voidable<StringObject> | void,
    SESSION_INFO extends AnyObject | void = AnyObject | void,
    T extends ResponseFormat = ResponseFormat
  > = (
    request: SchemaRequest<REQ_BODY, REQ_PARAMS, REQ_HEADERS, REQ_QUERIES>,
    agents: Agents,
    context: Context<SESSION_INFO>
  ) => Promise<Voidable<SchemaResponse<RES_BODY, RES_HEADERS, T>>>;

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
