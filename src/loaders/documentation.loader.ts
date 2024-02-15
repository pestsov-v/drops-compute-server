import { Packages } from "@Packages";
const { injectable } = Packages.inversify;

import type { IDocumentationLoader, NDocumentationLoader } from "@Core/Types";

@injectable()
export class DocumentationLoader implements IDocumentationLoader {
  private _services: NDocumentationLoader.Services | undefined;
  private _DOMAINS: NDocumentationLoader.Domains | undefined;

  public init(): void {
    this._services = new Map<
      string,
      {
        domains: NDocumentationLoader.Domains;
        description: NDocumentationLoader.ServiceDescriptions;
      }
    >();
    this._DOMAINS = new Map<
      string,
      {
        description: NDocumentationLoader.DomainDescriptions;
        details: NDocumentationLoader.DomainDetails<string>;
      }
    >();
  }

  public destroy(): void {
    this._services = undefined;
    this._DOMAINS = undefined;
  }

  public get services(): NDocumentationLoader.Services {
    if (!this._services) {
      throw new Error("Services collection not initialize or empty.");
    }

    return this._services;
  }

  private get _domains(): NDocumentationLoader.Domains {
    if (!this._DOMAINS) {
      throw new Error("Domains collection not initialize or empty.");
    }

    return this._DOMAINS;
  }

  public setDomain(domain: string): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._domains.set(domain, {
        description: new Map<string, NDocumentationLoader.DomainDescription>(),
        details: {
          routes: new Map<string, NDocumentationLoader.Route<string, string>>(),
        },
      });
    }
  }

  public setService(service: string): void {
    const storage = this.services.get(service);
    if (!storage) {
      this.services.set(service, {
        description: new Map<string, NDocumentationLoader.ServiceDescription>(),
        domains: new Map<
          string,
          {
            description: NDocumentationLoader.DomainDescriptions;
            details: NDocumentationLoader.DomainDetails<string>;
          }
        >(),
      });
    }
  }

  public applyDomainToService(service: string, domain: string): void {
    const sStorage = this.services.get(service);
    if (!sStorage) {
      this.setService(service);
      this.applyDomainToService(service, domain);
      return;
    }

    const dStorage = this._domains.get(domain);
    if (!dStorage) {
      throw new Error(`Domain ${domain} not found`);
    }

    sStorage.domains.set(domain, dStorage);
  }

  public setDomainDescription(
    domain: string,
    language: string,
    description: NDocumentationLoader.DomainDescription
  ): void {
    const dStorage = this._domains.get(domain);
    if (!dStorage) {
      this.setDomain(domain);
      this.setDomainDescription(domain, language, description);
      return;
    }

    if (dStorage.description.has(language)) {
      throw new Error(
        `Domain description for domain "${domain}" in language ${language} has been set.`
      );
    } else {
      dStorage.description.set(language, description);
    }
  }

  public setServiceDescription(
    service: string,
    language: string,
    description: NDocumentationLoader.ServiceDescription
  ): void {
    const sStorage = this.services.get(service);
    if (!sStorage) {
      this.setService(service);
      this.setServiceDescription(service, language, description);
      return;
    }

    if (sStorage.description.has(language)) {
      throw new Error(
        `Service description for service ${service} in language ${language} has been set.`
      );
    } else {
      sStorage.description.set(language, description);
    }
  }
}
