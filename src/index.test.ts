import { setServices } from "./index";

export * from "./vendor";
export * from "./utility/helpers";
export * from "./utility/guards";
export * from "./common";

import { container } from "./ioc/core.ioc";
import { CoreSymbols } from "@CoreSymbols";
import { IInitiator } from "@Core/Types";
import { SysAdminService } from "./test_schema/entry";

const serverInitiator = container.get<IInitiator>(CoreSymbols.Initiator);
export { serverInitiator };

setServices([SysAdminService]);

serverInitiator.start();
