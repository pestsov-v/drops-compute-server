import { Mongoose } from "../packages/packages";
import { NAbstractHttpAdapter } from "../adapters";
import { Nullable, UnknownObject } from "@Utility/Types";
import { NFunctionalityAgent } from "../agents";

export interface IMongodbProvider {
  setModels(models: NMongodbProvider.SchemaInfo<unknown>[]): void;
  create<TRawDocType>(
    model: string,
    docs: Mongoose.Docs<TRawDocType>,
    options?: Mongoose.SaveOptions
  ): Promise<Mongoose.AnyKeys<TRawDocType>>;
  insertMany<TRawDocType, DocContents = TRawDocType>(
    model: string,
    docs: Mongoose.Docs<TRawDocType>,
    options?: Mongoose.InsertManyOptions
  ): Promise<Mongoose.InsertManyResult<TRawDocType>>;
  aggregate<TRawDocType>(
    model: string,
    pipeline?: Mongoose.PipelineStage[],
    options?: Mongoose.AggregateOptions
  ): Promise<Mongoose.AggregateResult<TRawDocType>>;
  hydrate<TRawDocType>(
    model: string,
    obj: UnknownObject,
    projection?: Mongoose.AnyObject,
    options?: Mongoose.HydrateOptions
  ): Promise<Mongoose.HydrateResult<TRawDocType>>;
  populate<TRawDocType>(
    model: string,
    docs: Array<Mongoose.Docs<TRawDocType>>,
    options: Mongoose.PopulateOptions | Array<Mongoose.PopulateOptions> | string
  ): Promise<Mongoose.PopulateResult<TRawDocType>>;
  validate(
    model: string,
    optional: unknown,
    pathsToValidate: Mongoose.PathsToValidate
  ): Promise<void>;
  countDocuments<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.CountDocumentsResult<TRawDocType>>;
  exists<TRawDocType>(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>
  ): Promise<Mongoose.ExistsResult<TRawDocType>>;
  find<TRawDocType>(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    projection?: Nullable<Mongoose.ProjectionType<TRawDocType>>,
    options?: Nullable<Mongoose.QueryOptions<TRawDocType>>
  ): Mongoose.FindResult<TRawDocType>;
  findById<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    projection?: Mongoose.ProjectionType<TRawDocType | null>,
    options?: Mongoose.QueryOptions<TRawDocType | null>
  ): Promise<Mongoose.FindByIdResult<ResultDoc>>;
  findByIdAndUpdate<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    update: Mongoose.UpdateQuery<TRawDocType>,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult?: true }
  ): Promise<Mongoose.FindByIdAndUpdateResult<ResultDoc>>;
  findByIdAndDelete<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id?: string,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindByIdAndDeleteResult<ResultDoc>>;
  findOne<TRawDocType, ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    projection?: Mongoose.ProjectionType<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindOneResult<ResultDoc>>;
  findOneAndUpdate<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    update: Mongoose.UpdateQuery<TRawDocType>,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
  ): Promise<Mongoose.FindOneAndUpdateResult<ResultDoc>>;
  findOneAndReplace<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    replacement: TRawDocType | Mongoose.AnyObject,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
  ): Promise<Mongoose.FindOneAndReplaceResult<ResultDoc>>;
  findOneAndDelete<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindOneAndDeleteResult<ResultDoc>>;
  updateOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    update?: Mongoose.UpdateQuery<
      TRawDocType | Mongoose.UpdateWithAggregationPipeline
    >,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.UpdateOneResult<ResultDoc>>;
  updateMany<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    update?: Mongoose.UpdateQuery<
      TRawDocType | Mongoose.UpdateWithAggregationPipeline
    >,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.UpdateManyResult<ResultDoc>>;
  replaceOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    replacement?: TRawDocType | Mongoose.AnyObject,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.ReplaceOneResult<ResultDoc>>;
  deleteOne<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.DeleteOne<TRawDocType>>;
  deleteMany<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.DeleteMany<TRawDocType>>;
}

export namespace NMongodbProvider {
  export type Schema<T> = {
    definition: Mongoose.SchemaDefinition<T>;
    options?: Mongoose.SchemaOptions;
  };

  export type SchemaFn<T> = (
    agents: NAbstractHttpAdapter.Agents
  ) => NMongodbProvider.Schema<T>;

  export type SchemaInfo<T> = {
    model: string;
    getSchema: NMongodbProvider.SchemaFn<T>;
  };

  export type MongooseHandler = <
    A extends UnknownObject = UnknownObject,
    R = void
  >(
    ...args: A
  ) => R;
  export type MongooseHandlers<T = UnknownObject> = {
    [K in keyof T]: MongooseHandler<Parameters<T[K]>, ReturnType<T[K]>>;
  };

  export type DocumentHandler = <
    A extends UnknownObject = UnknownObject,
    R = void
  >(
    mongoose: NFunctionalityAgent.Mongoose,
    ...args: A
  ) => R;
  export type DocumentHandlers<T = UnknownObject> = {
    [K in keyof T]: MongooseHandler<Parameters<T[K]>, ReturnType<T[K]>>;
  };
}
