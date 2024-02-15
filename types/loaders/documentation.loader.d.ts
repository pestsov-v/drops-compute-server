import { HttpMethod, VoidableStrOrArrStr } from "../utility";

export interface IDocumentationLoader {
  readonly services: NDocumentationLoader.Services;

  readonly init(): void;
  readonly destroy(): void;
  readonly setService(service: string): void;
  readonly setServiceDescription(
    service: string,
    language: string,
    description: NDocumentationLoader.ServiceDescription
  ): void;
  readonly applyDomainToService(service: string, domain: string): void;
  readonly setDomain(domain: string): void;
  readonly setDomainDescription(
    domain: string,
    language: string,
    description: NDocumentationLoader.DomainDescription
  ): void;
}

export namespace NDocumentationLoader {
  export type RouteDetailsCollection<LANGUAGE extends string> = Map<
    LANGUAGE,
    RouteDetails
  >;

  export type Route<
    LANGUAGE extends string,
    RELEASE extends string = string
  > = {
    method: string;
    handler: string;
    isPrivateUser?: boolean;
    isPrivateOrganization?: boolean;
    release?: RELEASE;
    details?: RouteDetailsCollection<LANGUAGE>;
  };
  export type Routes<
    LANGUAGE extends string,
    RELEASE extends string = string
  > = Map<string, Route<LANGUAGE, RELEASE>>;

  export type DomainDetails<
    LANGUAGES extends string,
    RELEASE extends string = string
  > = {
    routes: Routes<LANGUAGES, RELEASE>;
  };

  export type BaseInformation = {
    summary?: string;
    stable?: string;
    deprecated?: boolean;
    sourceCode?: string;
    history?: { version: string; changes: string }[];
    privacy?: { service: string; reason: string }[];
  };

  export type RouteDescription<
    RELEASE extends string | string[] = string | string[]
  > = {
    [key in HttpMethod]?: {
      release: RELEASE;
      summary?: string;
      description?: string;
    };
  };
  export type RouteStructure<
    RELEASE extends string | string[] = string | string[],
    R extends VoidableStrOrArrStr = VoidableStrOrArrStr
  > = {
    [key in R]: RouteDescription<RELEASE>;
  };
  export type DomainDetailsStructure<
    RELEASE extends string | string[] = string | string[],
    ROUTES extends VoidableStrOrArrStr = VoidableStrOrArrStr
  > = {
    common?: {
      routes?: RouteStructure<RELEASE, ROUTES>;
    };
  };
  export type DomainDescription<
    RELEASE extends string | string[] = string | string[],
    ROUTES extends VoidableStrOrArrStr = VoidableStrOrArrStr
  > = {
    release: RELEASE;
    info?: BaseInformation;
    details?: DomainDetailsStructure<RELEASE, ROUTES>;
  };
  export type DomainDescriptions = Map<string, DomainDescription>;

  export type ServiceDescription<
    RELEASE extends string | string[] = string | string[]
  > = {
    release: RELEASE;
    description: BaseInformation;
  };

  export type ServiceDescriptions<LANGUAGE extends string = string> = Map<
    LANGUAGE,
    ServiceDescription
  >;
  export type Domains = Map<
    string,
    {
      description: DomainDescriptions;
      details: DomainDetails;
    }
  >;
  export type Services = Map<
    string,
    {
      description: ServiceDescriptions;
      domains: Domains;
    }
  >;
}
