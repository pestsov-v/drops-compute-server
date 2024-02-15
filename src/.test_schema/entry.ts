import { setService } from "@Vendor";
import { TestEntryPoint } from "./domains/test.entry-point";
import { ServiceDocsRu } from "./service.docs.ru";
import { setServices } from "../index";

export const SysAdminService = setService(
  "Test",
  [TestEntryPoint],
  ServiceDocsRu
);
