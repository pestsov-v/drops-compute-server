import {
  AnyObject,
  ExtendedRecordObject,
  HttpMethod,
  ModeObject,
  StringObject,
  UnknownObject,
  Voidable,
} from "../utility";
import { NSessionService } from "../services";
import { NTypeormProvider } from "../providers";
import { NDocumentationLoader } from "../loaders";
import { NAbstractHttpAdapter } from "../adapters";
import { Typeorm } from "../packages/packages";

export type Controller<
  REQ_BODY extends UnknownObject | void = UnknownObject | void,
  REQ_PARAMS extends Voidable<StringObject> = Voidable<StringObject> | void,
  REQ_HEADERS extends Voidable<StringObject> = Voidable<StringObject> | void,
  REQ_QUERIES extends Voidable<ModeObject> = Voidable<ModeObject> | void,
  RES_BODY extends Voidable<AnyObject> = Voidable<AnyObject> | void,
  RES_HEADERS extends Voidable<StringObject> = Voidable<StringObject> | void,
  SESSION_INFO extends AnyObject | void = AnyObject | void
> = NAbstractHttpAdapter.Handler<
  REQ_BODY,
  REQ_PARAMS,
  REQ_HEADERS,
  REQ_QUERIES,
  RES_BODY,
  RES_HEADERS,
  SESSION_INFO
>;

export type ControllerStructure<
  T extends Record<string, Controller> = Record<string, Controller>
> = {
  [key in keyof T]: T[key];
};
export type RouterStructure<
  T extends string,
  C extends Record<string, Controller>
> = {
  [key in T]: {
    [key in HttpMethod]?: {
      handler: keyof C;
      isPrivateUser?: boolean;
      isPrivateOrganization?: boolean;
      params?: string[];
    };
  };
};

export type WsListenerStructure<T extends string> = {
  [key in T]: NSessionService.WsListener;
};

export type EmitterStructure<E extends string> = {
  [key in E]: {
    type: NSessionService.ServerEventType | NSessionService.ServerEventType[];
    service: string;
    domain: string;
    isPrivateUser?: boolean;
    isPrivateOrganization?: boolean;
  };
};

export type DictionaryStructure<
  L extends string,
  D extends ExtendedRecordObject
> = {
  language: L;
  dictionary: D;
};

export type TypeormSchemaStructure<T extends string, S> = {
  model: T;
  getSchema: NTypeormProvider.SchemaFn<S>;
};

export type TypeormRequester<ARGS = void, RESULT = void> = (
  args: ARGS
) => Promise<RESULT>;

export type TypeormRepoStructure<
  S,
  T extends Record<string, TypeormRequester> = Record<string, TypeormRequester>
> = {
  [K in keyof T]: T[K] extends (data: infer D, ...args: infer A) => infer R
    ? (
        provider: Typeorm.Repository<S>,
        agents: NAbstractHttpAdapter.Agents["baseAgent"],
        data: D
      ) => R
    : T[K];
};

export type ValidateStructure<T extends any> = T;

export type DomainDocuments = {
  router?: RouterStructure<string>;
  controller?: ControllerStructure;
  emitter?: EmitterStructure<string>;
  wsListener?: WsListenerStructure<string>;
  typeormSchema?: TypeormSchemaStructure<string, unknown>;
  typeormRepo?: TypeormRepoStructure<Record<string, unknown>>;
  dictionaries?:
    | DictionaryStructure<string, ExtendedRecordObject>
    | DictionaryStructure<string, ExtendedRecordObject>[];
};

export type EntryPointStructure = {
  domain: string;
  documents: DomainDocuments;
  documentation?:
    | DomainDocStructure<string>
    | DomainDocStructure<string>[]
    | null;
};

export type ServiceStructure = {
  service: string;
  domains: EntryPointStructure[];
  documentation?:
    | ServiceDocStructure<string>
    | ServiceDocStructure<string>[]
    | null;
};

export type DomainDocStructure<
  LANGUAGE extends string,
  RELEASE extends string | string[] = string | string[]
> = {
  language: LANGUAGE;
  description: NDocumentationLoader.DomainDescription<RELEASE>;
};

export type ServiceDocStructure<
  LANGUAGE extends string,
  RELEASE extends string | string[] = string | string[]
> = {
  language: LANGUAGE;
  description: NDocumentationLoader.ServiceDescription<RELEASE>;
};
