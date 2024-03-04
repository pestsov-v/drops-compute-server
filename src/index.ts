import { SCHEMA_SERVICES } from "@common";

export * from "./vendor";
export * from "./utility/helpers";
export * from "./utility/guards";
export * from "./common";

import { container } from "./ioc/core.ioc";
import { CoreSymbols } from "@CoreSymbols";
import { IInitiator, ServiceStructure } from "@Core/Types";

const setServices = (services: ServiceStructure[]): void => {
  SCHEMA_SERVICES.push(...services);
};

const serverInitiator = container.get<IInitiator>(CoreSymbols.Initiator);
export { serverInitiator, setServices };
