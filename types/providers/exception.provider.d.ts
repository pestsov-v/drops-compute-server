import { NValidatorProvider } from './validator.provider';
import { NLoggerService } from '../services';
import { ISchemaExceptionError } from '../../../src/core/providers';
import { UnknownObject, UTCDate } from '../utility';

export interface IExceptionProvider {
  throwValidation(errors: NValidatorProvider.ErrorResult[]): IValidatorError;
  resolveValidation(e: IValidatorError): NExceptionProvider.ValidationData;
  throwError(message: any, options: NExceptionProvider.CoreError): ICoreError;
  throwSchemaException(
    msg: string,
    options?: NExceptionProvider.SchemaExceptionOptions
  ): ISchemaExceptionError;
  resolveSchemaException(e: ISchemaExceptionError): NExceptionProvider.SchemaExceptionData;
}

export interface IValidatorError {
  errors: NValidatorProvider.ErrorResult[];
}

export interface ISchemaExceptionError extends Error {
  statusCode: number;
  responseType: string;
  isNotResource?: boolean;
  isNotLog?: boolean;
  errorCode?: string;
  substitutions?: Record<string, string>;
  headers?: {
    addHeaders?: Record<string, string>;
    removeHeaders?: Record<string, string>;
  };
  redirect?: {
    statusCode?: number;
    url: string;
  };
  showCoreTrace?: boolean;
  coreTrace?: string;
  responseTime: UTCDate;
}

export type SchemaExceptionErrorOptions = {
  domain: string;
  language: string;
  statusCode: number;
  responseType: string;
  isNotResourceMsg?: boolean;
  isNotLogSet?: boolean;
  errorCode?: string;
  substitutions?: Record<string, string>;
  headers?: {
    addHeaders?: Record<string, string>;
    removeHeaders?: Record<string, string>;
  };
  redirect?: {
    statusCode?: number;
    url: string;
  };
  showTrace?: boolean;
  trace?: string;
  responseTime: UTCDate;
};

export interface ICoreError {
  namespace: string;
  tag?: string;
  requestId?: string;
  sessionId?: string;
  trace?: string;
  msg?: string;
}

export namespace NExceptionProvider {
  export type CoreErrorFormat<T extends UnknownObject = { message: string }> = {
    code: string;
    data: T;
  };
  export type ValidationData = {
    statusCode: number;
    payload: {
      responseType: string;
      data: {
        errors: NValidatorProvider.ErrorResult[];
      };
    };
  };

  export type SchemaExceptionPayload = {
    responseType: string;
    time: UTCDate;
    data: {
      message: string;
      trace?: string;
      errorCode?: string;
    };
  };
  export type SchemaExceptionData = {
    redirect?: {
      statusCode?: number;
      url: string;
    };
    headers?: {
      addHeaders?: Record<string, string>;
      removeHeaders?: Record<string, string>;
    };
    statusCode: number;
    payload: SchemaExceptionPayload;
  };

  export type CoreError = {
    namespace: string;
    requestId?: string;
    sessionId?: string;
    tag?: string;
    errorType: NLoggerService.ErrorType;
  };

  export type SchemaExceptionOptions = {
    statusCode?: number;
    responseType?: string;
    isNotResourceMsg?: boolean;
    isNotLogSet?: boolean;
    isNotShowTrace?: boolean;
    redirect?: {
      statusCode?: number;
      url: string;
    };
    headers?: {
      addHeaders?: Record<string, string>;
      deleteHeaders?: Record<string, string>;
    };
    substitutions?: Record<string, string>;
    trace?: string;
    errorCode?: string;
  };
}
