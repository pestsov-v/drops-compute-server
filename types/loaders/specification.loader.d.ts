import { Openapi } from '../packages/packages';
import { IBaseOperationAgent, IFunctionalityAgent } from '../agents';

export interface ISpecificationLoader {
  readonly services: NSpecificationLoader.Services;

  init(): Promise<void>;
  setOpenApiSpecification(
    service: string,
    languages: NSpecificationLoader.LanguageSlice[],
    summary: NSpecificationLoader.SpecificationSummary
  ): void;
  applyDomainToService(service: string, domain: string): void;
  setDomain(domain: string): void;
  setOpenApiPath(domain: string, path: string, payload: NSpecificationLoader.Path): void;
}

export namespace NSpecificationLoader {
  export type SpecAgents = {
    functionalityAgent: IFunctionalityAgent;
    baseAgent: IBaseOperationAgent;
  };
  export type Path = (agents: SpecAgents) => Openapi.Path[];
  export type Paths<K extends string> = { [key in K]: Path };

  export type Specifications = {
    openapi?: {
      languages: LanguageSlice[];
      summary: SpecificationSummary;
    };
  };

  export type LanguageSlice = { ln: string; title: string; description?: string };
  export type SpecificationSummary = {
    version: string;
    contact?: {
      name?: string;
      url?: string;
      email?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };

  export type DomainStorage = {
    openapi: Map<string, Path>;
  };
  export type Domains = Map<string, DomainStorage>;

  export type ServiceStorage = {
    domains: Domains;
    languages?: NSpecificationLoader.LanguageSlice[];
    summary?: SpecificationSummary;
  };

  export type Services = Map<string, ServiceStorage>;
}
