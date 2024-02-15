import { Ws } from '../packages/packages';
import { Nullable, UnknownObject } from '../utility';
import { IAbstractService  } from './abstract.service';
import {IBaseOperationAgent, IIntegrationAgent} from '../agents'

export interface ISessionService extends IAbstractService {
  openHttpSession<T extends UnknownObject>(userId: string, payload: T): Promise<string>;
  getHttpSessionInfo<T extends UnknownObject>(
    userId: string,
    sessionId: string
  ): Promise<Nullable<T>>;
  getHttpSessionCount(userId: string): Promise<number>;
  deleteHttpSession(userId: string, sessionId: string): Promise<void>;

  setWsConnection(ws: Ws.WebSocket, connection: NSessionService.ConnectionDetails): void;
  sendSessionToSession(
    event: string,
    payload: NSessionService.SessionToSessionPayload
  ): Promise<void>;
}

export namespace NSessionService {
  export type ServerEvent =
    | 'server:handshake'
    | 'server:handshake:error'
    | 'server:authenticate'
    | 'server:authenticate:error'
    | 'server:session:to:session'
    | 'server:broadcast:to:service';

  export const enum ClientEvent {
    HANDSHAKE = 'client:handshake',
    UPLOAD_PAGE = 'client:upload:page',
    AUTHENTICATE = 'client:authenticate',
    SESSION_TO_SESSION = 'client:session:to:session',
    BROADCAST_TO_SERVICE = 'client:broadcast:to:service',
  }

  export type ConnectionId = {
    connectionId: string;
  };

  export type EventHandler<T> = (ws: Ws.WebSocket, payload: T) => Promise<void>;

  export type RedisKeyOptions = {
    user?: {
      id: string;
      count?: boolean;
    };
    sessionId?: string;
  };

  export type ServerHandshakePayload = {
    serverTag: string;
    service: string;
    connectionId: string;
  };

  export type ClientHandshakePayload = {
    localization?: string;
    clientTag?: string;
    applicationName?: string;
    deviceId?: string;
  };

  export type ClientAuthenticatePayload = {
    accessToken: string;
  };

  export type ClientSessionToSessionPayload<T extends UnknownObject = UnknownObject> = {
    event: string;
    token: string;
    corePayload: {
      userId: string;
    };
    schemaPayload: T;
  };

  export type ReSendPayload = {
    type: NSessionService.ServerEvent;
    eventName: string;
    payload: UnknownObject;
  };

  export type Listener = {
    isPrivateUser: boolean;
    isPrivateOrganization: boolean;
    listener: (agent: Agents, context: Context) => Promise<void | ReSendPayload>;
  };

  export type Agents = {
    integrationAgent: IIntegrationAgent;
    baseAgent: IBaseOperationAgent;
  };

  export type Context = {};

  export type Listeners<K extends string> = {
    [key in E]: Listener;
  };

  export type EventPayload<E extends ClientEvent = ClientEvent> = E extends ClientEvent.HANDSHAKE
    ? ClientHandshakePayload
    : E extends ClientEvent.AUTHENTICATE
    ? ClientAuthenticatePayload
    : E extends ClientEvent.UPLOAD_PAGE
    ? string
    : E extends ClientEvent.SESSION_TO_SESSION
    ? ClientSessionToSessionPayload
    : E extends ClientEvent.BROADCAST_TO_SERVICE
    ? string
    : never;

  export type EventRoutine<E extends ClientEvent = ClientEvent> = EventHandler<EventPayload<E>>;

  export type EventRoutines<K extends ClientEvent = ClientEvent> = {
    [key in K]: EventRoutine<key>;
  };

  export type ClientData<E extends ClientEvent = ClientEvent> = {
    event: string;
    payload: CE;
  };

  export type Config = {
    serverTag: string;
  };

  export interface ConnectionDetails {
    userAgent?: string;
    acceptLanguage?: string;
    websocketKey?: string;
    ip?: string;
  }

  export type SessionToSessionPayload = {
    recipientId: string;
    payload?: UnknownObject;
  };

  export interface BaseConnection extends ConnectionDetails {
    auth: boolean;
    localization?: string;
    clientTag?: string;
    applicationName?: string;
    deviceId?: string;
    fingerprint?: string;
    socket: Ws.WebSocket;
    connectionCount: number;
  }
  export interface AnonymousConnection extends BaseConnection {
    auth: false;
  }
  export interface AuthConnection<T extends UnknownObject = UnknownObject> extends BaseConnection {
    auth: true;
    userId: string;
    sessionId: string;
    sessionInfo: T;
  }

  export type Connection<T extends UnknownObject = UnknownObject> =
    | AnonymousConnection
    | AuthConnection<T>;

  export type ConnectionStorage = Map<string, Connection>;
}
