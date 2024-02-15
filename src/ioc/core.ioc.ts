import 'reflect-metadata';
import { Packages } from '@Packages';
const { Container } = Packages.inversify;

const mode = process.env.CAP_SERVER_MODE ?? 'default';
const modulePath = `./core.${mode}.ioc.module`;

const { CoreModule } = require(modulePath);

const container = new Container();
container.load(CoreModule);

export { container };
