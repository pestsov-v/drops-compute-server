import { IAbstractService } from "./abstract.service";
import { NSchemaLoader, NSpecificationLoader } from "../loaders";
import { ServiceStructure } from "../vendor";

export interface ISchemaService extends IAbstractService {
  readonly schema: NSchemaLoader.Services;
  readonly wsListeners: NSchemaLoader.Services;
  readonly specifications: NSpecificationLoader.Services;
  readonly typeormSchemas: NSchemaLoader.TypeormEntities;

  on(event: NSchemaService.Events, listener: () => void): void;
}

export namespace NSchemaService {
  export type ServiceName = "SchemaService";

  export type Config = {
    specificationEnable: boolean;
  };

  export type Events =
    | `services:${ServiceName}:schemas-init`
    | `services:${ServiceName}:schemas-load`
    | `services:${ServiceName}:schemas-error`;
}
