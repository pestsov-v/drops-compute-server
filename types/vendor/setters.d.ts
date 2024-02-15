import { AnyObject, ExtendedRecordObject, HttpMethod } from "../utility";
import { NAbstractHttpAdapter } from "../adapters";
import { NSessionService } from "../services";
import { NTypeormProvider } from "../providers";
import { NDocumentationLoader } from "../loaders";

export type ControllerStructure<T extends string> = {
  [key in T]: NAbstractHttpAdapter.Handler;
};

export type RouterStructure<T extends string, C extends AnyObject> = {
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

export type TypeormRepoStructure<T extends AnyObject> = {
  [key in keyof T]: T[key];
};

export type ValidateStructure<T extends any> = T;

export type DomainDocuments = {
  router?: RouterStructure<string>;
  controller?: ControllerStructure<string>;
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
