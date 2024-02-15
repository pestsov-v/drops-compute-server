import { Packages } from '@Packages';
const { injectable } = Packages.inversify;
import { Openapi,ISpecificationBaseOperation, NSpecificationBaseOperation } from '@Core/Types';

@injectable()
export class SpecificationBaseOperation implements ISpecificationBaseOperation {
  public get bearerAuth(): NSpecificationBaseOperation.BearerSecurity {
    return [{ BearerAuth: [] }];
  }

  public get validateResponse(): Openapi.ResponseObject {
    return {
      description: 'Request body validation error response',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              responseType: {
                type: 'string',
                example: 'validation',
              },
              data: {
                type: 'object',
                properties: {
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: '"phone" length must be 13 characters long',
                        },
                        key: {
                          type: 'string',
                          example: 'phone',
                        },
                        value: {
                          type: 'string',
                          example: '+3809516962632137',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  public getJsonObjectContent<T extends Record<string, Openapi.NonArraySchemaObject>>(
    schema: T
  ): NSpecificationBaseOperation.Content {
    return {
      'application/json': {
        schema: {
          type: 'object',
          properties: schema,
        },
      },
    };
  }
}
