import { StringObject, UnknownObject, Voidable } from "../utility";
import { NAbstractHttpAdapter } from "../adapters";
import { NContextService } from "../services";
import { NMongodbProvider } from "../providers";

export type ControllerHandler<
  BODY = UnknownObject,
  PARAMS extends StringObject = StringObject,
  HEADERS extends StringObject = StringObject
> = NAbstractHttpAdapter.Handler<BODY, PARAMS, HEADERS>;

export type SchemaRequest<
  BODY = UnknownObject,
  PARAMS extends StringObject | void = void,
  HEADERS extends StringObject = StringObject
> = NAbstractHttpAdapter.SchemaRequest<BODY, PARAMS, HEADERS, "fastify">;
export type SchemaResponse = Voidable<NAbstractHttpAdapter.SchemaResponse>;
export type Context<T = void> = NAbstractHttpAdapter.Context<T>;
export type Agents = NAbstractHttpAdapter.Agents;
export type Store = NContextService.Store;
export type MongoSchemaDefinition<T = UnknownObject> =
  NMongodbProvider.Schema<T>;

export type * from "./setters";
