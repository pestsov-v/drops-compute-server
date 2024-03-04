import { Packages } from "@Packages";
import { AbstractWsAdapter } from "./abstract.ws-adapter";
const { injectable, inject } = Packages.inversify;
const { http } = Packages.http;
const { https } = Packages.https;
const { ws } = Packages.ws;
const { v4 } = Packages.uuid;

import { CoreSymbols } from "@CoreSymbols";

import {
  Http,
  Https,
  Ws,
  IAbstractWebsocketAdapter,
  IDiscoveryService,
  ILoggerService,
  ISessionService,
  NAbstractWebsocketAdapter,
} from "@Core/Types";

@injectable()
export class WsWsAdapter
  extends AbstractWsAdapter<"ws">
  implements IAbstractWebsocketAdapter
{
  protected readonly _ADAPTER_NAME = WsWsAdapter.name;
  protected _config: NAbstractWebsocketAdapter.Config | undefined;
  protected _instance: Ws.WebSocketServer | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SessionService)
    protected readonly _sessionService: ISessionService
  ) {
    super();
  }

  private _setConfig(): void {
    this._config = {
      protocol: this._discoveryService.getString(
        "adapters.websocket.protocol",
        "ws"
      ),
      host: this._discoveryService.getString(
        "adapters.websocket.host",
        "localhost"
      ),
      port: this._discoveryService.getNumber("adapters.websocket.port", 15055),
      connection: {
        checkInterval: this._discoveryService.getNumber(
          "adapters.websocket.connection.checkInterval",
          300
        ),
      },
    };
  }

  public async start(): Promise<void> {
    this._setConfig();

    if (!this._config) throw this._throwConfigError();

    const { protocol, host, port } = this._config;
    let server: Http.Server | Https.Server;
    switch (true) {
      case protocol === "ws":
        server = http.createServer();
        break;
      case protocol === "wss":
        server = https.createServer();
        break;
      default:
        throw new Error(`Unsupported protocol - ${protocol}`);
    }

    try {
      this._instance = new ws.WebSocketServer({ server });

      const instance = this._instance;
      const service = this._sessionService;

      instance.on("connection", function (ws, request) {
        const internalWs = ws as Ws.WebSocket;

        service.setWsConnection(internalWs, {
          userAgent: request.headers["user-agent"],
          acceptLanguage: request.headers["accept-language"],
          websocketKey: request.headers["sec-websocket-key"],
          ip: request.socket.remoteAddress ?? "",
        });
      });

      server.listen(port, () => {
        this._loggerService.system(
          `Websocket server listening on ${protocol}://${host}:${port}`,
          {
            scope: "Core",
            namespace: this._ADAPTER_NAME,
            tag: "Connection",
          }
        );
      });
    } catch (e) {
      throw e;
    }
  }

  public async stop(): Promise<void> {
    this._config = undefined;
    if (!this._instance) return;

    this._instance.close();
    this._instance = undefined;

    this._loggerService.system(`Websocket server has been stopped.`, {
      scope: "Core",
      namespace: this._ADAPTER_NAME,
      tag: "Destroy",
    });
  }

  private _throwConfigError() {
    return new Error("Config not set");
  }
}
