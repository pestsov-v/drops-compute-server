import { IAbstractService } from './abstract.service';

export interface ISpecificationService extends IAbstractService {}

export namespace NSpecificationService {
  export type SpecificationType = 'openApi' | 'asyncApi' | 'brokerApi';
  export type Config = {
    enable: boolean;
    liveReload: boolean;
    rootDir: string;
  };
}
