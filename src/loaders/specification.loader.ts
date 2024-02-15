import { Packages } from '@Packages';
const { injectable } = Packages.inversify;

import { ISpecificationLoader, NSpecificationLoader } from '@Core/Types';

@injectable()
export class SpecificationLoader implements ISpecificationLoader {
  private _DOMAINS: NSpecificationLoader.Domains | undefined;
  private _SERVICES: NSpecificationLoader.Services | undefined;

  public async init(): Promise<void> {
    this._DOMAINS = new Map<string, NSpecificationLoader.DomainStorage>();
    this._SERVICES = new Map<string, NSpecificationLoader.ServiceStorage>();
  }

  private get _domains(): NSpecificationLoader.Domains {
    if (!this._DOMAINS) {
      throw new Error('Domain storage not initialize');
    }

    return this._DOMAINS;
  }

  private get _services(): NSpecificationLoader.Services {
    if (!this._SERVICES) {
      throw new Error('Services storage not initialize');
    }

    return this._SERVICES;
  }

  public get services(): NSpecificationLoader.Services {
    return this._services;
  }

  private _setService(service: string) {
    this._services.set(service, {
      languages: [],
      summary: {
        version: '1.0.0',
      },
      domains: new Map<string, NSpecificationLoader.DomainStorage>(),
    });
  }

  public setOpenApiSpecification(
    service: string,
    languages: NSpecificationLoader.LanguageSlice[],
    summary: NSpecificationLoader.SpecificationSummary
  ): void {
    const storage = this._services.get(service);
    if (storage) {
      storage.languages = languages;
      storage.summary = summary;
    } else {
      this._services.set(service, {
        languages: languages,
        summary: summary,
        domains: new Map<string, NSpecificationLoader.DomainStorage>(),
      });
    }
  }

  public applyDomainToService(service: string, domain: string): void {
    const sStorage = this._services.get(service);
    if (!sStorage) {
      this._setService(service);
      this.applyDomainToService(service, domain);
      return;
    }

    const dStorage = this._domains.get(domain);
    if (!dStorage) {
      throw new Error(`Domain ${domain} not found`);
    }

    sStorage.domains.set(domain, dStorage);
  }

  public setDomain(domain: string): void {
    this._domains.set(domain, {
      openapi: new Map<string, NSpecificationLoader.Path>(),
    });
  }

  public setOpenApiPath(domain: string, path: string, payload: NSpecificationLoader.Path): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this.setDomain(domain);
      this.setOpenApiPath(domain, path, payload);
      return;
    }

    storage.openapi.set(path, payload);
  }
}
