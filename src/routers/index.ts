import BasicRouter from './basic'
import CrossroadsRouter from './crossroads'
import { Options } from '../defaults'
import IRouter from './irouter'

export enum Routers {
    Basic = 0,
    Crossroads = 1,
    Navigo = 2
}

export function CreateRouter(routesParam: string[], settings: Options): IRouter {
    switch (settings.router) {
        case Routers.Crossroads:
            return new CrossroadsRouter(routesParam, settings);
        default: return new BasicRouter(routesParam, settings);
    }
}