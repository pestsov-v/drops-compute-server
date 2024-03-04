import { Packages } from "@Packages";
const { injectable, inject } = Packages.inversify;
const { v4 } = Packages.uuid;
import { CoreSymbols } from "@CoreSymbols";
import { AbstractService } from "./abstract.service";
import { container } from "../ioc/core.ioc";
import { Guards } from "@Guards";
import { CoreErrors } from "../common/core-errors";

import {
  Ws,
  Nullable,
  UnknownObject,
  IContextService,
  IDiscoveryService,
  ILoggerService,
  IRedisProvider,
  IScramblerService,
  ISessionService,
  NScramblerService,
  NSessionService,
  AnyObject,
  ISchemaService,
} from "@Core/Types";

@injectable()
export class SessionService extends AbstractService implements ISessionService {
  protected readonly _SERVICE_NAME = SessionService.name;
  protected _config: NSessionService.Config | undefined;
  private _connections: NSessionService.ConnectionStorage | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ScramblerService)
    protected readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.ContextService)
    protected readonly _contextService: IContextService,
    @inject(CoreSymbols.SchemaService)
    private readonly _schemaService: ISchemaService
  ) {
    super();
  }

  private _setConfig() {
    this._config = {
      serverTag: this._discoveryService.serverTag,
    };
  }

  private get _storage(): NSessionService.ConnectionStorage {
    if (!this._connections) {
      throw new Error("Connection storage not initialize");
    }

    return this._connections;
  }

  private get _conf(): NSessionService.Config {
    if (!this._config) {
      throw new Error("Session service config not set");
    }

    return this._config;
  }

  protected async init(): Promise<boolean> {
    this._setConfig();
    if (!this._config) {
      throw new Error("Config not set");
    }
    this._connections = new Map<string, NSessionService.Connection>();

    return true;
  }

  protected async destroy(): Promise<void> {
    this._config = undefined;
    this._connections = undefined;
  }

  public async openHttpSession<T extends UnknownObject>(
    payload: T
  ): Promise<string> {
    const sessionId = v4();

    try {
      await container
        .get<IRedisProvider>(CoreSymbols.RedisProvider)
        .setWithExpire(
          sessionId,
          payload,
          this._scramblerService.accessExpiredAt
        );

      return sessionId;
    } catch (e) {
      throw e;
    }
  }

  public async getHttpSessionCount(userId: string): Promise<number> {
    try {
      const id = this._buildRedisKey({ user: { id: userId, count: true } });
      return await container
        .get<IRedisProvider>(CoreSymbols.RedisProvider)
        .getItemCount(id);
    } catch (e) {
      throw e;
    }
  }

  public async getHttpSessionInfo<T extends UnknownObject>(
    userId: string,
    sessionId: string
  ): Promise<Nullable<T>> {
    const id = this._buildRedisKey({
      user: { id: userId },
      sessionId: sessionId,
    });

    try {
      return await container
        .get<IRedisProvider>(CoreSymbols.RedisProvider)
        .getItemInfo<T>(id);
    } catch (e) {
      throw e;
    }
  }

  public async deleteHttpSession(
    userId: string,
    sessionId: string
  ): Promise<void> {
    try {
      const id = this._buildRedisKey({
        user: { id: userId },
        sessionId: sessionId,
      });

      await container
        .get<IRedisProvider>(CoreSymbols.RedisProvider)
        .deleteItem(id);
    } catch (e) {
      throw e;
    }
  }

  public setWsConnection(
    ws: Ws.WebSocket,
    connection: NSessionService.ConnectionDetails
  ) {
    const uuid = v4();

    ws.uuid = uuid;
    this._storage.set(uuid, {
      connectionCount: 1,
      auth: false,
      socket: ws,
      ip: connection.ip,
      websocketKey: connection.websocketKey,
      userAgent: connection.userAgent,
      acceptLanguage: connection.acceptLanguage,
    });

    this._sendHandshake(ws, {
      serverTag: this._discoveryService.serverTag,
      connectionId: uuid,
      services: Array.from(this._schemaService.schema.keys()),
    });

    const event = this._events;
    const send = this._send;
    ws.on("message", async function (data: Ws.RawData) {
      try {
        const structure = JSON.parse(data.toString());

        if (Guards.isSocketStructure<never>(structure)) {
          try {
            if (Guards.isSessionEvent(structure.event)) {
              await event[structure.event](ws, structure.payload);
            } else {
              send(
                ws,
                "handshake.error",
                CoreErrors.SessionService.INVALID_EVENT_TYPE
              );
              return;
            }
          } catch (e) {
            console.log(e);
          }
        } else {
          send(
            ws,
            "handshake.error",
            CoreErrors.SessionService.INVALID_DATA_STRUCTURE
          );
          return;
        }
      } catch (e) {
        send(
          ws,
          "handshake.error",
          CoreErrors.SessionService.INVALID_DATA_STRUCTURE
        );
        return;
      }
    });
  }

  private _events: NSessionService.EventRoutines = {
    [NSessionService.ClientEvent.HANDSHAKE]: async (
      ws,
      payload
    ): Promise<void> => {
      this._listenHandshake(ws, payload);
    },
    [NSessionService.ClientEvent.AUTHENTICATE]: async (
      ws,
      payload
    ): Promise<void> => {
      await this._listenAuthenticate(ws, payload);
    },
    [NSessionService.ClientEvent.UPLOAD_PAGE]: async (
      ws,
      payload
    ): Promise<void> => {
      this._listenUploadPage(ws, payload);
    },
    [NSessionService.ClientEvent.SESSION_TO_SESSION]: async (
      ws,
      payload
    ): Promise<void> => {
      await this._listenSessionToSession(ws, payload);
    },
    [NSessionService.ClientEvent.BROADCAST_TO_SERVICE]: async (
      ws: Ws.WebSocket,
      payload: unknown
    ): Promise<void> => {
      throw new Error("Event not implemented");
    },
  };

  private _listenHandshake(
    ws: Ws.WebSocket,
    payload: NSessionService.ClientHandshakePayload
  ) {
    const connection = this._getConnection(ws.uuid);
    connection.auth = false;
    connection.clientTag = payload.clientTag;
    connection.deviceId = payload.deviceId;
    connection.applicationName = payload.applicationName;
    connection.localization = payload.localization;
  }

  private async _listenAuthenticate(
    ws: Ws.WebSocket,
    data: NSessionService.ClientAuthenticatePayload
  ): Promise<void> {
    console.log(data);
    const redisProvider = container.get<IRedisProvider>(
      CoreSymbols.RedisProvider
    );

    try {
      const { payload } =
        await this._scramblerService.verifyToken<NScramblerService.SessionIdentifiers>(
          data.accessToken
        );

      const connection = this._getConnection(ws.uuid);

      const sessionInfo = await redisProvider.getItemInfo(payload.sessionId);

      const newKey = `${payload.sessionId}:${ws.uuid}`;
      await redisProvider.renameKey(
        payload.sessionId,
        `${payload.sessionId}:${ws.uuid}`
      );

      await redisProvider.setItemField(newKey, "connectionId", ws.uuid);

      if (sessionInfo) {
        connection.auth = true;
        if (connection.auth) {
          connection.sessionId = payload.sessionId;
          connection.userId = payload.userId;
        }

        ws.sessionId = payload.sessionId;
        ws.userId = payload.userId;
        ws.sessionInfo = sessionInfo;

        this._send(ws, "authenticate", {
          status: "OK",
        });
      } else {
        this._send(ws, "authenticate.error", {
          code: "1001.1003",
          message: "User not unauthorized",
        });
      }
    } catch (e) {
      this._send(ws, "authenticate.error", {
        code: "1001.1004",
        message: "jwt token has been expired",
      });
      throw e;
    }
  }

  private _listenUploadPage(_: Ws.WebSocket, payload: any) {
    this._storage.delete(payload.connectionId);
  }

  private async _listenSessionToSession<
    T extends UnknownObject = UnknownObject
  >(
    socket: Ws.WebSocket,
    payload: NSessionService.ClientSessionToSessionPayload<T>
  ): Promise<void> {
    try {
      console.log(payload);

      // const id = this._buildRedisKey({
      //   user: { id: payload.userId, count: true },
      // });
      // const userInfo = await container
      //   .get<IRedisProvider>(CoreSymbols.RedisProvider)
      //   .getItemByUserId(id);
      //
      // const connection = this._getConnection(socket.uuid);
      //
      // connection.socket.send(
      //   JSON.stringify({
      //     event: "session:to:session",
      //     payload: {
      //       event: payload.event,
      //       payload: payload.payload,
      //     },
      //   })
      // );
    } catch (e) {
      console.log(e);
    }
  }

  private _sendHandshake(
    socket: Ws.WebSocket,
    payload: NSessionService.ServerHandshakePayload
  ): void {
    this._send(socket, "handshake", payload);
  }

  public async sendSessionToSession<T>(
    event: string,
    payload: NSessionService.SessionToSessionPayload
  ): Promise<void> {
    const id = this._buildRedisKey({
      user: { id: payload.recipientId, count: true },
    });
    const sessionInfo = await container
      .get<IRedisProvider>(CoreSymbols.RedisProvider)
      .getItemByUserId<NSessionService.ConnectionId>(id);

    if (sessionInfo) {
      const connection = this._storage.get(sessionInfo.connectionId);
      if (!connection) {
        throw new Error("Connection not found");
      }

      this._send(connection.socket, "session:to:session", {
        event: event,
        payload: payload.payload,
      });
    }
  }

  private _send<T>(
    socket: Ws.WebSocket,
    event: NSessionService.ServerEvent,
    payload: T
  ): void {
    socket.send(JSON.stringify({ event, payload }));
  }

  private _buildRedisKey(options?: NSessionService.RedisKeyOptions): string {
    let id = "service:" + this._conf.serverTag;
    if (options) {
      if (options.user) {
        id += ":userId:" + options.user.id;
        if (options.user.count) {
          id += ":*";
        }
      }
      if (options.sessionId) {
        id += ":sessionId:" + options.sessionId;
      }
    } else {
      id += ":*";
    }

    return id;
  }

  private _getConnection(uuid: string) {
    const connection = this._storage.get(uuid);
    if (!connection) {
      throw new Error("Connection not found. Login again");
    }

    return connection;
  }
}
