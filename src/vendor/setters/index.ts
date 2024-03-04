import {
  WsListenerStructure,
  DictionaryStructure,
  EmitterStructure,
  RouterStructure,
  ExtendedRecordObject,
  DomainDocuments,
  AnyObject,
  TypeormRepoStructure,
  TypeormSchemaStructure,
  NTypeormProvider,
  NDocumentationLoader,
  ServiceDocStructure,
  DomainDocStructure,
  VoidableStrOrArrStr,
  EntryPointStructure,
  NSchemaService,
  HttpController,
} from "@Core/Types";

export const setService = (
  service: string,
  domains: EntryPointStructure[],
  documentation?:
    | ServiceDocStructure<string>
    | ServiceDocStructure<string>[]
    | null
) => {
  return { service, domains, documentation };
};

export const setEntryPoint = (
  domain: string,
  documents: DomainDocuments,
  documentation?:
    | DomainDocStructure<string>
    | DomainDocStructure<string>[]
    | null
): EntryPointStructure => {
  return { domain, documents, documentation };
};

export const setDictionary = <L extends string, D extends ExtendedRecordObject>(
  structure: DictionaryStructure<L, D>
): DictionaryStructure<L, D> => {
  return structure;
};

export const setEmitter = <T extends string>(
  structure: EmitterStructure<T>
): EmitterStructure<T> => {
  return structure;
};

export const setRouter = <T extends string | Record<string, HttpController>>(
  structure: RouterStructure<T>
): RouterStructure<T> => {
  return structure;
};

export const setValidator = <
  T extends string | Record<string, NSchemaService.ValidateObject>
>(
  structure: NSchemaService.ValidatorStructure<T>
): NSchemaService.ValidatorStructure<T> => {
  return structure;
};

export const setWsListener = <T extends string>(
  structure: WsListenerStructure<T>
): WsListenerStructure<T> => {
  return structure;
};

export const setTypeormRepo = <S, T extends AnyObject>(
  structure: TypeormRepoStructure<S, T>
): TypeormRepoStructure<S, T> => {
  return structure;
};

export const setTypeormSchema = <M extends string, S>(
  structure: TypeormSchemaStructure<M, S>
): TypeormSchemaStructure<M, NTypeormProvider.SchemaFn<S>> => {
  return structure;
};

export const setDocumentation = <
  LANGUAGE extends string,
  RELEASE extends string | string[] = string | string[],
  ROUTES extends VoidableStrOrArrStr = VoidableStrOrArrStr
>(
  language: LANGUAGE,
  structure: NDocumentationLoader.DomainDescription<RELEASE, ROUTES>
): DomainDocStructure<LANGUAGE> => {
  return { language, description: structure };
};

export const setServiceDocumentation = <
  LANGUAGE extends string,
  RELEASE extends string | string[] = string | string[]
>(
  language: LANGUAGE,
  structure: NDocumentationLoader.ServiceDescription<RELEASE>
): ServiceDocStructure<LANGUAGE> => {
  return { language, description: structure };
};
