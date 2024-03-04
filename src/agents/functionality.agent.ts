import { Packages } from "@Packages";
const { injectable, inject } = Packages.inversify;
const { v4 } = Packages.uuid;
import { container } from "../ioc/core.ioc";
import { CoreSymbols } from "@CoreSymbols";

import {
  Joi,
  Jwt,
  Mongoose,
  Nullable,
  UnknownObject,
  IDiscoveryService,
  IExceptionProvider,
  IFunctionalityAgent,
  ILocalizationService,
  IMongodbProvider,
  ISchemaExceptionError,
  IScramblerService,
  ISessionService,
  IValidatorError,
  NExceptionProvider,
  NFunctionalityAgent,
  NScramblerService,
  NSchemaService,
} from "@Core/Types";

@injectable()
export class FunctionalityAgent implements IFunctionalityAgent {
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.SessionService)
    private readonly _sessionService: ISessionService,
    @inject(CoreSymbols.LocalizationService)
    private readonly _localizationService: ILocalizationService
  ) {}

  public get discovery(): NFunctionalityAgent.Discovery {
    return {
      getMandatory: <T>(name: string): T => {
        return this._discoveryService.getSchemaMandatory<T>(name);
      },
      getString: (name: string, def: string): string => {
        return this._discoveryService.getSchemaString(name, def);
      },
      getNumber: (name: string, def: number): number => {
        return this._discoveryService.getSchemaNumber(name, def);
      },
      getBoolean: (name: string, def: boolean): boolean => {
        return this._discoveryService.getSchemaBoolean(name, def);
      },
      getArray: <T>(name: string, def: Array<T>): Array<T> => {
        return this._discoveryService.getSchemaArray<T>(name, def);
      },
      getBuffer: async (path: string): Promise<Buffer> => {
        return this._discoveryService.getSchemaBuffer(path);
      },
    };
  }

  public get mongoose(): NFunctionalityAgent.Mongoose {
    return {
      create: async <T>(
        model: string,
        docs: Mongoose.Docs<T>,
        options: Mongoose.SaveOptions
      ): Promise<Mongoose.AnyKeys<T>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .create<T>(model, docs, options);
      },
      insertMany: async <TRawDocType, DocContents = TRawDocType>(
        model: string,
        docs: Mongoose.Docs<TRawDocType>,
        options?: Mongoose.InsertManyOptions
      ): Promise<Mongoose.InsertManyResult> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .insertMany<TRawDocType, DocContents>(model, docs, options);
      },
      aggregate: async <TRawDocType>(
        model: string,
        pipeline?: Mongoose.PipelineStage[],
        options?: Mongoose.AggregateOptions
      ): Promise<Mongoose.AggregateResult<TRawDocType>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .aggregate<TRawDocType>(model, pipeline, options);
      },
      hydrate: async <TRawDocType>(
        model: string,
        obj: UnknownObject,
        projection?: Mongoose.AnyObject,
        options?: Mongoose.HydrateOptions
      ): Promise<Mongoose.HydrateResult<TRawDocType>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .hydrate<TRawDocType>(model, obj, projection, options);
      },
      populate: async <TRawDocType>(
        model: string,
        docs: Array<Mongoose.Docs<TRawDocType>>,
        options:
          | Mongoose.PopulateOptions
          | Array<Mongoose.PopulateOptions>
          | string
      ): Promise<Mongoose.PopulateResult<TRawDocType>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .populate<TRawDocType>(model, docs, options);
      },
      validate: async (
        name: string,
        optional: unknown,
        pathsToValidate: Mongoose.PathsToValidate
      ): Promise<void> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .validate(name, optional, pathsToValidate);
      },
      countDocuments: async <TRawDocType>(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.CountDocumentsResult<TRawDocType>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .countDocuments<TRawDocType>(model, filter, options);
      },
      exists: async <TRawDocType>(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>
      ): Promise<Mongoose.ExistsResult<TRawDocType>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .exists<TRawDocType>(model, filter);
      },
      find: async <TRawDocType>(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>,
        projection?: Nullable<Mongoose.ProjectionType<TRawDocType>>,
        options?: Nullable<Mongoose.QueryOptions<TRawDocType>>
      ): Mongoose.FindResult<TRawDocType> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .find<TRawDocType>(model, filter, projection, options);
      },
      findById: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id: string,
        projection?: Mongoose.ProjectionType<TRawDocType | null>,
        options?: Mongoose.QueryOptions<TRawDocType | null>
      ): Promise<Mongoose.FindByIdResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .findById<TRawDocType, ResultDoc>(model, id, projection, options);
      },
      findByIdAndUpdate: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id: string,
        update: Mongoose.UpdateQuery<TRawDocType>,
        options: Mongoose.QueryOptions<TRawDocType> & { rawResult?: true }
      ): Promise<Mongoose.FindByIdAndUpdateResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .findByIdAndUpdate<TRawDocType, ResultDoc>(
            model,
            id,
            update,
            options
          );
      },
      findByIdAndDelete: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id?: string,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.FindByIdAndDeleteResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .findByIdAndDelete<TRawDocType, ResultDoc>(model, id, options);
      },
      findOne: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        projection?: Mongoose.ProjectionType<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.FindOneResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .findOne<TRawDocType, ResultDoc>(model, filter, projection, options);
      },
      findOneAndUpdate: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id: string,
        update: Mongoose.UpdateQuery<TRawDocType>,
        options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
      ): Promise<Mongoose.FindOneAndUpdateResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .findOneAndUpdate<TRawDocType, ResultDoc>(model, id, update, options);
      },
      findOneAndReplace: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>,
        replacement: TRawDocType | Mongoose.AnyObject,
        options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
      ): Promise<Mongoose.FindOneAndReplaceResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .findOneAndReplace<TRawDocType, ResultDoc>(
            model,
            filter,
            replacement,
            options
          );
      },
      findOneAndDelete: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.FindOneAndDeleteResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .findOneAndDelete<TRawDocType, ResultDoc>(model, filter, options);
      },
      updateOne: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        update?: Mongoose.UpdateQuery<
          TRawDocType | Mongoose.UpdateWithAggregationPipeline
        >,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.UpdateOneResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .updateOne<TRawDocType, ResultDoc>(model, filter, update, options);
      },
      updateMany: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        update?: Mongoose.UpdateQuery<
          TRawDocType | Mongoose.UpdateWithAggregationPipeline
        >,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.UpdateManyResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .updateMany<TRawDocType, ResultDoc>(model, filter, update, options);
      },
      replaceOne: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        replacement?: TRawDocType | Mongoose.AnyObject,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.ReplaceOneResult<ResultDoc>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .replaceOne<TRawDocType, ResultDoc>(
            model,
            filter,
            replacement,
            options
          );
      },
      deleteOne: async <TRawDocType>(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.DeleteOne<TRawDocType>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .deleteOne<TRawDocType>(model, filter, options);
      },
      deleteMany: async <TRawDocType>(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.DeleteMany<TRawDocType>> => {
        return container
          .get<IMongodbProvider>(CoreSymbols.MongodbProvider)
          .deleteMany<TRawDocType>(model, filter, options);
      },
    };
  }

  public get utils(): NFunctionalityAgent.Utils {
    return {
      uuid: v4(),
    };
  }

  public get scrambler(): NFunctionalityAgent.Scrambler {
    return {
      accessExpiredAt: this._scramblerService.accessExpiredAt,
      refreshExpiredAt: this._scramblerService.refreshExpiredAt,
      generateAccessToken: <
        T extends UnknownObject & NScramblerService.SessionIdentifiers
      >(
        payload: T,
        algorithm?: Jwt.Algorithm
      ): NScramblerService.ConvertJwtInfo => {
        return this._scramblerService.generateAccessToken(payload, algorithm);
      },
      generateRefreshToken: <
        T extends UnknownObject & NScramblerService.SessionIdentifiers
      >(
        payload: T,
        algorithm?: Jwt.Algorithm
      ): NScramblerService.ConvertJwtInfo => {
        return this._scramblerService.generateRefreshToken(payload, algorithm);
      },
      verifyToken: async <T extends UnknownObject>(
        token: string
      ): Promise<NScramblerService.JwtTokenPayload<T>> => {
        return this._scramblerService.verifyToken(token);
      },
      createHash: (algorithm?: Jwt.Algorithm): string => {
        return this._scramblerService.createHash(algorithm);
      },
      hashedPassword: async (password: string): Promise<string> => {
        return this._scramblerService.hashedPassword(password);
      },
      comparePassword: async (
        candidatePassword: string,
        userPassword: string
      ): Promise<boolean> => {
        return this._scramblerService.comparePassword(
          candidatePassword,
          userPassword
        );
      },
    };
  }

  public get sessions(): NFunctionalityAgent.Sessions {
    return {
      http: {
        openHttpSession: async <T extends UnknownObject>(
          payload: T
        ): Promise<string> => {
          return this._sessionService.openHttpSession<T>(payload);
        },
        getHttpSessionInfo: async <T extends UnknownObject>(
          userId: string,
          sessionId: string
        ): Promise<Nullable<T>> => {
          return this._sessionService.getHttpSessionInfo<T>(userId, sessionId);
        },
        getHttpSessionCount: async (userId): Promise<number> => {
          return this._sessionService.getHttpSessionCount(userId);
        },
        deleteHttpSession: async (
          userId: string,
          sessionId: string
        ): Promise<void> => {
          return this._sessionService.deleteHttpSession(userId, sessionId);
        },
      },
      ws: {
        sendSessionToSession: async (event, payload): Promise<void> => {
          try {
            return this._sessionService.sendSessionToSession(event, payload);
          } catch (e) {
            throw e;
          }
        },
      },
    };
  }

  public get exception(): NFunctionalityAgent.Exception {
    return {
      throwValidation: (
        errors: NSchemaService.ValidateErrors
      ): IValidatorError => {
        return container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwValidation(errors);
      },
      throwException: (
        msg: string,
        options?: NExceptionProvider.SchemaExceptionOptions
      ): ISchemaExceptionError => {
        const trace =
          options && options.isNotShowTrace ? "" : new Error().stack || "";

        return container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwSchemaException(msg, { trace, ...options });
      },
    };
  }

  public get localization(): NFunctionalityAgent.Localization {
    return {
      defaultLanguages: this._localizationService.defaultLanguages,
      supportedLanguages: this._localizationService.supportedLanguages,
    };
  }
}
