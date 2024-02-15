import { Packages, querystring } from "@Packages";
const { injectable, inject } = Packages.inversify;
const { fastify } = Packages.fastify;
const { v4 } = Packages.uuid;

import { CoreSymbols } from "@CoreSymbols";
import { AbstractHttpAdapter } from "./abstract.http-adapter";

import {
  Fastify,
  HttpMethod,
  UnknownObject,
  IContextService,
  IDiscoveryService,
  ILoggerService,
  IAbstractFrameworkAdapter,
  NAbstractHttpAdapter,
  NSchemaLoader,
  IFunctionalityAgent,
  NContextService,
  ISchemaAgent,
  IBaseOperationAgent,
  IExceptionProvider,
  IScramblerService,
  ISessionService,
  NScramblerService,
  ILocalizationService,
  IIntegrationAgent,
} from "@Core/Types";
import { ResponseType, SchemaHeaders, StatusCode } from "@common";
import { Helpers } from "../../utility/helpers";
import { container } from "../../ioc/core.ioc";
import { Guards } from "@Guards";
import { TokenExpiredError } from "jsonwebtoken";

@injectable()
export class FastifyHttpAdapter
  extends AbstractHttpAdapter<"fastify">
  implements IAbstractFrameworkAdapter
{
  protected readonly _ADAPTER_NAME = FastifyHttpAdapter.name;
  protected _CONFIG: NAbstractHttpAdapter.Config | undefined;
  protected _instance: NAbstractHttpAdapter.Instance<"fastify"> | undefined;
  private _schemas: NSchemaLoader.Services | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    protected readonly _contextService: IContextService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.SessionService)
    private readonly _sessionService: ISessionService,
    @inject(CoreSymbols.LocalizationService)
    private readonly _localizationService: ILocalizationService
  ) {
    super();
  }

  protected _setConfig(): void {
    this._CONFIG = {
      serverTag: this._discoveryService.getString(
        "adapters.framework.serverTag",
        "ANONYMOUS_01"
      ),
      protocol: this._discoveryService.getString(
        "adapters.framework.protocol",
        "http"
      ),
      host: this._discoveryService.getString(
        "adapters.framework.host",
        "localhost"
      ),
      port: this._discoveryService.getNumber("adapters.framework.port", 11000),
      urls: {
        api: this._discoveryService.getString(
          "adapters.framework.urls.api",
          "/v1/call/api"
        ),
      },
    };
  }

  public async start(schemas: NSchemaLoader.Services): Promise<void> {
    this._schemas = schemas;
    this._setConfig();

    if (!this._CONFIG) {
      throw new Error("Config not initialize");
    }

    this._instance = fastify({});
    this._instance.all(this._CONFIG.urls.api + "*", this._apiHandler);

    this._instance.addHook(
      "onRequest",
      (
        request: Fastify.Request,
        reply: Fastify.Response,
        done: () => void
      ): void => {
        reply.headers(this._corsHeaders());

        if (request.method === "OPTIONS") {
          reply.status(200).send();
          return;
        }

        done();
      }
    );

    const { protocol, host, port } = this._CONFIG;

    try {
      await this._instance.listen({ host, port }, () => {
        if (this._CONFIG) {
          this._loggerService.system(
            `Http server listening on ${protocol}://${host}:${port}`,
            {
              scope: "Core",
              namespace: this._ADAPTER_NAME,
              tag: "Connection",
            }
          );
        } else {
          console.log(`Http server is started`);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  private _corsHeaders() {
    const httpMethods: HttpMethod[] = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
      "TRACE",
    ];
    const standardHeaders = ["Content-Type", "Authorization"];
    const schemaHeaders: (typeof SchemaHeaders)[keyof typeof SchemaHeaders][] =
      [
        "x-service-name",
        "x-service-version",
        "x-domain-name",
        "x-action-name",
        "x-action-version",
      ];
    const tokenHeaders = ["x-user-access-token", "x-user-refresh-token"];
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": httpMethods.join(", "),
      "Access-Control-Allow-Headers":
        standardHeaders.join(", ") +
        ", " +
        schemaHeaders.join(", ") +
        ", " +
        tokenHeaders.join(", "),
      "Access-Control-Expose-Headers": tokenHeaders.join(", "),
    };
  }

  private get _config(): NAbstractHttpAdapter.Config {
    if (!this._CONFIG) {
      throw new Error("Config not initialize");
    }

    return this._CONFIG;
  }

  public async stop(): Promise<void> {
    this._CONFIG = undefined;
    this._schemas = undefined;

    if (!this._instance) return;

    await this._instance.close();
    this._instance = undefined;

    this._loggerService.system(`Http server has been stopped.`, {
      scope: "Core",
      namespace: this._ADAPTER_NAME,
      tag: "Destroy",
    });
  }

  protected _apiHandler = async (
    req: NAbstractHttpAdapter.Request<"fastify">,
    res: NAbstractHttpAdapter.Response<"fastify">
  ): Promise<void> => {
    if (!this._schemas) {
      throw new Error("Business services schema not initialize");
    }
    const schemaResult = this._resolveSchemaHeaders(req.headers);
    if (!schemaResult.ok) {
      return res.status(StatusCode.BAD_REQUEST).send({
        ResponseType: ResponseType.FAIL,
        data: {
          message: schemaResult.message,
        },
      });
    }

    const service = this._schemas.get(schemaResult.service);
    if (!service) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(this._getNotFoundStructure("service"));
    }

    const domain = service.get(schemaResult.domain);
    if (!domain) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(this._getNotFoundStructure("domain"));
    }

    if (!domain.routes || !domain.controllers) {
      return res.status(StatusCode.BAD_REQUEST).send({
        responseType: ResponseType.FAIL,
        data: {
          message: "Domain does not have any routes",
        },
      });
    }

    const act = schemaResult.action + "{{" + req.method.toUpperCase() + "}}";
    const action = domain.routes.get(act);
    if (!action) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(this._getNotFoundStructure("action"));
    }

    const handler = domain.controllers.get(action.handler);
    if (!handler) {
      return res.status(StatusCode.BAD_REQUEST).send({
        responseType: ResponseType.FAIL,
        data: {
          message: "Domain does not have any routes",
        },
      });
    }

    const inputParams: string[] = [];
    if (req.url.includes("?")) {
      const [params] = req.url.split("?");

      inputParams.push(
        ...params
          .replace(this._config.urls.api, "")
          .split("/")
          .filter((p: string) => p.length > 0)
      );
    } else {
      inputParams.push(
        ...req.url
          .replace(this._config.urls.api, "")
          .split("/")
          .filter((p: string) => p.length > 0)
      );
    }

    let params: Record<string, string> = {};
    if (action.params && inputParams.length > 0) {
      params = action.params.reduce(
        (obj: Record<string, string>, k: string, i: number) => {
          obj[k] = inputParams[i];
          return obj;
        },
        {}
      );
    }

    let queries: Record<string, unknown> = {};
    if (req.query) {
      queries = Helpers.parseQueryParams(Object.assign({}, req.query));
    }

    let contextLanguage: string;
    const acceptLanguage = req.headers["accept-language"];
    const supportedLanguages = this._localizationService.supportedLanguages;
    if (typeof acceptLanguage !== "undefined") {
      if (supportedLanguages.includes(acceptLanguage)) {
        contextLanguage = acceptLanguage;
      } else {
        return res.status(StatusCode.BAD_REQUEST).send({
          responseType: ResponseType.FAIL,
          data: {
            message: `Server not supported "${acceptLanguage}". Supported languages: "${supportedLanguages.join(
              ", "
            )}"`,
          },
        });
      }
    } else {
      contextLanguage = this._localizationService.defaultLanguages;
    }

    const store: NContextService.Store = {
      service: schemaResult.service,
      domain: schemaResult.domain,
      action: schemaResult.action,
      method: req.method,
      path: req.url,
      ip: req.ip,
      requestId: v4(),
      schema: this._schemas,
      language: contextLanguage,
    };

    try {
      await this._contextService.storage.run(store, async () => {
        const context: NAbstractHttpAdapter.Context<UnknownObject> = {
          storage: {
            store: store,
          },
          packages: {},
          sessionInfo: { auth: false },
        };

        if (action.isPrivateUser) {
          const accessToken = req.headers["x-user-access-token"];
          if (!accessToken) {
            return res.status(StatusCode.FORBIDDEN).send({
              responseType: ResponseType.AUTHENTICATED,
              data: {
                message: "Missed user access token",
              },
            });
          }
          const jwtPayload = await this._scramblerService.verifyToken<
            UnknownObject & NScramblerService.SessionIdentifiers
          >(accessToken);

          const sessionInfo = await this._sessionService.getHttpSessionInfo(
            jwtPayload.payload.userId,
            jwtPayload.payload.sessionId
          );

          if (sessionInfo) {
            context.sessionInfo = {
              auth: true,
              info: {
                ...sessionInfo,
                userId: jwtPayload.payload.userId,
                sessionId: jwtPayload.payload.sessionId,
              },
            };
          }
        }

        const result = await handler(
          {
            method: req.method,
            headers: req.headers,
            body: req.body,
            params: params,
            path: req.routeOptions.url,
            url: req.url,
            query: queries,
          },
          {
            functionalityAgent: container.get<IFunctionalityAgent>(
              CoreSymbols.FunctionalityAgent
            ),
            schemaAgent: container.get<ISchemaAgent>(CoreSymbols.SchemaAgent),
            baseAgent: container.get<IBaseOperationAgent>(
              CoreSymbols.BaseOperationAgent
            ),
            integrationAgent: container.get<IIntegrationAgent>(
              CoreSymbols.IntegrationAgent
            ),
          },
          context
        );

        if (!result) {
          return res.status(StatusCode.NO_CONTENT).send();
        }

        if (result.headers) res.headers(result.headers);

        switch (result.format) {
          case "json":
            return res.status(result.statusCode || StatusCode.SUCCESS).send({
              format: result.format,
              type: result.type,
              data: result.data,
            });
          case "status":
            return res
              .status(result.statusCode || StatusCode.NO_CONTENT)
              .send();
          case "redirect":
            return res
              .status(result.StatusCode || StatusCode.FOUND)
              .redirect(result.url);
          default:
            throw Helpers.switchChecker(result);
        }
      });
    } catch (e) {
      console.log(e);
      if (Guards.isValidationError(e)) {
        const response = container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .resolveValidation(e);
        return res.status(response.statusCode).send(response.payload);
      } else if (Guards.isSchemaExceptionError(e)) {
        const response = container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .resolveSchemaException(e);

        if (response.headers) {
          if (response.headers.removeHeaders) {
            for (const header in response.headers.removeHeaders) {
              res.removeHeader(header, response.headers.removeHeaders[header]);
            }
          }
          if (response.headers.addHeaders) {
            res.headers(response.headers.addHeaders);
          }
        }

        if (response.redirect) {
          return res
            .status(response.statusCode)
            .redirect(response.redirect)
            .send(response.payload);
        } else {
          return res.status(response.statusCode).send(response.payload);
        }
      } else if (e instanceof TokenExpiredError) {
        res.status(StatusCode.FORBIDDEN).send({
          responseType: ResponseType.AUTHENTICATED,
          data: {
            message: "Access jwt token expired",
          },
        });
      } else {
        return res.status(StatusCode.SERVER_ERROR).send({
          responseType: ResponseType.ERROR,
          data: {
            message: e,
          },
        });
      }
    } finally {
      this._contextService.exit();
    }
  };

  private _getNotFoundStructure(
    param: NAbstractHttpAdapter.FailSchemaParameter
  ) {
    let message: string;
    switch (param) {
      case "service":
        message = `Service "${param}" not found`;
        break;
      case "domain":
        message = `Service "${param}" not found`;
        break;
      case "action":
        message = `Service "${param}" not found`;
        break;
      default:
        throw Helpers.switchChecker(param);
    }

    return {
      responseType: ResponseType.FAIL,
      data: { message },
    };
  }
}
