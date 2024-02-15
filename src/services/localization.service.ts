import { Packages } from "@Packages";
import { CoreSymbols } from "@CoreSymbols";
const { injectable, inject } = Packages.inversify;
import { AbstractService } from "./abstract.service";

import { Guards } from "@Guards";
import {
  IDiscoveryService,
  ILocalizationService,
  ILoggerService,
  ISchemaService,
  NLocalizationService,
} from "@Core/Types";

@injectable()
export class LocalizationService
  extends AbstractService
  implements ILocalizationService
{
  protected readonly _SERVICE_NAME = LocalizationService.name;
  private _config: NLocalizationService.Config | undefined;
  private _dictionaries: NLocalizationService.Dictionaries | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();
  }

  private _setConfig(): void {
    this._config = {
      supportedLanguages: this._discoveryService.getArray<string>(
        "services.localization.supportedLanguages",
        ["en"]
      ),
      defaultLanguages: this._discoveryService.getString(
        "services.localization.defaultLanguages",
        "en"
      ),
    };
  }

  public async init(): Promise<boolean> {
    this._setConfig();

    if (!this._config) {
      throw new Error("Config not set");
    }

    // this._dictionaries = this._schemaService.

    return true;
  }

  public get supportedLanguages(): string[] {
    if (!this._config) {
      throw new Error("Config not set");
    }
    return Array.from(this._config.supportedLanguages);
  }

  public get defaultLanguages(): string {
    if (!this._config) {
      throw new Error("Config not set");
    }

    return this._config.defaultLanguages;
  }

  public getResource(
    service: string,
    domain: string,
    language: string,
    resource: string,
    substitutions?: Record<string, string>
  ): string {
    if (!this._dictionaries) throw this.getDictionaryError();

    const sStorage = this._dictionaries.get(service);
    if (!sStorage) {
      throw new Error("Service not found");
    }

    const dStorage = sStorage.get(domain);
    if (!dStorage) {
      throw new Error("Domain not found");
    }

    const dictionary = dStorage.get(language);
    if (!dictionary) {
      throw new Error("Dictionary language not supported");
    }

    try {
      const keys = resource.split(".");
      let record: NLocalizationService.DictionaryRecord = dictionary;

      if (keys.length > 1) {
        for (const key of keys) {
          if (!Guards.isString(record)) {
            record = record[key];
          } else {
            if (substitutions) {
              for (const substitution in substitutions) {
                record = record.replace(
                  "{{" + substitution + "}}",
                  substitutions[substitution]
                );
              }
            } else {
              return record;
            }
          }
        }
      }
      return record;
    } catch (e) {
      throw e;
    }
  }

  public async destroy() {
    this._config = undefined;
    this._dictionaries = undefined;
  }

  private getDictionaryError(): Error {
    return new Error("Dictionaries not set");
  }
}
