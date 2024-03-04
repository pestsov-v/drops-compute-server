import {
  IBaseOperationAgent,
  IFunctionalityAgent,
  IIntegrationAgent,
  ISchemaAgent,
} from "../agents";
import { NContextService, NSchemaService } from "../services";

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

export interface IAbstractFrameworkAdapter {
  start(schema: NSchemaLoader.Services): Promise<void>;
  stop(): Promise<void>;
}

export namespace NAbstractHttpAdapter {
  import AuthScope = NSchemaService.AuthScope;
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

  export interface PrivateUserEnv<U = any> {
    user: U;
  }

  export interface PrivateOrgEnv<U = any, O = any> {
    user: U;
    organization: O;
  }

  export type SessionEnvs<
    U = any,
    O = any,
    A extends AuthScope = AuthScope
  > = A extends "public:route"
    ? void
    : A extends "private:user"
    ? PrivateUserEnv<U>
    : A extends "private:organization"
    ? PrivateOrgEnv<U, O>
    : never;

  export type Context<
    SESSION_INFO = any,
    ORG_INFO = any,
    AUTH_SCOPE extends NSchemaService.AuthScope = NSchemaService.AuthScope
  > = {
    store: storage["store"];
  } & (AUTH_SCOPE extends "public:route"
    ? {}
    : AUTH_SCOPE extends "private:user"
    ? PrivateUserEnv<SESSION_INFO>
    : AUTH_SCOPE extends "private:organization"
    ? PrivateOrgEnv<SESSION_INFO, ORG_INFO>
    : never);

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
    REQ_BODY = any,
    REQ_PARAMS extends Record<string, string> | void,
    REQ_HEADERS extends StringObject | void,
    REQ_QUERIES extends ModeObject | void,
    RES_BODY extends AnyObject | void,
    RES_HEADERS extends StringObject | void,
    SESSION_INFO extends AnyObject | void,
    ORG_SESSION_INFO extends AnyObject | void,
    AUTH_SCOPE extends NSchemaService.AuthScope,
    RES_FORMAT extends ResponseFormat = ResponseFormat
  > = (
    request: SchemaRequest<REQ_BODY, REQ_PARAMS, REQ_HEADERS, REQ_QUERIES>,
    agents: Agents,
    context: Context<SESSION_INFO, ORG_SESSION_INFO, AUTH_SCOPE>
  ) => Promise<Voidable<SchemaResponse<RES_BODY, RES_HEADERS, RES_FORMAT>>>;

  export type HandlerAlias = Handler<
    any,
    StringObject,
    StringObject,
    ModeObject,
    AnyObject,
    StringObject,
    AnyObject,
    AnyObject
  >;

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
