import { Openapi } from '../packages/packages';

export interface ISpecificationBaseOperation {
  readonly bearerAuth: NSpecificationBaseOperation.BearerSecurity;
  readonly validateResponse: Openapi.ResponseObject;

  getJsonObjectContent<T extends Record<string, Openapi.NonArraySchemaObject>>(
    schema: T
  ): NSpecificationBaseOperation.Content;
}

export namespace NSpecificationBaseOperation {
  export type BearerSecurity = [{ BearerAuth: [] }];

  export type Content = {
    'application/json': Openapi.MediaTypeObject;
  };
}
