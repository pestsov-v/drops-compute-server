import { Packages } from "@Packages";
const { ContainerModule } = Packages.inversify;
import { CoreSymbols } from "@CoreSymbols";

import { Initiator } from "../initiator";
import { FastifyHttpAdapter } from "../adapters";
import { FrameworkFactory } from "../factories";
import {
  DocumentationLoader,
  SchemaLoader,
  SpecificationLoader,
} from "../loaders";
import { SpecificationBaseOperation } from "../base-operations";
import {
  FunctionalityAgent,
  SchemaAgent,
  BaseOperationAgent,
  IntegrationAgent,
} from "../agents";
import {
  MongodbConnector,
  RedisConnector,
  ComputeConnector,
  TypeormConnector,
} from "../connectors";
import {
  ContextService,
  DiscoveryService,
  GetawayService,
  LocalizationService,
  LoggerService,
  SchemaService,
  ScramblerService,
  SessionService,
  SpecificationService,
} from "../services";
import {
  MongodbProvider,
  SchemaProvider,
  ExceptionProvider,
  TypeormProvider,
  RedisProvider,
} from "../providers";

import {
  Inversify,
  IAbstractFactory,
  IAbstractFrameworkAdapter,
  IBaseOperationAgent,
  IContextService,
  IExceptionProvider,
  IFunctionalityAgent,
  IInitiator,
  ILoggerService,
  IMongodbConnector,
  IMongodbProvider,
  ISchemaAgent,
  ISchemaLoader,
  ISchemaProvider,
  ISchemaService,
  IComputeConnector,
  ITypeormConnector,
  ITypeormProvider,
  IRedisConnector,
  IRedisProvider,
  IScramblerService,
  ISessionService,
  ILocalizationService,
  IMailIntegration,
  IIntegrationConnector,
  IIntegrationAgent,
  IAbstractWebsocketAdapter,
  IDiscoveryService,
  ISpecificationService,
  ISpecificationLoader,
  ISpecificationBaseOperation,
  IAbstractService,
  IDocumentationLoader,
} from "@Core/Types";
import { MailIntegration } from "../integrations";
import { IntegrationConnector } from "../connectors/integration.connector";
import { WsWsAdapter } from "../adapters/ws-adapters";

export const CoreModule = new ContainerModule(
  (bind: Inversify.interfaces.Bind) => {
    // Initiator
    bind<IInitiator>(CoreSymbols.Initiator).to(Initiator).inRequestScope();

    // Connectors
    bind<IComputeConnector>(CoreSymbols.ServiceConnector)
      .to(ComputeConnector)
      .inSingletonScope();
    bind<IMongodbConnector>(CoreSymbols.MongodbConnector)
      .to(MongodbConnector)
      .inSingletonScope();
    bind<ITypeormConnector>(CoreSymbols.TypeormConnector)
      .to(TypeormConnector)
      .inSingletonScope();
    bind<IRedisConnector>(CoreSymbols.RedisConnector)
      .to(RedisConnector)
      .inSingletonScope();
    bind<IIntegrationConnector>(CoreSymbols.IntegrationConnector)
      .to(IntegrationConnector)
      .inSingletonScope();

    // Services
    bind<IDiscoveryService>(CoreSymbols.DiscoveryService)
      .to(DiscoveryService)
      .inSingletonScope();
    bind<ILoggerService>(CoreSymbols.LoggerService)
      .to(LoggerService)
      .inSingletonScope();
    bind<ISchemaService>(CoreSymbols.SchemaService)
      .to(SchemaService)
      .inSingletonScope();
    bind<IContextService>(CoreSymbols.ContextService)
      .to(ContextService)
      .inSingletonScope();
    bind<IScramblerService>(CoreSymbols.ScramblerService)
      .to(ScramblerService)
      .inSingletonScope();
    bind<ISessionService>(CoreSymbols.SessionService)
      .to(SessionService)
      .inSingletonScope();
    bind<IAbstractService>(CoreSymbols.GetawayService)
      .to(GetawayService)
      .inSingletonScope();
    bind<ISpecificationService>(CoreSymbols.SpecificationService)
      .to(SpecificationService)
      .inSingletonScope();
    bind<ILocalizationService>(CoreSymbols.LocalizationService)
      .to(LocalizationService)
      .inSingletonScope();

    // Providers
    bind<ISchemaProvider>(CoreSymbols.SchemaProvider)
      .to(SchemaProvider)
      .inTransientScope();
    bind<IMongodbProvider>(CoreSymbols.MongodbProvider)
      .to(MongodbProvider)
      .inTransientScope();
    bind<ITypeormProvider>(CoreSymbols.TypeormProvider)
      .to(TypeormProvider)
      .inTransientScope();
    bind<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .to(ExceptionProvider)
      .inTransientScope();
    bind<IRedisProvider>(CoreSymbols.RedisProvider)
      .to(RedisProvider)
      .inTransientScope();

    // Integrations
    bind<IMailIntegration>(CoreSymbols.MailIntegration)
      .to(MailIntegration)
      .inSingletonScope();

    // Loaders
    bind<ISchemaLoader>(CoreSymbols.SchemaLoader)
      .to(SchemaLoader)
      .inSingletonScope();
    bind<ISpecificationLoader>(CoreSymbols.SpecificationLoader)
      .to(SpecificationLoader)
      .inSingletonScope();
    bind<IDocumentationLoader>(CoreSymbols.DocumentationLoader)
      .to(DocumentationLoader)
      .inSingletonScope();

    // Agents
    bind<ISchemaAgent>(CoreSymbols.SchemaAgent)
      .to(SchemaAgent)
      .inTransientScope();
    bind<IIntegrationAgent>(CoreSymbols.IntegrationAgent)
      .to(IntegrationAgent)
      .inTransientScope();
    bind<IFunctionalityAgent>(CoreSymbols.FunctionalityAgent)
      .to(FunctionalityAgent)
      .inTransientScope();
    bind<IBaseOperationAgent>(CoreSymbols.BaseOperationAgent)
      .to(BaseOperationAgent)
      .inTransientScope();

    // Adapters
    bind<IAbstractFrameworkAdapter>(CoreSymbols.FastifyAdapter)
      .to(FastifyHttpAdapter)
      .inSingletonScope();
    bind<IAbstractWebsocketAdapter>(CoreSymbols.WsAdapter)
      .to(WsWsAdapter)
      .inSingletonScope();

    // Factories
    bind<IAbstractFactory>(CoreSymbols.FrameworkFactory)
      .to(FrameworkFactory)
      .inSingletonScope();

    // base-operations
    bind<ISpecificationBaseOperation>(CoreSymbols.SpecificationBaseOperation)
      .to(SpecificationBaseOperation)
      .inTransientScope();
  }
);
