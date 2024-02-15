import { Packages } from "@Packages";
const { injectable, inject } = Packages.inversify;
import { container } from "../ioc/core.ioc";
import { CoreSymbols } from "@CoreSymbols";

import {
  Mongoose,
  Nullable,
  UnknownObject,
  IBaseOperationAgent,
  IContextService,
  ICoreError,
  IExceptionProvider,
  IFunctionalityAgent,
  IIntegrationAgent,
  IMongodbConnector,
  IMongodbProvider,
  ISchemaAgent,
  NAbstractHttpAdapter,
  NMongodbProvider,
} from "@Core/Types";

@injectable()
export class MongodbProvider implements IMongodbProvider {
  constructor(
    @inject(CoreSymbols.MongodbConnector)
    private readonly _mongodbConnector: IMongodbConnector,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public setModels(fnModels: NMongodbProvider.SchemaInfo<unknown>[]) {
    const { connection } = this._mongodbConnector;

    fnModels.forEach((fn) => {
      const agents: NAbstractHttpAdapter.Agents = {
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
      };

      const model = fn.getSchema(agents);

      const schema = model.options
        ? new connection.Schema(model.definition, model.options)
        : new connection.Schema(model.definition);

      connection.model(fn.model, schema);
    });
  }

  public async create<TRawDocType>(
    model: string,
    docs: Mongoose.Docs<TRawDocType>,
    options?: Mongoose.SaveOptions
  ): Promise<Mongoose.AnyKeys<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? await models[model].create<TRawDocType>(docs, options)
        : await models[model].create<TRawDocType>(docs);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async insertMany<TRawDocType>(
    model: string,
    docs: Mongoose.Docs<TRawDocType>,
    options?: Mongoose.InsertManyOptions
  ): Promise<Mongoose.InsertManyResult> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? await models[model].insertMany(docs, options)
        : await models[model].insertMany(docs);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async countDocuments<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.CountDocumentsResult<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? await models[model].countDocuments(filter, options)
        : await models[model].countDocuments(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async aggregate<TRawDocType>(
    model: string,
    pipeline?: Mongoose.PipelineStage[],
    options?: Mongoose.AggregateOptions
  ): Promise<Mongoose.AggregateResult<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? await models[model].aggregate(pipeline, options)
        : await models[model].aggregate(pipeline);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async hydrate<TRawDocType>(
    model: string,
    obj: UnknownObject,
    projection?: Mongoose.AnyObject,
    options?: Mongoose.HydrateOptions
  ): Promise<Mongoose.HydrateResult<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options && projection
        ? await models[model].hydrate(obj, projection, options)
        : projection
        ? await models[model].hydrate(obj, projection)
        : await models[model].hydrate(obj);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async populate<TRawDocType>(
    model: string,
    docs: Array<Mongoose.Docs<TRawDocType>>,
    options: Mongoose.PopulateOptions | Array<Mongoose.PopulateOptions> | string
  ): Promise<Mongoose.PopulateResult<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return models[model].populate(docs, options);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async validate(
    model: string,
    optional: unknown,
    pathsToValidate: Mongoose.PathsToValidate
  ): Promise<void> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return models[model].validate(optional, pathsToValidate);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async exists<TRawDocType>(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>
  ): Promise<Mongoose.ExistsResult<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return models[model].exists(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async find<TRawDocType>(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    projection?: Nullable<Mongoose.ProjectionType<TRawDocType>>,
    options?: Nullable<Mongoose.QueryOptions<TRawDocType>>
  ): Mongoose.FindResult<TRawDocType> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options && projection
        ? await models[model].find(filter, projection, options)
        : projection
        ? await models[model].find(filter, projection)
        : await models[model].find(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async findById<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    projection?: Mongoose.ProjectionType<Nullable<TRawDocType>>,
    options?: Mongoose.QueryOptions<Nullable<TRawDocType>>
  ): Promise<Mongoose.FindByIdResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options && projection
        ? await models[model].findById(id, projection, options)
        : projection
        ? await models[model].findById(id, projection)
        : await models[model].findById(id);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async findByIdAndUpdate<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    update: Mongoose.UpdateQuery<TRawDocType>,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult?: true }
  ): Promise<Mongoose.FindByIdAndUpdateResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return models[model].findByIdAndUpdate(id, update, options);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async findByIdAndDelete<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindByIdAndDeleteResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? await models[model].findByIdAndDelete(id, options)
        : await models[model].findByIdAndDelete(id);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async findOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    projection?: Mongoose.ProjectionType<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindOneResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options && projection
        ? await models[model].findOne(filter, projection, options)
        : projection
        ? await models[model].findOne(filter, projection)
        : await models[model].findOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async findOneAndUpdate<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    update: Mongoose.UpdateQuery<TRawDocType>,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
  ): Promise<Mongoose.FindOneAndUpdateResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return models[model].findByIdAndUpdate(id, update, options);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async findOneAndReplace<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    replacement: TRawDocType | Mongoose.AnyObject,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
  ): Promise<Mongoose.FindOneAndReplaceResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return models[model].findOneAndReplace(filter, replacement, options);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async findOneAndDelete<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindOneAndDeleteResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? models[model].findByIdAndDelete(filter, options)
        : models[model].findByIdAndDelete(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async updateOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    update?: Mongoose.UpdateQuery<
      TRawDocType | Mongoose.UpdateWithAggregationPipeline
    >,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.UpdateOneResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options && update
        ? await models[model].updateOne(filter, update, options)
        : update
        ? await models[model].updateOne(filter, update)
        : await models[model].updateOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async updateMany<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    update?: Mongoose.UpdateQuery<
      TRawDocType | Mongoose.UpdateWithAggregationPipeline
    >,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.UpdateManyResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options && update
        ? await models[model].updateMany(filter, update, options)
        : update
        ? await models[model].updateMany(filter, update)
        : await models[model].updateMany(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async replaceOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    replacement?: TRawDocType | Mongoose.AnyObject,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.ReplaceOneResult<ResultDoc>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options && replacement
        ? await models[model].replaceOne(filter, replacement, options)
        : replacement
        ? await models[model].replaceOne(filter, replacement)
        : await models[model].replaceOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async deleteOne<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.DeleteOne<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? await models[model].deleteOne(filter, options)
        : await models[model].deleteOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public async deleteMany<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.DeleteMany<TRawDocType>> {
    const models = this._mongodbConnector.connection.models;
    if (!models) this._throwModelsError();

    try {
      return options
        ? await models[model].deleteMany(filter, options)
        : await models[model].deleteMany(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private _throwModelsError(): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError("Models not initialize", {
        namespace: MongodbProvider.name,
        errorType: "FAIL",
        requestId: this._contextService.store.requestId,
      });
  }

  private _catchError(e: any): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(e, {
        namespace: MongodbProvider.name,
        errorType: "FATAL",
        requestId: this._contextService.store.requestId,
      });
  }
}
