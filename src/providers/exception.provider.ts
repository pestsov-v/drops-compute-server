import { Packages } from "@Packages";
const { injectable, inject } = Packages.inversify;
import { ResponseType, StatusCode } from "@common";

import {
  UTCDate,
  IContextService,
  ICoreError,
  IExceptionProvider,
  ISchemaExceptionError,
  ISchemaProvider,
  IValidatorError,
  NExceptionProvider,
  SchemaExceptionErrorOptions,
  NSchemaService,
} from "@Core/Types";
import { container } from "../ioc/core.ioc";
import { CoreSymbols } from "@CoreSymbols";
import { Helpers } from "../utility/helpers";

class ValidatorError extends Error implements IValidatorError {
  public readonly errors: NSchemaService.ValidateErrors;

  constructor(message: string, errors: NSchemaService.ValidateErrors) {
    super(message);

    this.errors = errors;
  }
}

export class LocalizationError extends Error {}

class CoreError extends Error implements ICoreError {
  public readonly namespace: string;
  public readonly tag: string | undefined;
  public readonly requestId: string | undefined;
  public readonly sessionId: string | undefined;
  public readonly trace: string | undefined;
  public readonly msg: string | undefined;

  constructor(message: string, options: NExceptionProvider.CoreError) {
    super(message);

    this.namespace = options.namespace;
    this.tag = options.tag;
    this.requestId = options.requestId;
    this.sessionId = options.sessionId;
    this.trace = this.stack;
    this.msg = this.message;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class SchemaCatchError extends Error {}

export class SchemaExceptionError
  extends Error
  implements ISchemaExceptionError
{
  public readonly statusCode: number;
  public readonly responseType: string;
  public readonly isNotResource: boolean | undefined;
  public readonly isNotLog?: boolean | undefined;
  public readonly errorCode: string | undefined;
  public readonly substitutions: Record<string, string> | undefined;
  public readonly headers:
    | {
        addHeaders?: Record<string, string>;
        removeHeaders?: Record<string, string>;
      }
    | undefined;
  public readonly redirect:
    | {
        statusCode?: number;
        url: string;
      }
    | undefined;
  public readonly showCoreTrace: boolean | undefined;
  public readonly coreTrace: string | undefined;
  public readonly responseTime: UTCDate;

  constructor(msg: string, options: SchemaExceptionErrorOptions) {
    let message: string;
    if (options.isNotResourceMsg) {
      message = msg;
    } else {
      message = container
        .get<ISchemaProvider>(CoreSymbols.SchemaProvider)
        .getAnotherResource(
          options.domain,
          msg,
          options.substitutions,
          options.language
        );
      console.log(message);
    }
    super(message);

    this.message = message;
    this.statusCode = options.statusCode;
    this.responseType = options.responseType;
    this.isNotResource = options.isNotResourceMsg;
    this.isNotLog = options.isNotLogSet;
    this.errorCode = options.errorCode;
    this.substitutions = options.substitutions;
    this.headers = options.headers;
    this.redirect = options.redirect;
    this.showCoreTrace = options.showTrace;
    this.coreTrace = options.trace;
    this.responseTime = options.responseTime;
  }
}

@injectable()
export class ExceptionProvider implements IExceptionProvider {
  constructor(
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public throwValidation(
    errors: NSchemaService.ValidateErrors
  ): IValidatorError {
    return new ValidatorError("Validation error", errors);
  }

  public resolveValidation(
    e: IValidatorError
  ): NExceptionProvider.ValidationData {
    return {
      statusCode: StatusCode.BAD_REQUEST,
      payload: {
        responseType: ResponseType.VALIDATION,
        data: { errors: e.errors },
      },
    };
  }

  public throwError(
    message: string,
    options: NExceptionProvider.CoreError
  ): ICoreError {
    return new CoreError(message, options);
  }

  public throwSchemaException(
    msg: string,
    options?: NExceptionProvider.SchemaExceptionOptions
  ): ISchemaExceptionError {
    const store = this._contextService.store;

    const details: SchemaExceptionErrorOptions = {
      domain: store.domain,
      language: store.language,
      statusCode: options?.statusCode ?? StatusCode.BAD_REQUEST,
      responseType: options?.responseType ?? ResponseType.FAIL,
      isNotResourceMsg: options?.isNotResourceMsg ?? false,
      isNotLogSet: options?.isNotLogSet ?? false,
      showTrace: options?.isNotShowTrace ?? true,
      redirect: options?.redirect,
      headers: options?.headers,
      substitutions: options?.substitutions,
      trace: options?.trace,
      errorCode: options?.errorCode,
      responseTime: Helpers.UTCDate,
    };

    return new SchemaExceptionError(msg, details);
  }

  public resolveSchemaException(
    e: ISchemaExceptionError
  ): NExceptionProvider.SchemaExceptionData {
    const payload: NExceptionProvider.SchemaExceptionPayload = {
      responseType: e.responseType,
      time: e.responseTime,
      data: {
        message: e.message,
      },
    };
    if (e.showCoreTrace && e.coreTrace) payload.data["trace"] = e.coreTrace;
    if (e.errorCode) payload.data["errorCode"] = e.errorCode;

    return {
      headers: e.headers,
      statusCode: e.statusCode,
      payload: payload,
      redirect: e.redirect,
    };
  }
}
